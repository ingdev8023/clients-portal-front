import { useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, LayoutDashboard, FolderKanban, Menu, X } from 'lucide-react';
import PreferenceControls from '../../components/PreferenceControls';
import { usePreferences } from '../../hooks/usePreferences';

export default function AdminLayout() {
  const { user, profile, loading, signOut } = useAuth();
  const { t } = usePreferences();

  if (loading) return <div className="page-state">{t('common.loadingAdmin')}</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'client') return <Navigate to="/portal" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/" replace />;

  return <AdminLayoutView profile={profile} signOut={signOut} />;
}

export function AdminLayoutView({ profile, signOut }) {
  const { t } = usePreferences();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <div className="admin-brand">
            <h1>{t('nav.adminPanel')}</h1>
            <span className="badge badge-primary">v1.0</span>
          </div>
          <div className="topbar-actions">
            <PreferenceControls />
            <button className="icon-button mobile-menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="admin-mobile-menu" aria-label={menuOpen ? t('preferences.closeMenu') : t('preferences.openMenu')} title={menuOpen ? t('preferences.closeMenu') : t('preferences.openMenu')}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav id="admin-mobile-menu" className={`admin-nav ${menuOpen ? 'is-open' : ''}`} aria-label={t('nav.adminPanel')}>
          <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
            <LayoutDashboard size={20} />
            {t('nav.dashboard')}
          </Link>
          <a href="/admin#projects" className="nav-link" onClick={() => setMenuOpen(false)}>
            <FolderKanban size={20} />
            {t('nav.projects')}
          </a>
        </nav>

        <div className={`admin-account ${menuOpen ? 'is-open' : ''}`}>
          <div className="admin-account-copy">
            <strong>{profile.full_name}</strong>
            <span>{t('common.administrator')}</span>
          </div>
          <button onClick={signOut} className="btn btn-secondary btn-block btn-danger-text" type="button">
            <LogOut size={18} />
            {t('common.signOut')}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
