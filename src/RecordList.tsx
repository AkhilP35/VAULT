import type { VaultRecord } from './types';

interface Props {
  records: VaultRecord[];
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export default function RecordList({ records, search, onSearchChange, onSelect, onAdd }: Props) {
  const term = search.trim().toLowerCase();
  const filtered = records.filter(
    (r) =>
      !term ||
      r.title.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term) ||
      r.tags.some((t) => t.toLowerCase().includes(term))
  );

  return (
    <div>
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search records..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button className="primary" onClick={onAdd}>
          + Add Record
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No records yet.</p>
          <p>
            Click <strong>+ Add Record</strong> to create your first record.
          </p>
        </div>
      )}

      <ul className="record-list">
        {filtered.map((r) => (
          <li key={r.id} onClick={() => onSelect(r.id)}>
            <div>
              <div className="record-title">{r.title}</div>
              <div className="record-meta">{r.category}</div>
            </div>
            <span className="chevron">›</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
