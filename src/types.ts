export type FieldType = 'text' | 'password' | 'email' | '2FA secret' | 'recovery code' | 'security question' | 'number';

export interface RecordField {
  id: string;
  label: string;
  value: string;
  type: FieldType;
  secret: boolean; // masked in the UI, and the boundary we encrypt at Stage 8
}

export interface VaultRecord {
  id: string;
  title: string;
  category: string; // free text — categories are invented as you go, not a fixed enum
  tags: string[];
  notes: string;
  fields: RecordField[];
  createdAt: string;
  updatedAt: string;
}
