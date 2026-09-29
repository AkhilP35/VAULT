import { useEffect, useMemo, useState } from 'react';
import './App.css';
import type { VaultRecord } from './types';
import { defaultCategories } from './sampleRecords';
import {
  loadAllRecords,
  saveRecord,
  deleteRecordById,
  getVaultMeta,
  setVaultMeta,
} from './db';
import { createVaultKey, unlockVaultKey } from './crypto';
import AuthScreen from './AuthScreen';
import RecordList from './RecordList';
import RecordForm from './RecordForm';
import RecordDetail from './RecordDetail';

type View = 'dashboard' | 'records' | 'settings';
type Mode = 'list' | 'view' | 'edit' | 'add';
type AuthState = 'checking' | 'setup' | 'locked' | 'unlocked';

function App() {
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);

  const [records, setRecords] = useState<VaultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('dashboard');
  const [mode, setMode] = useState<Mode>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // On first launch, work out whether a master password already exists.
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'App.tsx:auth-check-start',message:'checking vault meta',data:{authState},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    getVaultMeta()
      .then((meta: any) => {
        // #region agent log
        fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'App.tsx:auth-check-result',message:'vault meta resolved',data:{hasMeta:!!meta},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
        setAuthState(meta ? 'locked' : 'setup');
      })
      .catch((err: Error) => {
        // #region agent log
        fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'App.tsx:auth-check-error',message:'vault meta check failed',data:{error:String(err)},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
        console.error('Failed to check vault status:', err);
        setAuthState('setup');
      });
  }, []);

  // Once unlocked, load and decrypt the records.
  useEffect(() => {
    if (authState !== 'unlocked' || !vaultKey) return;
    setLoading(true);
    // #region agent log
    fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'App.tsx:load-records-start',message:'loading records',data:{hasVaultKey:!!vaultKey},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    loadAllRecords(vaultKey)
      .then((loaded) => {
        // #region agent log
        fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'App.tsx:load-records-success',message:'records loaded',data:{count:loaded.length},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
        setRecords(loaded);
      })
      .catch((err) => {
        // #region agent log
        fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'App.tsx:load-records-error',message:'records load failed',data:{error:String(err)},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
        console.error('Failed to load records:', err);
      })
      .finally(() => setLoading(false));
  }, [authState, vaultKey]);

  async function handleAuthSubmit(password: string) {
    setAuthBusy(true);
    setAuthError('');
    // #region agent log
    fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'App.tsx:auth-submit-start',message:'auth submit',data:{authState,passwordLen:password.length},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    try {
      if (authState === 'setup') {
        const { key, salt, check } = await createVaultKey(password);
        // #region agent log
        fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'App.tsx:auth-setup-key-created',message:'vault key created',data:{hasSalt:!!salt,hasCheck:!!check},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
        await setVaultMeta(salt, check);
        setVaultKey(key);
        setAuthState('unlocked');
      } else {
        const meta = await getVaultMeta();
        if (!meta) throw new Error('Vault metadata missing');
        const key = await unlockVaultKey(password, meta.salt, meta.check);
        // #region agent log
        fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'App.tsx:auth-unlock-result',message:'unlock attempt',data:{hasKey:!!key},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
        if (!key) {
          setAuthError('Wrong password. Try again.');
          return;
        }
        setVaultKey(key);
        setAuthState('unlocked');
      }
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'App.tsx:auth-submit-error',message:'auth failed',data:{error:String(err)},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      console.error(err);
      setAuthError('Something went wrong. Try again.');
    } finally {
      setAuthBusy(false);
    }
  }

  function handleLock() {
    setVaultKey(null);
    setRecords([]);
    setLoading(true);
    setView('dashboard');
    setMode('list');
    setSelectedId(null);
    setAuthState('locked');
  }

  const categories = useMemo(() => {
    const set = new Set(defaultCategories);
    records.forEach((r) => set.add(r.category));
    return Array.from(set);
  }, [records]);

  const selected = records.find((r) => r.id === selectedId) ?? null;

  async function handleSave(record: VaultRecord) {
    if (!vaultKey) return;
    await saveRecord(record, vaultKey);
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === record.id);
      return exists ? prev.map((r) => (r.id === record.id ? record : r)) : [record, ...prev];
    });
    setSelectedId(record.id);
    setMode('view');
  }

  async function handleDelete(id: string) {
    await deleteRecordById(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedId(null);
    setMode('list');
  }

  if (authState === 'checking') {
    return (
      <div className="app-shell">
        <main className="content">
          <p>Checking vault…</p>
        </main>
      </div>
    );
  }

  if (authState === 'setup' || authState === 'locked') {
    return (
      <AuthScreen
        mode={authState === 'setup' ? 'setup' : 'unlock'}
        onSubmit={handleAuthSubmit}
        error={authError}
        busy={authBusy}
      />
    );
  }

  if (loading) {
    return (
      <div className="app-shell">
        <main className="content">
          <p>Loading your records…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="brand">🔒 Family Vault</div>
        <button
          className={view === 'dashboard' ? 'active' : ''}
          onClick={() => {
            setView('dashboard');
            setMode('list');
          }}
        >
          Dashboard
        </button>
        <button
          className={view === 'records' ? 'active' : ''}
          onClick={() => {
            setView('records');
            setMode('list');
          }}
        >
          Records
        </button>
        <button
          className={view === 'settings' ? 'active' : ''}
          onClick={() => {
            setView('settings');
            setMode('list');
          }}
        >
          Settings
        </button>
        <button className="lock-btn" onClick={handleLock}>
          🔒 Lock
        </button>
      </nav>

      <main className="content">
        {view === 'dashboard' && (
          <div>
            <h1>Welcome back</h1>
            <p>{records.length} records stored.</p>
            <p className="hint">
              Titles, notes and anything marked "Secret" are encrypted before they're saved.
            </p>
          </div>
        )}

        {view === 'records' && mode === 'list' && (
          <RecordList
            records={records}
            search={search}
            onSearchChange={setSearch}
            onSelect={(id) => {
              setSelectedId(id);
              setMode('view');
            }}
            onAdd={() => {
              setSelectedId(null);
              setMode('add');
            }}
          />
        )}

        {view === 'records' && mode === 'view' && selected && (
          <RecordDetail
            record={selected}
            onEdit={() => setMode('edit')}
            onDelete={() => handleDelete(selected.id)}
            onBack={() => {
              setSelectedId(null);
              setMode('list');
            }}
          />
        )}

        {view === 'records' && (mode === 'add' || mode === 'edit') && (
          <RecordForm
            existing={mode === 'edit' ? selected : null}
            categories={categories}
            onSave={handleSave}
            onCancel={() => setMode(selected ? 'view' : 'list')}
          />
        )}

        {view === 'settings' && (
          <div>
            <h1>Settings</h1>
            <p className="hint">Backups and category management arrive in a later stage.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;