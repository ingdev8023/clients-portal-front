import { Eye, EyeOff, UserPlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { usePreferences } from '../hooks/usePreferences';

export default function CreateClientDialog({ draft, error, busy, onCancel, onChange, onSubmit }) {
  const { t } = usePreferences();
  const [showPassword, setShowPassword] = useState(false);
  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleDialogKeys = (event) => {
      if (event.key === 'Escape' && !busy) {
        onCancel();
        return;
      }
      if (event.key !== 'Tab') return;

      const controls = [...dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled])')];
      const firstControl = controls[0];
      const lastControl = controls.at(-1);
      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl?.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl?.focus();
      }
    };
    document.addEventListener('keydown', handleDialogKeys);
    return () => document.removeEventListener('keydown', handleDialogKeys);
  }, [busy, onCancel]);

  return (
    <div className="dialog-backdrop" onMouseDown={() => { if (!busy) onCancel(); }}>
      <section
        ref={dialogRef}
        className="dialog-panel dialog-panel--small"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-client-title"
        aria-describedby="create-client-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="dialog-header">
          <div className="dialog-title">
            <UserPlus size={22} />
            <div>
              <h2 id="create-client-title">{t('client.createTitle')}</h2>
              <p id="create-client-description">{t('client.createDescription')}</p>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onCancel} disabled={busy} aria-label={t('common.close')} title={t('common.close')}><X size={20} /></button>
        </header>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <form className="dialog-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
          <div className="form-group">
            <label className="form-label" htmlFor="client-name">{t('client.name')}</label>
            <input ref={nameInputRef} id="client-name" className="form-input" value={draft.name} onChange={(event) => onChange('name', event.target.value)} autoComplete="name" maxLength="120" required disabled={busy} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="client-email">{t('client.email')}</label>
            <input id="client-email" className="form-input" type="email" value={draft.email} onChange={(event) => onChange('email', event.target.value)} autoComplete="email" maxLength="254" required disabled={busy} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="client-password">{t('client.password')}</label>
            <div className="password-field">
              <input id="client-password" className="form-input" type={showPassword ? 'text' : 'password'} value={draft.password} onChange={(event) => onChange('password', event.target.value)} autoComplete="new-password" minLength="12" maxLength="128" aria-describedby="client-password-help" required disabled={busy} />
              <button className="icon-button password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={t(showPassword ? 'login.hidePassword' : 'login.showPassword')} title={t(showPassword ? 'login.hidePassword' : 'login.showPassword')} disabled={busy}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <p id="client-password-help" className="form-help">{t('client.passwordHelp')}</p>
          </div>

          <footer className="dialog-actions">
            <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={busy}>{t('common.cancel')}</button>
            <button className="btn btn-primary" type="submit" disabled={busy}><UserPlus size={18} /> {t(busy ? 'client.creating' : 'client.create')}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
