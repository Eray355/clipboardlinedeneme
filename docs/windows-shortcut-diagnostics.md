# Opt-in shortcut recording diagnostics

These diagnostics investigate the observed Left Ctrl + Left Alt + A problem.
They do not change shortcut conversion, saved bindings, or global registration.
AltGr, a layout translation, interception, and a later replacement event remain
hypotheses until a real Windows trace distinguishes them.

## Scope and privacy

Diagnostics are off by default. They require all three arguments below and an
unpackaged source run. They are not enabled in the installed original app.
The diagnostic launch uses an isolated test profile; clipboard capture, watched
folder setup, automatic update scheduling, and background OCR are not started in
this existing test mode. Do not use its manual update or import actions.

Only active shortcut recording sessions are captured. The report contains
Electron before-input-event and DOM keydown/keyup types, allowlisted physical
codes, modifier booleans, DOM getModifierState values, Electron modifier names,
repeat/composition flags, location, observed held modifiers, and session/order
numbers. Raw key/character strings, clipboard contents, window titles, user paths,
recorder tokens, and application library content are excluded. Physical key codes
entered deliberately in the recorder are diagnostic data; do not type secrets
into the recorder. Nothing is uploaded. No global keyboard hooks are added.

The report is capped at 2,048 records per process. Each completed recording
session writes the accumulated trace to shortcut-diagnostics.json inside the
isolated profile. Restarting with that same profile replaces the report after the
next completed session. A new unique profile for each run avoids overwriting
previous evidence. A hard crash before a session ends can lose the current trace.

Order means main-process receipt order. DOM IPC delivery can lag Electron input;
elapsedMs is a relative receipt timestamp, not an OS timestamp. heldModifiers is
observed separately for each source, not an authoritative Windows keyboard-state
query. Events missed before recording or during focus changes cannot be inferred.
An Electron altGraph=false means no recognized AltGr modifier was reported; it
does not establish that Windows did not perform a layout translation.

## Windows 11 x64 procedure

Prerequisites: this diagnostic branch's working tree, Node.js 24, and npm.
In a clean Windows checkout of your fork (Eray355/clipboardlinedeneme), fetch the
diagnostic branch. If it does not already exist locally, create a tracking branch:

```powershell
git fetch origin fix/windows-shortcut-recording
git switch --track origin/fix/windows-shortcut-recording
```

If the local branch already exists, use git switch fix/windows-shortcut-recording
and check that it contains the reviewed commit. Stop on local changes or branch
conflicts rather than resetting or forcing anything. These commands do not
install or update the original app.

1. In PowerShell, enter the repository's windows directory. Keep the original
   installation and its data folders untouched. Do not run an installer.
2. Run the following commands from that directory:

   ```powershell
   node --version
   npm ci
   $diagProfile = Join-Path $env:TEMP ("ClipBoardLine-ShortcutDiagnostics-" + [guid]::NewGuid().ToString("N"))
   New-Item -ItemType Directory -Path $diagProfile | Out-Null
   $diagProfile
   npm start -- --test-mode "--test-data=$diagProfile" --shortcut-diagnostics
   ```

   Never substitute the original application's data directory for $diagProfile.
   The shell remains occupied while Electron runs; retain the printed profile
   path. No elevation or Windows security changes are needed.
3. Open Settings, then Shortcuts. Click Record for an optional global action,
   such as Library. Wait until Loading disappears. Release all keys first.
4. In four separate recording sessions, press and release these physical keys:
   Ctrl+A; Alt+A; Ctrl+Shift+A; Left Ctrl + Left Alt + A. For the last combination,
   press Left Ctrl, then Left Alt, then A while holding both modifiers; release A,
   Left Alt, and Left Ctrl. Use Cancel with the mouse after each session. Do not
   save a binding. Record the displayed candidate separately for each session.
5. Also repeat Left Alt then Left Ctrl then A, and Right Alt+A, in separate
   sessions. Note the active Windows keyboard layout manually. Compare the
   affected layout with US English if available. Do not assume Right Alt behaves
   like Left Alt on every layout.
6. Quit the diagnostic instance through its Settings Quit action (closing a
   window can hide it). After npm returns, inspect the local report:

   ```powershell
   $report = Join-Path $diagProfile "shortcut-diagnostics.json"
   Get-Content -LiteralPath $report -Raw
   ```

   Keep the report local, review it, and share it only deliberately if needed.
   Check truncated is false. If it is true, restart with a new unique profile and
   collect fewer sessions. Note whether the original app or other shortcut tools
   were running. If investigating interception, repeat after normally quitting
   competing apps; do not disable security products or Windows protections.
7. To disable diagnostics, quit the diagnostic process and omit
   --shortcut-diagnostics on future runs. To remove evidence, delete only this
   explicitly created temporary diagnostic profile after confirming its printed
   path; never delete the original application's profile. Diagnostic code is
   confined to the files listed in this change and can be removed later.

## Interpreting evidence

- Compare ControlLeft/AltLeft keydown entries and heldModifiers with flags on
  KeyA in both sources. Check releases and composition flags as well.
- Electron flags present but DOM flags missing points to Chromium/DOM translation.
- Missing Electron events needs layout/interception investigation; a missing event
  alone cannot identify which component intercepted it.
- AltGraph observations are evidence to compare, not permission to map all AltGr
  typing to Ctrl+Alt shortcuts.
- A correct chord followed by a plain KeyA may explain candidate replacement.
- Use the displayed candidate notes alongside traces: no raw candidate text is
  saved automatically. Native registration conflicts must be tested separately.

## Automated verification

From windows run npm test. Focused synthetic coverage:

```sh
node --test tests/shortcut-diagnostics.test.cjs tests/renderer-ui.test.cjs tests/global-shortcuts.test.cjs tests/shortcut-recording-acceptance.test.cjs
```

These tests exercise sanitization, session gating, ordering, held state, bounds,
local output, DOM keydown/keyup forwarding, disabled mode, and unchanged shortcut
conversion. They do not establish physical Windows input or native acceptance.
