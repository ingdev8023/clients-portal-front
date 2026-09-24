import { supabase } from '../lib/supabase';

const PROFILE_COLUMNS = 'id, full_name, role';
const ALLOWED_ROLES = new Set(['admin', 'client']);

export async function getAuthenticatedUser() {
  // getUser verifies the token with Supabase Auth instead of trusting only the
  // locally cached session when the application starts.
  const { data, error } = await supabase.auth.getUser();
  if (error?.name === 'AuthSessionMissingError') return null;
  if (error) throw error;
  return data.user ?? null;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data || !ALLOWED_ROLES.has(data.role)) {
    throw new Error('Your account profile is not configured correctly.');
  }
  return data;
}

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOutLocally() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}

export function subscribeToAuthChanges(onUserChange) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    // Keep this callback synchronous. Profile loading happens in React effects,
    // avoiding auth callback lockups during token refreshes.
    onUserChange(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}
