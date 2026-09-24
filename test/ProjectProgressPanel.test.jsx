import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProjectProgressPanel from '../src/components/ProjectProgressPanel';

const project = { progress_percentage: 64 };

describe('ProjectProgressPanel', () => {
  it('renders circular progress and the up-to-date banner', () => {
    render(<ProjectProgressPanel project={project} activeStage={{ name: 'Implementation' }} payments={[{ status: 'paid', amount: 100 }]} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '64');
    expect(screen.getByText('64%')).toBeInTheDocument();
    expect(screen.getByText('Current stage: Implementation')).toBeInTheDocument();
    expect(screen.getByTestId('payment-banner')).toHaveTextContent('Payments up to date');
  });

  it('shows the overdue count and total in the payment banner', () => {
    render(<ProjectProgressPanel project={project} payments={[{ status: 'overdue', amount: 250000 }, { status: 'pending', amount: 50000 }]} />);
    const banner = screen.getByTestId('payment-banner');
    expect(banner).toHaveTextContent('Payment attention needed');
    expect(banner).toHaveTextContent('1 overdue payment');
    expect(banner).toHaveTextContent('250,000');
  });
});
