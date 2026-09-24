import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import PreferencesProvider from '../src/contexts/PreferencesProvider';
import { AdminLayoutView } from '../src/pages/Admin/AdminLayout';
import { ClientLayoutView } from '../src/pages/Client/ClientLayout';

function renderLayout(layout) {
  return render(<PreferencesProvider><MemoryRouter>{layout}</MemoryRouter></PreferencesProvider>);
}

describe('responsive navigation layouts', () => {
  it('opens and closes the client mobile navigation', async () => {
    const user = userEvent.setup();
    renderLayout(<ClientLayoutView profile={{ full_name: 'Alex Client' }} signOut={vi.fn()} />);

    const menu = screen.getByRole('navigation', { name: 'Client Portal' });
    expect(menu).not.toHaveClass('is-open');
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    expect(menu).toHaveClass('is-open');
    expect(screen.getByRole('link', { name: 'Payments' })).toHaveAttribute('href', '/portal#payments');
  });

  it('keeps preferences available and translates the admin menu', async () => {
    const user = userEvent.setup();
    renderLayout(<AdminLayoutView profile={{ full_name: 'Ada Admin' }} signOut={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Switch to Spanish' }));
    await user.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));
    expect(screen.getByRole('navigation', { name: 'Panel administrativo' })).toHaveClass('is-open');
    expect(screen.getByRole('link', { name: 'Proyectos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toBeInTheDocument();
  });
});
