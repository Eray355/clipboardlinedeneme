# Personal ClipBoardLine edition

## Project goals

- This fork is a personal edition. Windows 11 x64 is the primary target.
- Focus on Windows reliability, security, performance, and native integration.
- Do not modify macOS code unless explicitly requested. Upstream cross-platform
  parity documentation remains useful reference, not a requirement to change both
  platforms for a Windows-only task.
- Keep the personal edition isolated from the original application. Changes to
  application, installer, storage, or update identities require an explicit task;
  do not silently reuse or replace production identities, feeds, or trust keys.

## Coding rules

- Only make requested changes. Do not add unrelated refactors or extra features.
- Match the existing code style and architecture. Prefer small, focused,
  reviewable changes without unnecessary comments, abstractions, or dependencies.
- Add error handling when required for correctness, security, or data integrity.
- Ask before coding when requirements are materially unclear or risky.

## Safety and privacy

- Never delete, reset, or migrate real user data without explicit approval.
- Preserve clipboard history, settings, and backups, including on failed writes,
  interrupted operations, updates, and recovery.
- Never weaken security checks to make tests pass. Preserve renderer isolation,
  IPC validation, filesystem protections, network destination checks, signatures,
  artifact checksums, and update verification.
- Never commit credentials, clipboard contents, private user files, signing
  material, local preferences, databases, backups, or generated validation data.
- Use synthetic test content and isolated temporary profiles. Do not change an
  installed application or its data as part of ordinary development or tests.
- Do not introduce external data transmission without explicit approval.

## Git workflow

- Use separate branches for individual fixes. Commit only reviewed, relevant
  changes; inspect staged paths and the diff before committing.
- Never automatically merge into main or push to main. Push another branch only
  when explicitly requested, after verifying the destination is the personal fork.
- Never publish releases without explicit approval. A passing check does not
  authorize packaging, distribution, release publication, or installation.
- Do not force-push, reset, or overwrite existing work. Preserve the
  fix/windows-library-byte-limit branch and commit
  fbdc1479075d0dbe9ccea58b0b44128a2444737c.
- Treat Eray355/clipboardlinedeneme as this fork's expected GitHub destination;
  verify actual fetch and push remotes before any push. Upstream
  orkunisitmak/clipboardline is reference source, not an authorized push target.

## Verification

- Never claim something works unless it was actually tested. Distinguish source
  inspection, synthetic/model tests, renderer tests, and native Windows acceptance.
- Distinguish Linux results from native Windows results. Report passed, failed,
  and skipped tests, and clearly state what remains unverified.
- Run meaningful existing tests for affected Windows behavior and add focused
  regression tests for correctness, security, or data integrity fixes.
- Preserve useful parity checker tests and shared version validation where
  relevant, including python3 scripts/check-release-version.py --require-windows.
  Do not imply these checks certify native macOS or Windows behavior.
- Preserve publication/source audits and secret scans. Run them before sharing
  changes. Do not substitute source-text checks for behavioral evidence.
- Do not automatically run npm audit fix or upgrade dependencies without approval.
- Retain native acceptance and security gates for any explicitly authorized future
  release. An actual Windows 11 x64 runner is required for native acceptance;
  Linux results cannot replace it. macOS work and validation require an explicit
  request and an appropriate macOS host.

## Reporting

- Explain changed files and the purpose of each change.
- Report test results, remaining risks, and behavior needing real Windows 11 tests.
- Report the branch, commit when applicable, and whether changes are local or
  pushed to GitHub. Do not claim a release was published without evidence.
