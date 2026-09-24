import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import ProjectProgressPanel from '../src/components/ProjectProgressPanel';
import { AdminProjectDetailsView } from '../src/pages/Admin/AdminProjectDetails';
import '../src/index.css';

const noop = async () => true;
const controller = {
  isNew: false,
  clients: [{ id: 'client-1', name: 'ABC Construction' }],
  project: { id: 'project-1', name: 'Local File Server Implementation', status: 'active', client: { name: 'ABC Construction' } },
  projectDraft: { client_id: 'client-1', name: 'Local File Server Implementation', slug: 'local-file-server', description: 'Implementation of a secure local file server with permissions and backups.', status: 'active', progress_percentage: 64, start_date: '2026-09-01', estimated_end_date: '2026-10-15' },
  stages: [
    { id: 'stage-1', name: 'Requirements', description: 'Confirm users, access rules, and storage needs.', status: 'completed', position: 1 },
    { id: 'stage-2', name: 'Implementation', description: 'Configure shares, permissions, and backup jobs.', status: 'active', position: 2 },
  ],
  updates: [{ id: 'update-1', title: 'Implementation in progress', message: 'User permissions and backup configuration are being completed.', created_at: '2026-09-17T20:00:00Z' }],
  payments: [{ id: 'payment-1', description: 'Final payment', amount: 600000, status: 'overdue', due_date: '2026-10-15' }],
  loading: false, busyAction: '', error: '', notice: '', updateProjectField: noop,
  saveProject: noop, saveStage: noop, saveUpdate: noop, savePayment: noop,
  deleteStage: noop, deleteUpdate: noop, deletePayment: noop,
};

export function VisualHarness() {
  return (
    <MemoryRouter>
      <main className="visual-harness">
        <ProjectProgressPanel project={{ progress_percentage: 64 }} activeStage={{ name: 'Implementation' }} payments={controller.payments} />
        <AdminProjectDetailsView controller={controller} />
      </main>
    </MemoryRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><VisualHarness /></React.StrictMode>);
