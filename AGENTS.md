# Directory repository instructions

- Keep `registries.json` static JSON conforming to `schema.json`.
- Admission requires a human FrilLab maintainer review; never auto-approve, auto-merge, or treat CI validation as security review.
- Verify repository ownership, immutable revision, exact manifest bytes/digest, declared file hashes/paths, license/provenance, and security review before publication.
- Never fetch contributor-supplied URLs or execute provider code in validation workflows.
- Preserve history for suspension, replacement and rollback. Suspension never deletes consumer files.
- Keep secrets out of issues, PRs, workflows, and catalog data.
