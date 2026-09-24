import { CheckCircle2, CreditCard, Settings } from 'lucide-react';
import { formatCurrency } from '../lib/format';
import { getDuePayments, getDuePaymentTotal } from '../lib/payments';

export default function ProjectProgressPanel({ project, activeStage, payments }) {
  const progress = Math.min(100, Math.max(0, Number(project.progress_percentage) || 0));
  const duePayments = getDuePayments(payments);
  const hasDuePayments = duePayments.length > 0;

  return (
    <section className="panel project-progress-panel" aria-labelledby="project-progress-title">
      <div className="progress-visual">
        <div className="progress-orbit" role="progressbar" aria-labelledby="project-progress-title" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
          <svg className="progress-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle className="progress-ring-track" cx="60" cy="60" r="50" pathLength="100" />
            <circle className="progress-ring-value" cx="60" cy="60" r="50" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - progress} />
          </svg>
          <div className="progress-number"><strong>{progress}%</strong><span>complete</span></div>
          <div className="progress-gear-orbit" aria-hidden="true"><Settings size={24} /></div>
        </div>
        <div className="progress-copy">
          <p className="eyebrow">Delivery progress</p>
          <h2 id="project-progress-title">Project progress</h2>
          <p>{activeStage ? `Current stage: ${activeStage.name}` : 'No active stage is currently assigned.'}</p>
        </div>
      </div>

      <div className={`payment-summary ${hasDuePayments ? 'payment-summary--danger' : 'payment-summary--success'}`} data-testid="payment-banner">
        {hasDuePayments ? <CreditCard size={26} /> : <CheckCircle2 size={26} />}
        <div>
          <strong>{hasDuePayments ? 'Payment attention needed' : 'Payments up to date'}</strong>
          <span>{hasDuePayments ? `${duePayments.length} overdue payment(s), totaling ${formatCurrency(getDuePaymentTotal(payments))}.` : 'There are no overdue payments on this project.'}</span>
        </div>
      </div>
    </section>
  );
}
