const localeFor = (language) => language === 'es' ? 'es-CO' : 'en-US';

export function formatDateOnly(value, language = 'en') {
  if (!value) return language === 'es' ? 'Por definir' : 'TBD';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat(localeFor(language), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

export function formatDateTime(value, language = 'en') {
  if (!value) return '';
  return new Intl.DateTimeFormat(localeFor(language), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatCurrency(value, language = 'en') {
  return new Intl.NumberFormat(localeFor(language), {
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
