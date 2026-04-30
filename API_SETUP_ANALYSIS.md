# Linky 2.0 — APIs & Systems Setup Analysis

**Generated:** 2026-04-30
**Local repo:** `/Users/Projects/Linky`
**Origin (your fork):** https://github.com/waqarawnarme/Linky-2.0
**Upstream (original):** https://github.com/trylinky/linky (LICENSE references the older `tryglow/glow`)
**Current branch:** `main` (1 commit ahead of pushed `b120988`; `c0eb1c8` and `fbe61a0` still local — see SESSION_HANDOFF.md)

---

## 1. Where the project stands today

| Service | Status | URL |
|---|---|---|
| Marketing (Vercel) | Live | `marketing-git-main-waqarawnarmes-projects.vercel.app` |
| Frontend (Vercel) | Live | `linky-2-0-frontend.vercel.app` |
| API (Render free) | Crashes at startup — fix is local-only on commit `c0eb1c8` | `linky-api-lcaw.onrender.com` |
| Database (Neon Postgres) | Live, ap-southeast-1 | (set in env) |

Everything below the API is wired. Until the API boots and you pick an auth method, nothing past the public profile page works (no signup, no editor save, no integrations).

---

## 2. What APIs the codebase actually consumes

This was derived by grepping every `process.env.*` reference under `apps/api/src`, `apps/frontend`, and `apps/marketing`, then cross-checking against `package.json` deps and the `apps/api/src/modules/services/*` and `apps/api/src/modules/integrations/*` directories.

### 2a. Core / required to run at all

| System | Env vars consumed | Where | Status in your fork |
|---|---|---|---|
| **Postgres database** (you're using Neon) | `DATABASE_URL`, `DIRECT_URL` | Prisma client used everywhere | Configured in `.env.local`, Vercel, Render |
| **Encryption secret** | `ENCRYPTION_KEY` (32-byte hex) | `apps/api/src/lib/encrypt.ts` for OAuth token storage | Configured |
| **Better-Auth secret** | `AUTH_SECRET`, `AUTH_TRUST_HOST` | `apps/api/src/lib/auth.ts` | Configured |
| **Internal service-to-service** | `INTERNAL_API_KEY` | Frontend → API trusted requests | Configured |
| **App URLs** | `API_BASE_URL`, `APP_FRONTEND_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MARKETING_URL`, `NEXT_PUBLIC_ROOT_DOMAIN` | All apps | Configured |

Nothing missing here. These are why the marketing/frontend deployments work and the public profile page renders.

### 2b. Auth providers (you need at least one to ship)

`apps/api/src/lib/auth.ts` currently registers `socialProviders: { google, twitter, tiktok }` and a `magicLink` plugin. `emailAndPassword` is **disabled**. Effectively, no end-user can sign in until at least one of these is configured.

| Provider | Env vars | Status | Notes |
|---|---|---|---|
| Google OAuth | `AUTH_GOOGLE_CLIENT_ID`, `AUTH_GOOGLE_CLIENT_SECRET` | Removed per commit `aebc7e4`, but `auth.ts` still references the vars | Will silently no-op (better-auth tolerates blanks) |
| Twitter OAuth | `AUTH_TWITTER_CLIENT_ID`, `AUTH_TWITTER_CLIENT_SECRET` | Vars present in `.env.local`, **empty** | Easiest social option |
| TikTok OAuth | `AUTH_TIKTOK_CLIENT_KEY`, `AUTH_TIKTOK_CLIENT_SECRET` | Vars present in `.env.local`, **empty** | Approval can be slow |
| Magic-link email | `RESEND_API_KEY` (current code path) | **Empty.** SESSION_HANDOFF mentions Gmail SMTP, but the notifications service still imports `createResendClient` only — no nodemailer wiring exists in `apps/api/src/modules/notifications/service.tsx` | Either set `RESEND_API_KEY` or actually implement the Gmail SMTP transport you've documented |
| Email + password | (none — handled by better-auth) | Disabled in `auth.ts` (`emailAndPassword: { enabled: false }`) | Cheapest fix: flip to `true` and skip provider setup entirely |

> **Recommended next move:** the smallest viable path is to flip `emailAndPassword.enabled = true` (no external API needed) **or** sign up for Resend (free tier is 100 emails/day — covers magic links). GitHub OAuth would also be straightforward but isn't currently registered in `auth.ts` and would need to be added.

### 2c. Integrations consumed by the editor blocks

These map 1:1 to the block packages under `packages/blocks/src/blocks/*`. Each block is optional — the page just won't expose that block until its keys exist.

| Block | API used | Env vars | Status | Effort to enable |
|---|---|---|---|---|
| Spotify Embed / Spotify Now Playing | Spotify Web API (OAuth) | `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URL` | Vars exist, **client ID/secret empty**, redirect URL set | Free; need a Spotify Developer App |
| Instagram (latest post, follower count) | Instagram Graph API + legacy basic display | `INSTAGRAM_CLIENT_ID/SECRET/CALLBACK_URL` plus `INSTAGRAM_LEGACY_*` | Not in `.env.local` at all | Meta Developer review can take days |
| Threads (follower count) | Threads Graph API | `THREADS_CLIENT_ID/SECRET/CALLBACK_URL` | Not set | Same Meta Developer flow |
| TikTok (latest post, follower count) | TikTok Open API | `TIKTOK_CLIENT_KEY/SECRET/CALLBACK_URL` (separate from auth keys above) | Not set | Approval queue |
| GitHub commits this month | GitHub REST API (PAT, no OAuth) | `GITHUB_AUTH_TOKEN` | **Empty** | 30-second fix — generate a PAT |
| Map block | Mapbox + Google Maps | `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Not set in `.env.local` | Both have generous free tiers |
| YouTube embed | None at runtime — uses iframe only | (none) | Works as-is | — |
| Reactions | DynamoDB | `REACTIONS_TABLE_NAME` + AWS creds | Not set | Optional; won't break other blocks |

### 2d. Infra / observability / utility

| System | Env vars | Status | Notes |
|---|---|---|---|
| AWS S3 (image uploads) | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | Region set, keys empty | `apps/api/src/modules/assets/service.ts` will throw on upload until configured. Bucket name is templated as `${APP_ENV}.glow.user-uploads` — you'll need to either create that bucket or rename the template |
| Resend (transactional email) | `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` | Empty | `service.tsx` no-ops when blank; safe to leave off until you ship auth |
| Sentry (error reporting) | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` | Empty | Sourcemap upload already disabled in build; safe to leave off |
| PostHog (analytics) | `POSTHOG_API_KEY`, `NEXT_PUBLIC_POSTHOG_KEY` | Not set | `features.ts` flag is on; client gracefully no-ops |
| Tinybird (page view tracker) | `TINYBIRD_API_KEY`, `NEXT_PUBLIC_TINYBIRD_TRACKER_TOKEN` | Empty | Tracker script just isn't injected when blank |
| Slack new-user notifier | `SLACK_TOKEN` | Not set | `features.ts` `slack.enabled = true` will print "Slack is not enabled" warnings and skip |
| Stripe (billing) | `STRIPE_API_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Removed by commit `aebc7e4`, but the `apps/api/src/modules/billing/*` code still imports `stripeClient` | Lazy-init fix is in commit `c0eb1c8` (still **local**, must `git push`) — once pushed, billing routes load but throw if anyone hits them |
| Hygraph CMS (marketing blog) | `HYGRAPH_TOKEN`, `HYGRAPH_ENDPOINT` | Stripped out by commits `85ec422` / `c53f818` | Safe to leave blank |

---

## 3. Original repo vs. your fork — what was removed

Walking through the divergent commits between your fork and `90a38aa Initial commit from trylinky/linky upstream`:

| Commit | Effect on services |
|---|---|
| `aebc7e4` | Removed Stripe/Google OAuth/Resend as direct deps |
| `85ec422` / `c53f818` / `af13c1a` / `224919a` | Removed Hygraph CMS coupling so marketing builds without a CMS |
| `80bb54c` / `536c2f1` | Removed login walls; added a localStorage-only `/edit` route |
| `4a53b95` / `8823d47` / `b120988` | Next.js bumped to 15.5.x; type-check skipped during build |
| `f309b76` / `a32d0a8` / `b9b562b` | Prisma generate/no-engine + missing radix dep fixes |
| `a7dc99e` / `fbe61a0` | Added `render.yaml` Blueprint + DEPLOYMENT.md |
| `c0eb1c8` | **Lazy Stripe init — fixes the current Render crash** |

Your fork has **not** removed Stripe code from `apps/api/src/modules/billing/*`; only the dependency-loading crash was patched. If you genuinely don't want billing, the cleaner long-term move is to delete that module's route registration in `apps/api/src/index.ts`.

Similarly, the `socialProviders` block in `auth.ts` still references Google client vars even though the dep was removed — better-auth will skip it when blanks are passed but it's noise.

---

## 4. What you need to set up to ship — minimum viable

In strict order:

1. **Push the two unpushed commits** (`fbe61a0`, `c0eb1c8`) so Render gets the Stripe lazy-init fix. You said the Cowork sandbox can't release the git lockfile, so do this from your Mac terminal:
   ```
   cd /Users/Projects/Linky
   rm -f .git/*.lock
   git push origin main
   ```
2. **Verify Render API boots.** SESSION_HANDOFF says hit `/healthz`, but I confirmed there is **no `/healthz` route registered** in `apps/api/src/index.ts` — you'll get 404. Either add a route (`fastify.get('/healthz', () => ({ ok: true }))`) or hit `/api/auth/session` and look for a JSON response instead of HTML.
3. **Pick an auth path** (one of the following):
   - **Easiest:** Edit `apps/api/src/lib/auth.ts` and set `emailAndPassword: { enabled: true }`. No third-party setup at all.
   - **Magic-link via Resend:** Sign up at resend.com → API key → set `RESEND_API_KEY` on Render → done. Free tier covers it.
   - **Twitter OAuth:** Already half-wired. Create a Twitter Developer app, set `AUTH_TWITTER_CLIENT_ID` / `AUTH_TWITTER_CLIENT_SECRET` on Render, and add the callback URL to the Twitter app dashboard.
4. **Run Prisma migrations against Neon** if not already applied:
   ```
   DATABASE_URL="<neon-direct-url>" pnpm --filter @trylinky/prisma run prisma:migrate deploy
   ```
5. **Walk one signup → create page → save flow** end to end before adding integrations.

---

## 5. What to set up next — only when you actually need it

| Want to enable | Provider | Where to set it | Cost |
|---|---|---|---|
| Image uploads in the editor | AWS S3 (or swap to Cloudflare R2) | Render env: `AWS_*`; rename bucket template in `assets/service.ts` | S3 free tier covers small use |
| Spotify "now playing" block | Spotify Developer | Render env: `SPOTIFY_CLIENT_ID/SECRET/REDIRECT_URL` | Free |
| GitHub commits block | GitHub PAT (no OAuth needed) | Render env: `GITHUB_AUTH_TOKEN` | Free |
| Map block | Mapbox + Google Maps | Vercel frontend env: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Free tiers fine |
| Instagram / Threads / TikTok blocks | Meta + TikTok Developer apps | Render env per table 2c | Free, but app review can take days |
| Page-view analytics | Tinybird | Vercel frontend env: `NEXT_PUBLIC_TINYBIRD_TRACKER_TOKEN` (+ pipes already in `packages/tinybird/`) | Free tier |
| Product analytics | PostHog | Render env: `POSTHOG_API_KEY` | Free tier |
| Error tracking | Sentry | Render env: `SENTRY_DSN` + Vercel: `NEXT_PUBLIC_SENTRY_DSN` | Free tier |
| New-user Slack pings | Slack bot token | Render env: `SLACK_TOKEN` | Free |
| Reactions block (heart counts etc.) | AWS DynamoDB | Render env: `REACTIONS_TABLE_NAME` + AWS creds | Pennies |

---

## 6. Things worth fixing while you're in there

- The codebase has Stripe billing routes registered but no Stripe configuration. Either remove the route registration in `apps/api/src/index.ts` or fully gut the `billing/` module — leaving it half-wired invites future startup crashes.
- `auth.ts` still references `AUTH_GOOGLE_*` even though Google OAuth was supposedly removed. Either re-enable Google or drop the block from `socialProviders`.
- `features.ts` toggles for `slack`, `posthog`, and `resend` are all set to `enabled: true` even though no keys exist. Set them to `false` (or read from env) to silence the warning logs.
- SESSION_HANDOFF says you switched from Resend to Gmail SMTP, but the notifications service still calls `createResendClient()` — no nodemailer code path exists. Either implement the Gmail transport or update the doc.
- No `/healthz` route exists. Add one to `apps/api/src/index.ts` so Render's health checks (and the curl in the runbook) actually do something.

---

## 7. TL;DR — the only blockers

To get from "API crashes" to "users can sign up and create a page":

1. `git push` the two local commits (Stripe lazy-init + render.yaml).
2. Confirm Render boots.
3. Either flip `emailAndPassword.enabled = true` (zero external dependency) **or** add `RESEND_API_KEY` for magic links.
4. Confirm Prisma migrations are applied to Neon.

Everything else — Spotify, Instagram, Mapbox, S3, analytics — is opt-in per block and can be added later without any code changes beyond setting env vars.
