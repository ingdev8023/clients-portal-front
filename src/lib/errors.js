import { translate } from '../i18n/translations';

const ERROR_KEYS = {
  '23505': 'errors.duplicate',
  '23514': 'errors.invalidValues',
  '42501': 'errors.permission',
  PGRST116: 'errors.unavailable',
};

export function toUserMessage(error, fallback = translate('en', 'errors.generic'), t = (key) => translate('en', key)) {
  if (!error) return fallback;
  if (ERROR_KEYS[error.code]) return t(ERROR_KEYS[error.code]);

  const message = error.message?.toLowerCase() || '';
  if (message.includes('invalid login credentials')) return t('errors.invalidCredentials');
  if (message.includes('failed to fetch') || message.includes('network')) {
    return t('errors.network');
  }

  // Raw database messages can expose implementation details, so unknown errors
  // are logged for developers and replaced with a stable message for users.
  console.error(error);
  return fallback;
}
