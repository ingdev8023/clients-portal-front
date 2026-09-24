# Client Project Portal Frontend

React/Vite frontend for the Supabase client portal in `client_portal_final`. The database is the authorization authority: browser routes improve the experience, while Row Level Security decides which records each user can read or change.

## Setup

1. Copy `.env.example` to `.env`.
2. Add the Supabase project URL and public anon/publishable key. Never add a service-role key to a `VITE_*` variable because Vite includes those values in the browser bundle.
3. Install and run the app:

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run build
```

## Architecture

The application uses a small MVC-style structure suited to React:

- `src/models/`: the only modules that talk directly to Supabase. They define explicit query fields and return server data.
- `src/controllers/`: hooks that coordinate loading, validation, errors, selected records, and mutations.
- `src/pages/` and `src/components/`: views that render state and send user actions to controllers.
- `src/contexts/`: authenticated user/profile lifecycle shared by both role areas.
- `src/lib/`: Supabase setup plus formatting and safe error helpers.
- `src/styles/`: tokens, base rules, shared components, layouts, and page-specific CSS. JSX contains behavior and semantic state, not visual declarations.

## Security Notes

- Startup uses `supabase.auth.getUser()` to verify the cached token.
- Profile roles come from `public.profiles`; they are not stored in local storage or treated as a database security boundary.
- Client and admin queries select only the fields used by the interface.
- Mutations rely on backend RLS, grants, checks, and triggers. Hiding a control is never considered authorization.
- Unknown backend errors are logged for development but replaced with safe user-facing messages.
- Logout uses local scope so signing out of one shared browser session does not invalidate every session for that account.

## Repository Hygiene

Local environment files, dependencies, generated builds, coverage, caches, logs, editor metadata, and hosting state are ignored. Commit `.env.example`, `package-lock.json`, source files, and the SPA redirect in `public/_redirects`; do not commit `.env`, `node_modules`, or `dist`.
