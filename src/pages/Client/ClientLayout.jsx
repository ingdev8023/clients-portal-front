import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Briefcase } from 'lucide-react';

export default function ClientLayout() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) return <div className="page-state">Loading your portal...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
  if (profile?.role !== 'client') return <Navigate to="/" replace />;

  return (
    <div className="client-shell">
      <header className="client-header">
        <div className="client-brand">
          <div className="client-brand-icon" aria-hidden="true">
            <Briefcase size={20} />
          </div>
          <span>Client Portal</span>
        </div>

        <div className="client-account">
          <div className="client-welcome">
            <span>Welcome,</span>
            <strong>{profile.full_name}</strong>
          </div>
          <button onClick={signOut} className="btn btn-secondary btn-compact" type="button">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </header>

      <main className="client-main">
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
