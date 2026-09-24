import { createClient } from '@supabase/supabase-js';
import { validatePublicSupabaseConfig } from './supabaseConfig';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublicKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

const publicConfig = validatePublicSupabaseConfig(supabaseUrl, supabasePublicKey);

// Only a publishable/anon key belongs in the frontend. Database authorization is
// enforced by Supabase Row Level Security, never by hiding UI controls alone.
export const supabase = createClient(publicConfig.url, publicConfig.key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
