import type { VaultRecord } from './types';

// TEST DATA ONLY. Do not put real passwords or financial details in here —
// this file exists purely so the interface can be built and tested before
// the real SQLite + encryption layers exist (Stage 4 of the build).

const now = new Date().toISOString();

export const sampleRecords: VaultRecord[] = [
  {
    id: crypto.randomUUID(),
    title: 'Online Banking - Example Bank',
    category: 'Financial',
    tags: ['bank'],
    notes: 'Test data only — replace before going live.',
    fields: [
      { id: crypto.randomUUID(), label: 'Username', value: 'example.user', type: 'text', secret: false },
      { id: crypto.randomUUID(), label: 'Password', value: 'ExamplePass123!', type: 'password', secret: true },
      { id: crypto.randomUUID(), label: 'Sort Code', value: '12-34-56', type: 'text', secret: false },
      { id: crypto.randomUUID(), label: 'Account Number', value: '12345678', type: 'text', secret: true },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: crypto.randomUUID(),
    title: 'Dr. Example - GP',
    category: 'Medical',
    tags: ['doctor'],
    notes: 'Test data only.',
    fields: [
      { id: crypto.randomUUID(), label: 'Phone', value: '01234 567890', type: 'text', secret: false },
      { id: crypto.randomUUID(), label: 'Address', value: '1 Example Street, London', type: 'text', secret: false },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: crypto.randomUUID(),
    title: 'Email Account',
    category: 'Passwords',
    tags: [],
    notes: '',
    fields: [
      { id: crypto.randomUUID(), label: 'Email', value: 'dad@example.com', type: 'text', secret: false },
      { id: crypto.randomUUID(), label: 'Password', value: 'HunterExample2!', type: 'password', secret: true },
    ],
    createdAt: now,
    updatedAt: now,
  },
];

export const defaultCategories = ['Financial', 'Passwords', 'Medical', 'Insurance', 'Personal', 'Other'];
