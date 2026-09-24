export default function StatusBadge({ status }) {
  const tone = {
    active: 'primary',
    completed: 'success',
    paid: 'success',
    paused: 'warning',
    pending: 'warning',
    planned: 'neutral',
    overdue: 'danger',
    cancelled: 'danger',
  }[status] || 'neutral';

  return <span className={`badge badge-${tone}`}>{status}</span>;
}
