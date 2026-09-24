import { CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/format';
import { getDuePayments, getDuePaymentTotal } from '../lib/payments';
import { usePreferences } from '../hooks/usePreferences';

export default function ProjectProgressPanel({ project, activeStage, payments }) {
  const { language, t } = usePreferences();
  const progress = Math.min(100, Math.max(0, Number(project.progress_percentage) || 0));
  const duePayments = getDuePayments(payments);
  const hasDuePayments = duePayments.length > 0;
  const overdueSummaryKey = duePayments.length === 1 ? 'client.overdueSummaryOne' : 'client.overdueSummaryMany';

  return (
    <section className="panel project-progress-panel" aria-labelledby="project-progress-title">
      <div className="progress-visual">
        <div className="progress-orbit" role="progressbar" aria-labelledby="project-progress-title" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
          <svg className="progress-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle className="progress-ring-track" cx="60" cy="60" r="50" pathLength="100" />
            <circle className="progress-ring-value" cx="60" cy="60" r="50" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - progress} />
          </svg>
          <div className="progress-number"><strong>{progress}%</strong><span>{t('client.complete')}</span></div>
        </div>
        <div className="progress-copy">
          <h2 id="project-progress-title">{t('client.progressTitle')}</h2>
          <p>{activeStage ? t('client.currentStage', { name: activeStage.name }) : t('client.noActiveStage')}</p>
        </div>
      </div>

      <div className={`payment-summary ${hasDuePayments ? 'payment-summary--danger' : 'payment-summary--success'}`} data-testid="payment-banner">
        {!hasDuePayments && <CheckCircle2 size={26} />}
        <div>
          <strong>{hasDuePayments ? t('client.paymentAttention') : t('client.paymentsCurrent')}</strong>
          <span>{hasDuePayments ? t(overdueSummaryKey, { count: duePayments.length, total: formatCurrency(getDuePaymentTotal(payments), language) }) : t('client.noOverdue')}</span>
        </div>
      </div>
    </section>
  );
}
