# mfe-pot-employment-life-events

## What this is

The **client-centric "you lost your job" guided journey** frontend for the mfe-pot Government of Canada MFE proof-of-technology — the app that stitches `mfe-pot-job-bank`, `mfe-pot-employment-insurance`, and `mfe-pot-dashboard` together into one narrative, rather than presenting them as separate benefit programs. Federated as a remote into `mfe-pot-shell`. Also embeds dashboard's payment-history widget directly (the one proven cross-remote widget-composition case in this architecture, not a routed remote). The fifth and final app extracted from the platform repo.

**This repo doesn't carry its own architecture doc.** Full rationale — bilingual/WCAG/GCDS requirements, the Native Federation setup, the federation-sharing policy, security model, i18n mechanism, hosting/Helm pattern, and every non-obvious gotcha behind the code in this repo — lives in **`../mfe-pot-platform/CLAUDE.md`**. Read it before making any architectural change here; this file only covers what's specific to this repo. See `../CLAUDE.md` (the `mfe-pot` meta repo) for the full 6-repo map.

## What's in this repo

- `apps/employment-life-events` — the only app; frontend-only, federated on port `4202` in local dev. No co-located BFF — there's no distinct bounded context here that justifies its own backend.
- `libs/feature-guided-journey` — the real component/business logic, including where the cross-remote payment-history widget gets mounted.
- `charts/employment-life-events` — depends only on the platform repo's `mfe-frontend-lib` (no BFF, so `mfe-backend-lib` isn't used), same shape as shell's chart.

Depends on published packages from GitHub Packages: `@tn4consulting/shared-auth`, `shared-federation-config`, `shared-federation-runtime`, `shared-i18n` (pinned in `package.json`; keep in sync with `platform-versions.json` in `mfe-pot-platform`). **Deliberately does not depend on `@gcds-core/components`/`components-angular` or `shared-runtime-config`** — confirmed genuinely unused (only `MscaAppFrame` in `shared-ui-gcds` needs the GCDS packages, and this app has no runtime-config surface at all, see below) and dropped rather than carried as dead weight.

## Repo-specific things worth knowing

- **This is the one extracted app with no `src/runtime-config.ts` and no `public/env.js`** — confirmed against the platform repo's migration history that it was never touched by the runtime-config work, since it has no BFF URLs or Strapi calls of its own to configure. The chart's `frontend.runtimeConfig` is an empty `{}`; the ConfigMap/entrypoint mechanism still runs but writes an inert `env.js` nothing here reads.
- **`PAYMENT_HISTORY_WIDGET_LOADER` (from `@tn4consulting/shared-federation-runtime`) is injected in `libs/feature-guided-journey/src/lib/employment-life-events-feature-guided-journey/employment-life-events-feature-guided-journey.ts`** — this is the DI-token pattern the platform repo's CLAUDE.md describes ("Cross-remote widget composition is host-mediated, not remote-to-remote"): the shell loads dashboard's `./PaymentHistoryWidget` and `./RemoteProviders` and hands the resolved component + providers down through this token. This app never imports dashboard directly, federated or otherwise — a plain nested `loadRemoteModule` call from here would hang forever with no error, per that same explanation. If this stops working, check the shell repo's wiring (`app.routes.ts`) before assuming the bug is here.
- **`tsconfig.app.json` had two stale references from before this token moved into `shared-federation-runtime`** (leftover paths pointing at the pre-extraction in-monorepo locations) — already cleaned up during extraction; if you see a build error referencing a `libs/employment-life-events/*` or `libs/shared/remote-registry` path that doesn't exist in this repo, that's the same class of stale-reference bug reappearing, not a new one.
- **CI** (`.github/workflows/ci.yml`): lint/test/build, then builds the image, spins up an ephemeral `kind` cluster, `helm install`s this chart, and curls the Ingress-routed hostname to confirm it serves. No `README.md` yet — still open work tracked in `../TODO.md`.

## Renovate

`renovate.json` extends `github>tn4consulting/mfe-pot-platform` — the shared preset (groups `@angular/*`, `@schematics/angular`, `listr2` into one coordinated pinned bump). Don't hand-roll Angular version bumps here independently of the other 5 repos; `platform-versions.json` in `mfe-pot-platform` is the source of truth for what version they should all be on.
