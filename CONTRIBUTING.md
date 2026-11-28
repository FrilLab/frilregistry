# Contributing registry entries

Anyone may propose an entry. A submission is not an approval, and validation checks never automatically publish it.

Include all of the following in the issue/PR:

- Stable lower-case ID and requested tier.
- Official IDs must start with `fril` and match the lower-case name of the FrilLab-owned source repository. Community IDs must not start with `fril` and cannot use a FrilLab-owned repository.
- Proof that the publisher controls the source repository (for official entries, use the corresponding FrilLab-owned repository).
- Canonical repository URL and a full immutable Git commit ID.
- Registry manifest URL at that exact commit and SHA-256 of its exact bytes.
- File paths, SHA-256 hashes, declared sizes where available, and confirmation that all paths stay inside the repository.
- License and provenance for every declared file.
- Security review notes covering scripts, network access, generated code, and dependency requirements. FrilAdd does not execute provider code or install packages.
- Suspension/replacement contact through GitHub.

Maintainer admission procedure:

1. Confirm publisher and source-repository ownership independently.
2. Inspect the exact immutable manifest and all declared files; recalculate their hashes and check path safety.
3. Review the license and provenance and record the review scope and limitations.
4. Confirm the ID does not impersonate a reserved official namespace and no existing identity/source is shadowed.
5. Review and merge the catalog change through protected `main`. Do not approve or merge a contributor's own submission on their behalf.

CI only validates local JSON/schema constraints and static URL form. It does not contact provider hosts, execute provider code, make security decisions, or merge changes. Community entries remain opt-in in FrilAdd and require consumer consent.
