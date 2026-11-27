# FrilAdd public registry directory

This repository is the separately maintained static directory for FrilAdd public discovery. It is data only: there is no backend, database, account system, or dynamic registration API. Consumers use the versioned directory contract documented in `schema.json` and in the FrilAdd [public directory protocol](https://github.com/FrilLab/friladd/blob/main/docs/public-registry.md).

The initial catalog is intentionally empty until an official provider entry completes maintainer review. A directory entry is a provenance and admission record, not a guarantee that provider content is safe. Inspect provider code before installing it.

## Submit an entry

Open a registry submission issue or pull request using the checklist in `CONTRIBUTING.md`. Entries are never accepted automatically. CI validates document shape and static URL policy only. It does not fetch provider URLs, execute provider code, or approve submissions. A FrilLab maintainer must independently verify repository ownership, immutable source revision, exact manifest digest, declared artifact hashes and paths, licensing/provenance, and security review notes before merging.

Only reviewed changes to `registries.json` on the protected `main` branch are published. Suspension changes an entry's status and does not delete consumer files. Corrections and rollback are reviewed JSON changes with normal Git history.

## Canonical endpoint

After the repository contains an approved entry and public HTTPS reachability is verified, the static document is available at:

`https://raw.githubusercontent.com/FrilLab/frilregistry/main/registries.json`

Clients must use their compiled canonical endpoint, not an endpoint supplied by a registry entry or user setting. The URL above is a repository path; deployment and consumer support are separate release gates.
