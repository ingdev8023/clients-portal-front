import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublicKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasePublicKey) {
  throw new Error(
    'Missing Supabase configuration. Add VITE_SUPABASE_URL and a public Supabase key to .env.',
  );
}

// Only a publishable/anon key belongs in the frontend. Database authorization is
// enforced by Supabase Row Level Security, never by hiding UI controls alone.
export const supabase = createClient(supabaseUrl, supabasePublicKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
