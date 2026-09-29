# VAULT

VAULT is a local-first personal vault app for storing sensitive information such as passwords, account details, notes, and other private records. It is built with React + TypeScript on the frontend and Tauri on the desktop layer, with encrypted values stored locally in SQLite.

The project is designed to keep data private by default: a master password is used to unlock the vault, records are encrypted before storage, and the password itself is never kept in the database.

## Features

- Secure master-password unlock flow
- Local SQLite storage for records
- AES-GCM encryption for sensitive data
- PBKDF2-derived encryption keys
- Category-based record organization
- Tags and searchable record lists
- Desktop app experience via Tauri
- Works without sending vault data to a remote server

## Why VAULT?

Many password managers and secret storage apps rely on cloud infrastructure or browser-based storage. VAULT focuses on a simple local workflow: your vault lives on your machine, and the app only unlocks it when you provide the correct master password.

This makes it a strong fit for:

- personal password tracking
- secure note storage
- private account metadata
- local-only record management

## Tech Stack

- React 19
- TypeScript
- Vite
- Tauri 2
- SQLite via Tauri SQL plugin
- Web Crypto API (PBKDF2 + AES-GCM)

## Security model

VAULT follows a straightforward local-encryption model:

1. A user creates or enters a master password.
2. The password is used to derive an encryption key using PBKDF2.
3. The vault metadata includes a random salt and a validation check value.
4. When records are saved, fields marked as secret are encrypted before being written to SQLite.
5. On unlock, the same master password is used to re-derive the key and decrypt accessible data.

Important: the password never persists in storage. Only the derived key material and validation data are kept locally.

## Getting started

### Prerequisites

- Node.js 18+
- npm
- Rust and Cargo
- Tauri development dependencies for your OS

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

For the desktop app experience:

```bash
npm run tauri dev
```

### Build for production

```bash
npm run build
```

## Project layout

```text
VAULT/
├── src/                 # React frontend
│   ├── App.tsx          # Core app shell and auth flow
│   ├── AuthScreen.tsx   # Login / setup screen
│   ├── db.ts            # SQLite storage and record lifecycle
│   ├── crypto.ts        # Encryption and key derivation
│   ├── RecordList.tsx   # Record browser UI
│   ├── RecordForm.tsx   # Add/edit record form
│   ├── RecordDetail.tsx # Full record view
│   └── types.ts         # Shared types
├── src-tauri/           # Tauri backend configuration and native app setup
├── public/              # Static assets
├── index.html           # Vite entry point
├── package.json         # Frontend scripts and dependencies
├── vite.config.ts       # Vite configuration
├── tsconfig*.json       # TypeScript configuration
├── .gitignore
├── .oxlintrc.json
├── README.md
└── package-lock.json
```

## Roadmap

Potential future improvements include:

- export/import of vault backups
- stronger search and filtering
- password generation tools
- category management and customization
- app lock timeout and session controls
- improved record types and templates

## License

This project does not currently list a license in the repository metadata. If you plan to share or distribute it publicly, consider adding an open-source license such as MIT or Apache 2.0.

## Contributing

Contributions are welcome. If you want to improve security, UX, or functionality:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the app and verify behavior
5. Open a pull request with a clear description

## Status

VAULT is an active local-first personal vault prototype focused on secure record management with a clean desktop interface.
