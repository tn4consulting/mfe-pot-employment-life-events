# mfe-pot-employment-life-events

> **Disclaimer:** This is an independent proof-of-technology project, not
> affiliated with, endorsed by, or associated with Service Canada,
> Employment and Social Development Canada (ESDC), or the Government of
> Canada in any way. Any GC branding/design-system references are used only
> to ground the proof of technology in a realistic scenario.

The **client-centric "you lost your job" guided journey** frontend for the
mfe-pot Government of Canada MFE proof-of-technology — stitches
`mfe-pot-job-bank`, `mfe-pot-employment-insurance`, and `mfe-pot-dashboard`
together into one narrative. Federated as a remote into `mfe-pot-shell`; also
embeds dashboard's payment-history widget directly.

This README covers running **this app standalone**. For the full family (all
6 repos together) and architecture rationale, see
[`../mfe-pot-platform/README.md`](../mfe-pot-platform/README.md) and
[`CLAUDE.md`](./CLAUDE.md) in this repo.

## Prerequisites

- **asdf** with the `nodejs` plugin (`.tool-versions` pins the exact
  version — currently 22.22.0, anything ≥ 22.12 works).
- **pnpm** (not asdf-managed — install globally or via `corepack enable`).
- **A GitHub personal access token with `read:packages` scope**, exported as
  `NODE_AUTH_TOKEN` — `pnpm install` pulls `@tn4consulting/shared-*` packages
  from GitHub Packages (`.npmrc` in this repo points at that registry). `gh
  auth token` works as a substitute if you have `gh` authenticated.
- **Docker**, **kind**, **helm**, **kubectl** — only for the containerized
  loop below.

## Install & run standalone

```bash
export NODE_AUTH_TOKEN=<your GitHub token>
pnpm install
pnpm exec nx serve employment-life-events
```

Open `http://localhost:4202`. This app has no BFF of its own. Running
standalone (no shell, no dashboard), the embedded payment-history widget it
normally loads from `mfe-pot-dashboard` via the shell won't be available —
run the full family via the platform repo's README to see that composition
work end to end.

## Test, lint, build

```bash
pnpm exec nx test employment-life-events
pnpm exec nx lint employment-life-events
pnpm exec nx build employment-life-events --configuration=production
```

Or across this repo's projects at once: `pnpm run test` / `pnpm run lint` /
`pnpm run build`.

## Build & run the Docker image standalone

```bash
docker build --secret id=npm_token,src=<(printf '%s' "$NODE_AUTH_TOKEN") \
  -t mfe-pot-employment-life-events:local -f apps/employment-life-events/Dockerfile .
docker run -p 8080:80 mfe-pot-employment-life-events:local
```

## Deploy this app's Helm chart locally (kind)

```bash
pnpm deploy:local
```

Runs `tools/deploy-local.sh`: builds the image, creates/reuses a local
`kind` cluster (shared with the other app repos, named `kind`), and
`helm upgrade --install`s `charts/employment-life-events`. Requires
`../mfe-pot-platform` checked out as a sibling (this chart's library-chart
dependency resolves via a `file://../../../mfe-pot-platform/charts/...`
relative path). Add to `/etc/hosts`:

```
127.0.0.1 employment-life-events.mfe-pot.local
```

Then `curl -H "Host: employment-life-events.mfe-pot.local" http://localhost/`
or browse there directly.

## Where to go next

- [`CLAUDE.md`](./CLAUDE.md) — this repo's specific gotchas (the
  cross-remote payment-history widget wiring, a real Transloco double-import
  production bug found and fixed here, Renovate).
- [`../mfe-pot-platform/CLAUDE.md`](../mfe-pot-platform/CLAUDE.md) — the
  full architecture reference for the whole family.
- [`../mfe-pot-platform/README.md`](../mfe-pot-platform/README.md) —
  running all 6 repos together.
