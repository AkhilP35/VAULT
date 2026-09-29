import Database from '@tauri-apps/plugin-sql';
import type { VaultRecord, RecordField } from './types';
import { encryptString, decryptString } from './crypto';

let dbPromise: Promise<Database> | null = null;

// Opens (or creates) vault.db and makes sure the tables exist.
// Only runs once — later calls reuse the same connection.
function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load('sqlite:vault.db').then(async (db) => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS records (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          notes TEXT,
          tags TEXT,
          fields TEXT,
          created_at TEXT,
          updated_at TEXT
        )
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS vault_meta (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `);
      return db;
    });
  }
  return dbPromise;
}

// ---- Vault setup / unlock metadata (salt + check value, never the password) ----

export async function getVaultMeta(): Promise<{ salt: string; check: string } | null> {
  const db = await getDb();
  const rows = await db.select<{ key: string; value: string }[]>('SELECT * FROM vault_meta');
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  if (!map.salt || !map.check) return null;
  return { salt: map.salt, check: map.check };
}

export async function setVaultMeta(salt: string, check: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO vault_meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    ['salt', salt]
  );
  await db.execute(
    `INSERT INTO vault_meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    ['check', check]
  );
}

// ---- Records (title, notes, and any "secret" field are encrypted at rest) ----

interface RecordRow {
  id: string;
  title: string;
  category: string;
  notes: string | null;
  tags: string | null;
  fields: string | null;
  created_at: string;
  updated_at: string;
}

export async function loadAllRecords(key: CryptoKey): Promise<VaultRecord[]> {
  const db = await getDb();
  const rows = await db.select<RecordRow[]>('SELECT * FROM records ORDER BY updated_at DESC');

  const records: VaultRecord[] = [];
  for (const row of rows) {
    const storedFields: RecordField[] = row.fields ? JSON.parse(row.fields) : [];
    const fields: RecordField[] = [];
    for (const f of storedFields) {
      if (f.secret) {
        try {
          fields.push({ ...f, value: await decryptString(key, f.value) });
        } catch {
          fields.push({ ...f, value: '(could not decrypt)' });
        }
      } else {
        fields.push(f);
      }
    }

    let title = row.title;
    let notes = row.notes ?? '';
    try {
      title = await decryptString(key, row.title);
      notes = row.notes ? await decryptString(key, row.notes) : '';
    } catch {
      // if this ever fails, leave the raw (still-encrypted) text visible rather than crashing
    }

    records.push({
      id: row.id,
      title,
      category: row.category,
      notes,
      tags: row.tags ? JSON.parse(row.tags) : [],
      fields,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
  return records;
}

// Inserts a new record, or overwrites the existing one if the id already exists.
export async function saveRecord(record: VaultRecord, key: CryptoKey): Promise<void> {
  const db = await getDb();

  const fieldsToStore: RecordField[] = [];
  for (const f of record.fields) {
    if (f.secret) {
      fieldsToStore.push({ ...f, value: await encryptString(key, f.value) });
    } else {
      fieldsToStore.push(f);
    }
  }

  const encryptedTitle = await encryptString(key, record.title);
  const encryptedNotes = record.notes ? await encryptString(key, record.notes) : '';

  await db.execute(
    `INSERT INTO records (id, title, category, notes, tags, fields, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       category = excluded.category,
       notes = excluded.notes,
       tags = excluded.tags,
       fields = excluded.fields,
       updated_at = excluded.updated_at`,
    [
      record.id,
      encryptedTitle,
      record.category,
      encryptedNotes,
      JSON.stringify(record.tags),
      JSON.stringify(fieldsToStore),
      record.createdAt,
      record.updatedAt,
    ]
  );
}

export async function deleteRecordById(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM records WHERE id = ?', [id]);
}
