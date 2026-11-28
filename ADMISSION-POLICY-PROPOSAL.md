# Proposed admission policy for a single-maintainer organization

**Draft only. This policy is not adopted, does not change branch protection, and does not authorize activating any provider.** FrilLab currently has one organization member (`mors119`). The existing required code-owner approval is an independent-review control and cannot be satisfied by that same maintainer authoring a pull request. Do not bypass the current rule. Adoption requires an explicit maintainer decision and a separately reviewed change to repository protections.

## Proposed official-provider path

An official entry requires all of the following before activation:

- The authorized FrilLab owner explicitly approves the exact provider identity and reviewed revision. Record the GitHub identity, UTC time, approval, review scope and limitations in the entry review metadata and linked admission record.
- Automated directory/schema/duplicate-key validation succeeds. CI is a format gate only and never approves or merges entries.
- The owner records source ownership, immutable source and manifest identifiers, exact manifest digest, every declared resource path/hash/size, licensing and provenance, and a manual security review. Do not execute provider code during admission.
- Before merge, the authorized owner posts an explicit approval comment on the exact admission PR naming the provider ID, repository, reviewed commit, manifest digest, and the recorded source/security/licensing review. The owner then merges the PR after required CI succeeds. The approval record and merge are attributable GitHub history; no second member is represented as having reviewed it.
- An official ID must use the `fril` namespace and match the lower-case name of its FrilLab-owned provider repository. Community IDs cannot use this namespace. The rule is generic so adding future official providers does not require a FrilAdd release. No official status transfers consumer liability or certifies code safety.

## Community-provider path

Community entries require ownership evidence and stricter manual identity, source, security, licensing and provenance review. They may not use the `fril` namespace, claim FrilLab ownership, or impersonate an official provider. CI cannot approve them. FrilAdd requires a consumer to pass `--trust-community REGISTRY_ID` for every add, update, or restore operation that includes that community provider, including transitive dependencies; a lockfile never grants consent. External community admissions remain closed until FrilLab has enough review capacity and the owner explicitly reopens them.

## Controls and trade-offs

The proposed single-owner model removes independent review for official entries and increases reliance on one person's account security, judgment and availability. To allow the sole maintainer to admit a PR they author, the exact branch-protection adjustment would set required approving reviews to zero and disable the required code-owner review gate and the last-push approval gate (both require another person in this operating model); it would continue to require the static validation status, enforce rules for administrators, dismiss stale approvals if approvals are later enabled, require linear history and resolved conversations, and prohibit force pushes and branch deletion. Auto-merge remains disabled. The owner must post the explicit admission approval comment above before merging.

This protection change is **not authorized or applied** by this proposal. Adoption requires the maintainer to explicitly approve both the policy and those exact protection settings. Until adoption and protection changes are separately authorized and verified, keep candidates suspended and do not activate them. If another authorized reviewer becomes available, restore one required code-owner approval before further admissions.

If a second authorized reviewer becomes available, restore independent review for all admissions. External community admissions remain closed unless the maintainer explicitly reopens them under the stricter review standard.
