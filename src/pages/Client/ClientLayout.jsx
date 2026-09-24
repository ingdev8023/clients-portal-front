import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Activity, Briefcase, CreditCard, Home, LogOut, Menu, MessageSquare, X } from 'lucide-react';
import PreferenceControls from '../../components/PreferenceControls';
import { usePreferences } from '../../hooks/usePreferences';

export default function ClientLayout() {
  const { user, profile, loading, signOut } = useAuth();
  const { t } = usePreferences();

  if (loading) return <div className="page-state">{t('common.loadingPortal')}</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
  if (profile?.role !== 'client') return <Navigate to="/" replace />;

  return <ClientLayoutView profile={profile} signOut={signOut} />;
}

export function ClientLayoutView({ profile, signOut }) {
  const { t } = usePreferences();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="client-shell">
      <header className="client-header">
        <div className="client-brand">
          <div className="client-brand-icon" aria-hidden="true">
            <Briefcase size={20} />
          </div>
          <span>{t('nav.clientPortal')}</span>
        </div>

        <div className="client-account">
          <strong>{profile.full_name}</strong>
          <button onClick={signOut} className="btn btn-secondary btn-compact" type="button">
            <LogOut size={18} />
            {t('common.signOut')}
          </button>
        </div>
        <div className="topbar-actions">
          <PreferenceControls />
          <button className="icon-button mobile-menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="client-mobile-menu" aria-label={menuOpen ? t('preferences.closeMenu') : t('preferences.openMenu')} title={menuOpen ? t('preferences.closeMenu') : t('preferences.openMenu')}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav id="client-mobile-menu" className={`client-mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-label={t('nav.clientPortal')}>
          <a href="/portal#welcome" onClick={() => setMenuOpen(false)}><Home size={18} />{t('nav.welcome')}</a>
          <a href="/portal#status" onClick={() => setMenuOpen(false)}><Activity size={18} />{t('nav.status')}</a>
          <a href="/portal#payments" onClick={() => setMenuOpen(false)}><CreditCard size={18} />{t('nav.payments')}</a>
          <a href="/portal#comments" onClick={() => setMenuOpen(false)}><MessageSquare size={18} />{t('nav.comments')}</a>
          <div className="client-mobile-account"><strong>{profile.full_name}</strong><button onClick={signOut} className="btn btn-secondary btn-block btn-danger-text" type="button"><LogOut size={18} />{t('common.signOut')}</button></div>
        </nav>
      </header>

      <main className="client-main">
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
