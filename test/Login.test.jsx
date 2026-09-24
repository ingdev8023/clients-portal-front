import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Login from '../src/pages/Login';
import { useAuth } from '../src/hooks/useAuth';

vi.mock('../src/hooks/useAuth', () => ({ useAuth: vi.fn() }));

describe('Login', () => {
  it('toggles password visibility accessibly', async () => {
    useAuth.mockReturnValue({ user: null, profile: null, signIn: vi.fn() });
    const user = userEvent.setup();
    render(<MemoryRouter><Login /></MemoryRouter>);
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
  });
});
