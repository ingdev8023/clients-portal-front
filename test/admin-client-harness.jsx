import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import PreferencesProvider from '../src/contexts/PreferencesProvider';
import { AdminDashboardView } from '../src/pages/Admin/AdminDashboard';
import { AdminLayoutView } from '../src/pages/Admin/AdminLayout';
import '../src/index.css';

const projects = [{
  id: 'project-1',
  name: 'Secure Portal',
  slug: 'secure-portal',
  status: 'active',
  progress_percentage: 45,
  estimated_end_date: '2026-12-01',
  client: { name: 'Acme' },
}];

export function DashboardHarness() {
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clientDraft, setClientDraft] = useState({ name: '', email: '', password: '' });

  const controller = {
    clients: [{ id: 'client-1', name: 'Acme' }],
    projects,
    loading: false,
    error: '',
    clientDialogOpen,
    clientDraft,
    clientError: '',
    clientNotice: '',
    savingClient: false,
    reload: () => {},
    openClientDialog: () => setClientDialogOpen(true),
    closeClientDialog: () => setClientDialogOpen(false),
    updateClientField: (field, value) => setClientDraft((current) => ({ ...current, [field]: value })),
    createClient: () => {},
  };

  return <AdminDashboardView controller={controller} />;
}

export function HarnessLayout() {
  return <AdminLayoutView profile={{ full_name: 'Admin User' }} signOut={() => {}}><Outlet /></AdminLayoutView>;
}

export function AdminClientHarness() {
  return (
    <PreferencesProvider>
      <MemoryRouter>
        <Routes>
          <Route element={<HarnessLayout />}>
            <Route index element={<DashboardHarness />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </PreferencesProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><AdminClientHarness /></React.StrictMode>);
