# Static directory deployment and operations

## Architecture and status

`registries.json` in this repository is the source of truth. A reviewed commit is validated, copied byte-for-byte into a deployment-only `dist/` directory, and served as a Cloudflare Workers Static Asset. There is no Worker application code, database, R2 bucket, proxy, API, authentication service, contributor URL fetch, or executable provider code. GitHub stores reviewed source and runs CI; Cloudflare serves the static file at `https://registry.frillab.com/registries.json`.

The configuration and workflow in this repository are prepared but are **not deployed**. DNS for `registry.frillab.com`, the Cloudflare zone and Worker, credentials, and a successful HTTPS response have not been verified. The interim GitHub raw endpoint is not the production endpoint. Do not describe the canonical endpoint as live until the verification checklist below passes.

Only `registries.json` and `_headers` are copied into `dist/`. The response declares `application/json; charset=utf-8`, `Cache-Control: public, max-age=60, must-revalidate`, `CDN-Cache-Control: public, max-age=60`, and `X-Content-Type-Options: nosniff`. Clients do not keep a stale directory fallback. Ordinary suspension propagation is bounded by the 60-second cache lifetime plus edge propagation; urgent suspensions require a targeted purge of the canonical URL and verification from multiple public resolvers/regions.

## One-time Cloudflare setup

The account owner must confirm that the `frillab.com` zone is managed by the intended Cloudflare account. Set the GitHub Actions variable `CLOUDFLARE_ACCOUNT_ID` and secret `CLOUDFLARE_API_TOKEN` in the `production` environment only after provisioning. The workflow grants GitHub Actions `contents: read` and has no repository write permission.

Confirm that the hostname is unassigned, then create the initial Worker and custom domain once from the reviewed Wrangler configuration. On the reviewed checkout run `npm ci`, `npm run build:static`, then `npx --no-install wrangler deploy --config wrangler.jsonc` interactively with the bootstrap credentials. Creating a new Worker requires Cloudflare Workers product `Admin`; adding its custom domain requires Worker `Editor` plus `Workers Routes Write` scoped to the `frillab.com` zone. This is a privileged, one-time operation. After the Worker and domain exist, use an account-owned API token scoped to edit/deploy only this Worker; do not retain zone route-write permission in the routine deployment token. Cloudflare currently does not support per-Worker roles for custom domains, so verify the exact account/token scope offered before saving the CI secret. Never put a global account key in GitHub.

Configure the `production` GitHub environment to restrict deployment to protected `main`; use an environment reviewer if the account's maintainer policy supports one. A push to `main` deploys only after the validation job succeeds. Routine CI uploads a version tagged with the Git commit and deploys it to all traffic without publishing triggers or custom domains. CI verifies the public response against the reviewed bytes and fails if the endpoint does not converge within the bounded verification window. Pull requests do not receive Cloudflare credentials and do not deploy. CI checks duplicate JSON keys, schema and admission policy, then deploys the reviewed document. There is no fallback URL.

## Release and verification

For an initial deployment, provision the Worker and custom domain using the reviewed `wrangler.jsonc`, then merge the reviewed workflow through repository protections. After each deployment, verify:

1. `curl -sS -D headers.txt -o registries.json https://registry.frillab.com/registries.json` succeeds without redirects.
2. TLS certificate validation succeeds; status is 200; `Content-Type` is `application/json`; cache headers have the configured 60-second freshness; and response bytes exactly match `registries.json` at the deployed source commit.
3. `/registries.json` returns valid schema-v1 JSON; unknown paths return 404; HTTP does not serve content and no redirect points to another host.
4. `fril registry discover --json` using a packed CLI succeeds from a clean environment. Record date, source commit, response headers, SHA-256, and CLI version in the FrilAdd release record.

Do not mark the domain deployed based only on a successful Wrangler command. Deployment and public HTTPS response verification are separate gates.

## Suspension, rollback, and incident response

For a provider suspension, merge a reviewed data-only change to `status: suspended`; validation and deployment are automatic after merge. The client rejects the suspended provider for new discovery, metadata resolution and installation, and does not use stale directory data. Purge only `https://registry.frillab.com/registries.json` through Cloudflare's cache controls when the normal 60-second expiry is too slow. Use a separate, short-lived operator token with only the necessary cache purge permission; never add purge permission to CI's deployment token. Verify the new bytes and status externally and record the time.

For a bad directory deployment, revert the reviewed Git commit with a new commit and let CI redeploy. Cloudflare Worker versions also support rollback; use that only if the static asset deployment itself is broken, then verify the response. Preserve Git history and incident evidence; never force-push or move provider revisions. For account or domain compromise, suspend affected entries, restrict credentials, involve the FrilLab account owner and follow `SECURITY.md`. Do not redirect clients to a different directory host during an incident.

On Cloudflare outage, public discovery fails closed. Custom/private registry operations and offline status, remove, and exact locked restore remain independent. Report the observed outage and recovery time; do not introduce a public endpoint override or GitHub raw fallback.

## Routine maintenance

Review CI, deployment result, TLS expiry/renewal, domain ownership, response size and cache behavior after directory changes. Periodically verify GitHub branch protection, code owners, Cloudflare token scope, environment protections and emergency cache-purge access. Rotate deployment and incident credentials after maintainer or account changes. FrilAdd remains in maintenance mode after the 0.2.x launch; directory entries are maintained independently and do not require an npm release.
