import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './contexts/AuthProvider';
import PreferencesProvider from './contexts/PreferencesProvider';
import { useAuth } from './hooks/useAuth';
import { usePreferences } from './hooks/usePreferences';

import Login from './pages/Login';
import AdminLayout from './pages/Admin/AdminLayout';
import ClientLayout from './pages/Client/ClientLayout';

const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminProjectDetails = lazy(() => import('./pages/Admin/AdminProjectDetails'));
const ClientDashboard = lazy(() => import('./pages/Client/ClientDashboard'));

function LazyPage({ children }) {
  const { t } = usePreferences();
  return <Suspense fallback={<div className="page-state">{t('common.loadingPage')}</div>}>{children}</Suspense>;
}

const RootRedirect = () => {
  const { user, profile, loading, authError, signOut } = useAuth();
  const { t } = usePreferences();
  
  if (loading) return <div className="page-state">{t('common.loadingWorkspace')}</div>;
  if (authError && user) {
    return (
      <div className="page-state page-state--error" role="alert">
        <h1>{t('account.setupTitle')}</h1>
        <p>{authError}</p>
        <button className="btn btn-secondary" type="button" onClick={signOut}>{t('common.signOut')}</button>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
  if (profile?.role === 'client') return <Navigate to="/portal" replace />;
  
  return <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<LazyPage><AdminDashboard /></LazyPage>} />
        <Route path="projects/:projectId" element={<LazyPage><AdminProjectDetails /></LazyPage>} />
      </Route>
      
      <Route path="/portal" element={<ClientLayout />}>
        <Route index element={<LazyPage><ClientDashboard /></LazyPage>} />
      </Route>
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </PreferencesProvider>
  );
}

export default App;
