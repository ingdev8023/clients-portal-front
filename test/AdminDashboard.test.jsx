import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminDashboard from '../src/pages/Admin/AdminDashboard';
import { useAdminDashboardController } from '../src/controllers/useAdminDashboardController';

vi.mock('../src/controllers/useAdminDashboardController', () => ({ useAdminDashboardController: vi.fn() }));

const project = { id: 'project-1', name: 'Secure Portal', slug: 'secure-portal', status: 'active', progress_percentage: 45, estimated_end_date: '2026-12-01', client: { name: 'Acme' } };
const dashboardController = {
  clients: [{ id: 'client-1' }], projects: [project], loading: false, error: '',
  clientDialogOpen: false, clientDraft: { name: '', email: '', password: '' },
  clientError: '', clientNotice: '', savingClient: false, reload: vi.fn(),
  openClientDialog: vi.fn(), closeClientDialog: vi.fn(), updateClientField: vi.fn(), createClient: vi.fn(),
};

describe('AdminDashboard', () => {
  beforeEach(() => useAdminDashboardController.mockReturnValue({ ...dashboardController }));

  it('uses the project name as the detail link and has no pencil action', () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    const links = screen.getAllByRole('link', { name: 'Secure Portal' });
    expect(links[0]).toHaveAttribute('href', '/admin/projects/project-1');
    expect(screen.queryByRole('button', { name: /manage/i })).not.toBeInTheDocument();
  });

  it('renders skeletons while loading', () => {
    useAdminDashboardController.mockReturnValue({ ...dashboardController, clients: [], projects: [], loading: true });
    const { container } = render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    expect(screen.getByLabelText('Loading dashboard')).toBeInTheDocument();
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(2);
  });

  it('places the new client action next to the new project action', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);

    const clientButton = screen.getByRole('button', { name: 'New client' });
    const projectLink = screen.getByRole('link', { name: 'New project' });
    expect(clientButton.parentElement).toBe(projectLink.parentElement);

    await user.click(clientButton);
    expect(dashboardController.openClientDialog).toHaveBeenCalledOnce();
  });
});
