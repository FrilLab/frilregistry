# Directory repository instructions

- Keep `registries.json` static JSON conforming to `schema.json`.
- Keep the `fril` ID namespace for official entries whose IDs match their FrilLab repository names. Community entries cannot use that namespace or a FrilLab-owned repository; preserve this generic rule so future official providers remain data-only additions.
- Admission requires a human FrilLab maintainer review; never auto-approve, auto-merge, or treat CI validation as security review.
- Verify repository ownership, immutable revision, exact manifest bytes/digest, declared file hashes/paths, license/provenance, and security review before publication.
- Never fetch contributor-supplied URLs or execute provider code in validation workflows.
- Preserve history for suspension, replacement and rollback. Suspension never deletes consumer files.
- Keep secrets out of issues, PRs, workflows, and catalog data.
