import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, LayoutDashboard, FolderKanban } from 'lucide-react';

export default function AdminLayout() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) return <div className="page-state">Loading admin workspace...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'client') return <Navigate to="/portal" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h1>Admin Panel</h1>
          <span className="badge badge-primary">v1.0</span>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          <a href="/admin" className="nav-link">
            <LayoutDashboard size={20} />
            Dashboard
          </a>
          <a href="/admin#projects" className="nav-link">
            <FolderKanban size={20} />
            Projects
          </a>
        </nav>

        <div className="admin-account">
          <div className="admin-account-copy">
            <strong>{profile.full_name}</strong>
            <span>Administrator</span>
          </div>
          <button onClick={signOut} className="btn btn-secondary btn-block btn-danger-text" type="button">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
