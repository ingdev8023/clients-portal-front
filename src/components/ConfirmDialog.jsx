import { AlertTriangle, X } from 'lucide-react';
import { usePreferences } from '../hooks/usePreferences';

export default function ConfirmDialog({ title, message, busy, onCancel, onConfirm }) {
  const { t } = usePreferences();
  return (
    <div className="dialog-backdrop" onMouseDown={() => { if (!busy) onCancel(); }}>
      <section className="dialog-panel dialog-panel--small" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" onMouseDown={(event) => event.stopPropagation()}>
        <header className="dialog-header">
          <div className="confirm-title"><AlertTriangle size={22} /><h2 id="confirm-title">{title}</h2></div>
          <button className="icon-button" type="button" onClick={onCancel} disabled={busy} aria-label={t('common.close')} title={t('common.close')}><X size={20} /></button>
        </header>
        <p id="confirm-message">{message}</p>
        <footer className="dialog-actions">
          <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={busy}>{t('common.cancel')}</button>
          <button className="btn btn-danger" type="button" onClick={onConfirm} disabled={busy}>{busy ? t('common.deleting') : t('common.delete')}</button>
        </footer>
      </section>
    </div>
  );
}
