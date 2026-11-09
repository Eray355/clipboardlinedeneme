# Personal Windows edition roadmap

This application is strictly for the owner's personal use on Windows 11 x64.
There is no planned public release, distribution, or automatic update channel.
The work below is planned only; implement it in separate, reviewed tasks when
explicitly requested. Do not change the installed original application.

## 1. Establish a separate application identity

- Choose a personal name and icon; separate application ID, installer/uninstaller
  identity, installation path, shortcuts, startup registration, and data directory.
- Audit Electron profile/cache paths, single-instance behavior, native integration,
  and helper/output paths so personal builds cannot reuse the original profile.
- Start with an independent personal library. Do not automatically import or
  migrate the original clipboard history, preferences, or backups.
- Verify side-by-side installation, startup, shutdown, and uninstall using isolated
  synthetic profiles on Windows 11 x64. Confirm the original application's files,
  settings, history, backups, and startup registration remain unchanged.

## 2. Disable the upstream updater in the personal edition

- Disable automatic upstream checks, timers, resume checks, announcements, and
  update notifications; prevent manual upstream download/install entry points
  from replacing the personal edition. Review settings, tray, and startup paths.
- Remove the personal edition's dependency on an upstream update feed rather than
  bypassing signatures, hashes, size limits, TLS, or other security controls.
- Preserve unrelated renderer, IPC, filesystem, clipboard, and network protections.
- Verify startup, resume, settings, and tray actions do not initiate upstream update
  requests or installers. Test offline operation and cached-update state safely.

## 3. Use tested manual personal updates

- Build and install updates manually after source tests, relevant security checks,
  and native Windows 11 x64 validation. Public release automation is unnecessary.
- Verify installer identity, artifact integrity, upgrade/uninstall behavior, failed
  installation recovery, and retention of the personal library and backups.
- Keep the original installation and data untouched. Do not delete, reset, migrate,
  or replace real user data without explicit approval.

## Other pending Windows work

- Diagnose physical Left Ctrl + Left Alt + A recording on the affected Windows
  keyboard layout before implementing a modifier-handling fix. Distinguish AltGr
  translation, Electron/DOM event handling, and external shortcut interception.
- Preserve the completed library byte-limit fix on fix/windows-library-byte-limit,
  commit fbdc1479075d0dbe9ccea58b0b44128a2444737c.

Documentation does not establish that isolation or updater disabling is already
implemented. Native Windows behavior remains unverified until actually tested.
