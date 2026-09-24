import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './contexts/AuthProvider';
import { useAuth } from './hooks/useAuth';

import Login from './pages/Login';
import AdminLayout from './pages/Admin/AdminLayout';
import ClientLayout from './pages/Client/ClientLayout';

const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminProjectDetails = lazy(() => import('./pages/Admin/AdminProjectDetails'));
const ClientDashboard = lazy(() => import('./pages/Client/ClientDashboard'));

const lazyPage = (page) => (
  <Suspense fallback={<div className="page-state">Loading page...</div>}>
    {page}
  </Suspense>
);

const RootRedirect = () => {
  const { user, profile, loading, authError, signOut } = useAuth();
  
  if (loading) return <div className="page-state">Loading your workspace...</div>;
  if (authError && user) {
    return (
      <div className="page-state page-state--error" role="alert">
        <h1>Account setup needed</h1>
        <p>{authError}</p>
        <button className="btn btn-secondary" type="button" onClick={signOut}>Sign out</button>
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
        <Route index element={lazyPage(<AdminDashboard />)} />
        <Route path="projects/:projectId" element={lazyPage(<AdminProjectDetails />)} />
      </Route>
      
      <Route path="/portal" element={<ClientLayout />}>
        <Route index element={lazyPage(<ClientDashboard />)} />
      </Route>
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
