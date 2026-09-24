import { format } from 'date-fns';

export function formatDateOnly(value) {
  if (!value) return 'TBD';
  const [year, month, day] = value.split('-').map(Number);
  return format(new Date(year, month - 1, day), 'MMM d, yyyy');
}

export function formatDateTime(value) {
  return value ? format(new Date(value), 'MMM d, yyyy - h:mm a') : '';
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
