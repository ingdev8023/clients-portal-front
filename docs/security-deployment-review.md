# Security and deployment review

Reviewed: 2026-09-24

## Release result

The frontend code and production bundle pass the automated release checks. The
linked Supabase database also passes the rollback-only RLS suite. Production
exposure is conditional on completing the hosted-project items below.

## Checks completed

- `npm run lint`: passed.
- `npm test`: 10 files and 26 tests passed.
- `npm audit --audit-level=moderate`: no known vulnerabilities.
- `npm run build`: production build completed.
- Bundle inspection: no source maps or environment files were emitted.
- Static review: no raw HTML injection, dynamic code execution, unsafe popup or
  message handling, committed secret key, or browser service-role use found.
- Live RLS suite: passed and rolled back its test writes. It covers client
  access, cross-client isolation, blocked client mutations, admin operations,
  lifecycle constraints, and deletion audit records.
- Live Supabase Security Advisor: only the leaked-password warning below remains.

## Controls added

- Supabase configuration validation rejects missing/invalid URLs, insecure
  non-local HTTP endpoints, `sb_secret_*` keys, and legacy service-role JWTs.
- Unknown backend errors are shown as stable messages and are only logged in
  development builds.
- `public/_headers` defines a restrictive Content Security Policy, anti-framing,
  MIME-sniffing protection, referrer and permissions policies, HSTS, safe HTML
  caching, and immutable caching for hashed assets.
- The database migration `20260924000100_restrict_rls_event_trigger_function.sql`
  removes browser-role execute access from the `SECURITY DEFINER`
  `public.rls_auto_enable()` function. It has been applied to the linked project.
- The RLS test script discovers real fixture UUIDs at runtime instead of relying
  on stale placeholder Auth IDs.
- Client account provisioning uses the authenticated `create-client` Edge
  Function. It verifies the caller's profile is an admin before using server-side
  Auth Admin credentials; the browser never receives those credentials.

## Required before public launch

1. Enable leaked-password protection in Supabase Auth. The live advisor reports
   it as disabled; availability can depend on the Supabase plan.
2. Set the exact production Site URL and allowed redirect URLs in hosted
   Supabase Auth. Do not push the local `supabase/config.toml` unchanged because
   its site URL intentionally points to localhost.
3. Deploy to a host that honors `public/_headers`, or reproduce every header in
   that provider's configuration. Verify the headers on the public HTTPS URL.
4. Rotate the two demo account passwords before using real client data. Keep
   signup disabled and remove unused demo accounts when onboarding is complete.
5. Enable database SSL enforcement, network restrictions, backups/PITR, and MFA
   for project owners where the selected Supabase plan supports them.
6. Configure production SMTP before enabling password recovery or invitations.

## Accepted implementation notes

- A public Supabase publishable/anon key is expected in the browser bundle; RLS
  and grants are the authorization boundary. Secret/service-role keys are not.
- The build reports a performance warning for the 518 kB main JavaScript chunk.
  This is not a security blocker, but further vendor splitting is recommended
  before the application grows substantially.
- Vite preview does not apply provider-specific `_headers`; security headers
  must be tested again on the actual deployment URL.
