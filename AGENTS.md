# Personal ClipBoardLine edition

## Project goals

- This fork is strictly for the owner's personal use on Windows 11 x64. It will
  not be publicly released or distributed. No public release infrastructure or
  automatic update channel is required.
- Focus on Windows reliability, security, performance, and native integration.
- Do not modify macOS code unless explicitly requested. Upstream cross-platform
  parity documentation remains useful reference, not a requirement to change both
  platforms for a Windows-only task.
- Keep the personal edition isolated from the original application. The owner
  permits changing its name, icon, application ID, installation identity, and
  data directory for isolation in a future implementation task. These changes
  are planned, not implemented or authorized for immediate implementation.
- Plan to disable upstream automatic update functionality, including upstream
  checks and installation paths, without weakening unrelated security checks.
  Future updates will be manually built and installed after testing. Do not
  implement identity or update changes until explicitly requested.
- Follow docs/personal-windows-roadmap.md for this planned work.

## Coding rules

- Only make requested changes. Do not add unrelated refactors or extra features.
- Match the existing code style and architecture. Prefer small, focused,
  reviewable changes without unnecessary comments, abstractions, or dependencies.
- Add error handling when required for correctness, security, or data integrity.
- Ask before coding when requirements are materially unclear or risky.

## Safety and privacy

- Never delete, reset, or migrate real user data without explicit approval.
- Preserve the installed original application and its data and settings. Do not
  import, migrate, overwrite, or remove its data as part of personal-edition setup.
- Preserve clipboard history, settings, and backups, including on failed writes,
  interrupted operations, updates, and recovery.
- Never weaken security checks to make tests pass. Preserve renderer isolation,
  IPC validation, filesystem protections, network destination checks, signatures,
  and artifact checksums. Until the upstream updater is explicitly disabled,
  retain its signature, size, and hash verification; never bypass verification
  as a way to disable or replace it.
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
- Do not publish or distribute this personal edition. A passing check does not
  authorize packaging or installation; manual personal builds and installations
  must be explicitly requested and tested.
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
- Retain relevant native acceptance and security gates for manual personal builds
  and updates. An actual Windows 11 x64 runner is required for native acceptance;
  Linux results cannot replace it. Public publication workflows and an automatic
  update channel are not development requirements. macOS work and validation
  require an explicit request and an appropriate macOS host.

## Reporting

- Explain changed files and the purpose of each change.
- Report test results, remaining risks, and behavior needing real Windows 11 tests.
- Report the branch, commit when applicable, and whether changes are local or
  pushed to GitHub. Do not claim a release was published without evidence.
