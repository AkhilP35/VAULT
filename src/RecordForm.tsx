import { useState } from 'react';
import type { RecordField, VaultRecord, FieldType } from './types';

interface Props {
  existing: VaultRecord | null;
  categories: string[];
  onSave: (record: VaultRecord) => void;
  onCancel: () => void;
}

const fieldTypes: FieldType[] = ['text', 'password', 'email', '2FA secret', 'recovery code', 'security question', 'number'];

export default function RecordForm({ existing, categories, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(existing?.title ?? '');
  const [category, setCategory] = useState(existing?.category ?? categories[0] ?? 'Other');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [fields, setFields] = useState<RecordField[]>(existing?.fields ?? []);
  const [error, setError] = useState('');

  function addField() {
    setFields((prev) => [...prev, { id: crypto.randomUUID(), label: '', value: '', type: 'text', secret: false }]);
  }

  function updateField(id: string, patch: Partial<RecordField>) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  function handleSubmit() {
    if (!title.trim()) {
      setError('Please enter a title for this record.');
      return;
    }
    const now = new Date().toISOString();
    onSave({
      id: existing?.id ?? crypto.randomUUID(),
      title: title.trim(),
      category,
      tags: existing?.tags ?? [],
      notes,
      fields,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
  }

  return (
    <div className="record-form">
      <h1>{existing ? 'Edit Record' : 'Add Record'}</h1>
      {error && <div className="error">{error}</div>}

      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Online Banking" />

      <label>Category</label>
      <input list="category-options" value={category} onChange={(e) => setCategory(e.target.value)} />
      <datalist id="category-options">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <label>Notes</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />

      <div className="fields-header">
        <h3>Fields</h3>
        <button type="button" onClick={addField}>
          + Add Field
        </button>
      </div>

      {fields.map((f) => (
        <div className="field-row" key={f.id}>
          <input
            className="field-label"
            placeholder="Label"
            value={f.label}
            onChange={(e) => updateField(f.id, { label: e.target.value })}
          />
          <input
            className="field-value"
            placeholder="Value"
            type={f.secret ? 'password' : 'text'}
            value={f.value}
            onChange={(e) => updateField(f.id, { value: e.target.value })}
          />
          <select value={f.type} onChange={(e) => updateField(f.id, { type: e.target.value as FieldType })}>
            {fieldTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <label className="secret-toggle">
            <input
              type="checkbox"
              checked={f.secret}
              onChange={(e) => updateField(f.id, { secret: e.target.checked })}
            />
            Secret
          </label>
          <button type="button" className="remove" onClick={() => removeField(f.id)}>
            ✕
          </button>
        </div>
      ))}

      <div className="form-actions">
        <button className="primary" onClick={handleSubmit}>
          Save
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
