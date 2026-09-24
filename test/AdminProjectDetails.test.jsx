import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AdminProjectDetails from '../src/pages/Admin/AdminProjectDetails';
import { useAdminProjectController } from '../src/controllers/useAdminProjectController';

vi.mock('../src/controllers/useAdminProjectController', () => ({ useAdminProjectController: vi.fn() }));

describe('AdminProjectDetails', () => {
  it('renders overview and all CRUD resource sections', () => {
    useAdminProjectController.mockReturnValue({
      isNew: false,
      clients: [{ id: 'client-1', name: 'Acme' }],
      project: { id: 'project-1', name: 'Portal', status: 'active', client: { name: 'Acme' } },
      projectDraft: { client_id: 'client-1', name: 'Portal', slug: 'portal', description: '', status: 'active', progress_percentage: 60, start_date: '', estimated_end_date: '' },
      stages: [{ id: 'stage-1', name: 'Build', description: 'Configure the portal.', status: 'active', position: 1 }],
      updates: [{ id: 'update-1', title: 'Started', message: 'Work began.', created_at: '2026-01-01T12:00:00Z' }],
      payments: [{ id: 'payment-1', description: 'Deposit', amount: 100000, status: 'paid', due_date: '2026-01-01' }],
      loading: false, busyAction: '', error: '', notice: '',
      updateProjectField: vi.fn(), saveProject: vi.fn(), saveStage: vi.fn(), saveUpdate: vi.fn(), savePayment: vi.fn(), deleteStage: vi.fn(), deleteUpdate: vi.fn(), deletePayment: vi.fn(),
    });

    render(<MemoryRouter initialEntries={['/admin/projects/project-1']}><Routes><Route path="/admin/projects/:projectId" element={<AdminProjectDetails />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Project overview' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Stages' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recent updates' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Payments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add stage' })).toBeInTheDocument();
    expect(screen.getByText('Deposit')).toBeInTheDocument();
  });
});
