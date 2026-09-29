import { type FormEvent, useState } from 'react';

interface Props {
  mode: 'setup' | 'unlock';
  onSubmit: (password: string) => void | Promise<void>;
  error?: string;
  busy?: boolean;
}

export default function AuthScreen({ mode, onSubmit, error, busy }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === 'setup') {
      if (password.length < 8) {
        setLocalError('Use at least 8 characters.');
        return;
      }
      if (password !== confirm) {
        setLocalError("Passwords don't match.");
        return;
      }
    }
    setLocalError('');
    onSubmit(password);
  }

  return (
    <div className="auth-screen">
      <form className="auth-box" onSubmit={handleSubmit}>
        <div className="auth-icon">🔒</div>
        <h1>{mode === 'setup' ? 'Create a master password' : 'Welcome back'}</h1>

        {mode === 'setup' && (
          <p className="hint">
            This protects everything in the vault. If it's ever forgotten, the data cannot be
            recovered — write it down somewhere safe.
          </p>
        )}

        <input
          type="password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mode === 'setup' && (
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        )}

        {(localError || error) && <div className="error">{localError || error}</div>}

        <button className="primary" type="submit" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'setup' ? 'Create password' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
