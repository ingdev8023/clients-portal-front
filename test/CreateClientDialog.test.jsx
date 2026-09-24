import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CreateClientDialog from '../src/components/CreateClientDialog';

function DialogHarness({ onSubmit }) {
  const [draft, setDraft] = useState({ name: '', email: '', password: '' });
  return (
    <CreateClientDialog
      draft={draft}
      error=""
      busy={false}
      onCancel={() => {}}
      onChange={(field, value) => setDraft((current) => ({ ...current, [field]: value }))}
      onSubmit={() => onSubmit(draft)}
    />
  );
}

describe('CreateClientDialog', () => {
  it('collects the client login details without displaying the password', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<DialogHarness onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('User name'), 'Ana Torres');
    await user.type(screen.getByLabelText('User email'), 'ANA@EXAMPLE.COM');
    await user.type(screen.getByLabelText('Temporary password'), 'StrongPass!42');

    expect(screen.getByLabelText('Temporary password')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('User name')).toBeValid();
    expect(screen.getByLabelText('User email')).toBeValid();
    expect(screen.getByLabelText('Temporary password')).toBeValid();
    await user.click(screen.getByRole('button', { name: 'Create client' }));
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana Torres', email: 'ANA@EXAMPLE.COM', password: 'StrongPass!42',
    });
  });

  it('keeps keyboard focus inside the modal', async () => {
    const user = userEvent.setup();
    render(<DialogHarness onSubmit={() => {}} />);

    expect(screen.getByLabelText('User name')).toHaveFocus();
    screen.getByRole('button', { name: 'Close' }).focus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Create client' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });
});
