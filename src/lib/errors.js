const ERROR_MESSAGES = {
  '23505': 'That value is already in use. Choose another one and try again.',
  '23514': 'One or more values do not meet the project rules.',
  '42501': 'You do not have permission to perform this action.',
  PGRST116: 'The requested record is not available.',
};

export function toUserMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (ERROR_MESSAGES[error.code]) return ERROR_MESSAGES[error.code];

  const message = error.message?.toLowerCase() || '';
  if (message.includes('invalid login credentials')) return 'The email or password is incorrect.';
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  // Raw database messages can expose implementation details, so unknown errors
  // are logged for developers and replaced with a stable message for users.
  console.error(error);
  return fallback;
}
