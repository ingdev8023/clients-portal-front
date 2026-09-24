import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminDashboard from '../src/pages/Admin/AdminDashboard';
import { useAdminDashboardController } from '../src/controllers/useAdminDashboardController';

vi.mock('../src/controllers/useAdminDashboardController', () => ({ useAdminDashboardController: vi.fn() }));

const project = { id: 'project-1', name: 'Secure Portal', slug: 'secure-portal', status: 'active', progress_percentage: 45, estimated_end_date: '2026-12-01', client: { name: 'Acme' } };

describe('AdminDashboard', () => {
  beforeEach(() => useAdminDashboardController.mockReturnValue({ clients: [{ id: 'client-1' }], projects: [project], loading: false, error: '', reload: vi.fn() }));

  it('uses the project name as the detail link and has no pencil action', () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    const links = screen.getAllByRole('link', { name: 'Secure Portal' });
    expect(links[0]).toHaveAttribute('href', '/admin/projects/project-1');
    expect(screen.queryByRole('button', { name: /manage/i })).not.toBeInTheDocument();
  });

  it('renders skeletons while loading', () => {
    useAdminDashboardController.mockReturnValue({ clients: [], projects: [], loading: true, error: '', reload: vi.fn() });
    const { container } = render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    expect(screen.getByLabelText('Loading dashboard')).toBeInTheDocument();
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(2);
  });
});
