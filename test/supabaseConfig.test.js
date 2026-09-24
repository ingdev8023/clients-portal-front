import { describe, expect, it } from 'vitest';
import { validatePublicSupabaseConfig } from '../src/lib/supabaseConfig';

function jwtWithRole(role) {
  const encode = (value) => btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  return `${encode({ alg: 'none' })}.${encode({ role })}.signature`;
}

describe('public Supabase configuration', () => {
  it('accepts publishable and legacy anon browser keys over HTTPS', () => {
    expect(validatePublicSupabaseConfig('https://example.supabase.co/', 'sb_publishable_example')).toEqual({
      url: 'https://example.supabase.co',
      key: 'sb_publishable_example',
    });
    expect(validatePublicSupabaseConfig('https://example.supabase.co', jwtWithRole('anon')).key).toBeTruthy();
  });

  it('rejects secret and service-role keys before creating the browser client', () => {
    expect(() => validatePublicSupabaseConfig('https://example.supabase.co', 'sb_secret_example')).toThrow(/secret or service-role/i);
    expect(() => validatePublicSupabaseConfig('https://example.supabase.co', jwtWithRole('service_role'))).toThrow(/secret or service-role/i);
  });

  it('allows local HTTP development but rejects insecure remote URLs', () => {
    expect(validatePublicSupabaseConfig('http://127.0.0.1:54321', 'sb_publishable_local').url).toBe('http://127.0.0.1:54321');
    expect(() => validatePublicSupabaseConfig('http://example.com', 'sb_publishable_example')).toThrow(/HTTPS/i);
    expect(() => validatePublicSupabaseConfig('not-a-url', 'sb_publishable_example')).toThrow(/invalid/i);
  });
});
