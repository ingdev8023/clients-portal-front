import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import PreferenceControls from '../src/components/PreferenceControls';
import StatusBadge from '../src/components/StatusBadge';
import PreferencesProvider from '../src/contexts/PreferencesProvider';

function PreferenceHarness() {
  return (
    <PreferencesProvider>
      <PreferenceControls />
      <StatusBadge status="active" />
      <StatusBadge status="paused" />
    </PreferencesProvider>
  );
}

describe('portal preferences', () => {
  it('uses the database status for badge classes and translated labels', async () => {
    const user = userEvent.setup();
    render(<PreferenceHarness />);

    expect(screen.getByText('Active')).toHaveClass('badge-status--active');
    expect(screen.getByText('Paused')).toHaveAttribute('data-status', 'paused');

    await user.click(screen.getByRole('button', { name: 'Switch to Spanish' }));
    expect(screen.getByText('Activo')).toHaveClass('badge-status--active');
    expect(screen.getByText('Pausado')).toHaveClass('badge-status--paused');
    expect(document.documentElement).toHaveAttribute('lang', 'es');
    expect(window.localStorage.getItem('portal-language')).toBe('es');
  });

  it('defaults to dark mode and persists a light-mode selection', async () => {
    const user = userEvent.setup();
    render(<PreferenceHarness />);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(window.localStorage.getItem('portal-theme')).toBe('light');
  });
});
