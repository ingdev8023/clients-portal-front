import { usePreferences } from '../hooks/usePreferences';

export default function StatusBadge({ status }) {
  const { t } = usePreferences();
  const knownStatuses = ['active', 'completed', 'paid', 'paused', 'pending', 'planned', 'overdue', 'cancelled'];
  const resolvedStatus = knownStatuses.includes(status) ? status : 'planned';

  return (
    <span className={`badge badge-status badge-status--${resolvedStatus}`} data-status={resolvedStatus}>
      {t(`status.${resolvedStatus}`)}
    </span>
  );
}
