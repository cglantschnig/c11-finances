# c11 Finances

Portfolio tracker for recording transactions, monitoring holdings, and keeping an FX-aware trade ledger in one place.
Built with TanStack Start on the frontend, with Clerk auth and Convex on the backend.

## Start locally

Local development runs through `portless` and serves the app over HTTPS at `https://c11-finances.localhost`:

```bash
bun install
bun dev
```

On first run, `portless` may prompt to trust a local certificate authority and bind to port `443`. That can require elevation on macOS/Linux.

If you want auth and backend features enabled locally, add the required Clerk and Convex values to `.env.local` first.

## Clerk and Convex with portless

`portless` only changes the frontend origin. Keep `VITE_CONVEX_URL` pointed at the same Convex deployment you already use for local development.

`portless` still runs the Vite app on an internal local port behind the proxy. That port is not the intended user-facing URL; use `https://c11-finances.localhost`.

For Clerk-based sign-in to work on `https://c11-finances.localhost`, make sure that origin is allowed in the Clerk configuration used for local development. If you use OAuth providers such as Google or GitHub through Clerk, add matching local redirect/origin entries there as well.

The app already uses relative redirect targets for sign-in, sign-up, and sign-out, so no code changes are needed for the hostname switch. The main local risk is missing allowlist entries in Clerk or the upstream OAuth provider.
