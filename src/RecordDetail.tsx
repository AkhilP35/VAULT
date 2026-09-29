import { useState } from 'react';
import type { VaultRecord } from './types';

interface Props {
  record: VaultRecord;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export default function RecordDetail({ record, onEdit, onDelete, onBack }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  function toggleReveal(id: string) {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function copyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access can be blocked depending on OS/browser permissions — fail silently for now.
    }
  }

  return (
    <div className="record-detail">
      <button className="back" onClick={onBack}>
        ‹ Back
      </button>
      <h1>{record.title}</h1>
      <div className="record-meta">{record.category}</div>

      {record.notes && <p className="notes">{record.notes}</p>}

      <div className="fields">
        {record.fields.map((f) => (
          <div className="field-view" key={f.id}>
            <div className="field-label">{f.label}</div>
            <div className="field-value">{f.secret && !revealed[f.id] ? '••••••••' : f.value}</div>
            <div className="field-actions">
              {f.secret && <button onClick={() => toggleReveal(f.id)}>{revealed[f.id] ? 'Hide' : 'Show'}</button>}
              <button onClick={() => copyValue(f.value)}>Copy</button>
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="primary" onClick={onEdit}>
          Edit
        </button>
        {!confirmingDelete ? (
          <button className="danger" onClick={() => setConfirmingDelete(true)}>
            Delete
          </button>
        ) : (
          <span className="confirm-delete">
            Are you sure? This cannot be undone.
            <button className="danger" onClick={onDelete}>
              Yes, delete
            </button>
            <button onClick={() => setConfirmingDelete(false)}>Cancel</button>
          </span>
        )}
      </div>
    </div>
  );
}
