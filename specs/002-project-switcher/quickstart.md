# Quickstart: Project Switcher

Validation guide for confirming the Project Switcher feature works end-to-end. Covers the unit test path, the manual Tauri app path, and edge-case scenarios.

---

## Prerequisites

- Node.js ≥ 18 and Rust toolchain installed
- `npm install` completed at repo root
- Two distinct Spec Kit project directories on disk (for multi-project testing)

---

## Path 1: Run store unit tests (fastest)

```bash
npx vitest run tests/projectStore.test.js
```

**Expected outcome**: All tests pass, covering:
- `mergeProject` — adds new entry, updates existing entry by path
- `sortByRecent` — correct descending order
- `pruneToLimit` — drops entries beyond limit; default limit is 10
- Round-trip: merge → sort → prune produces expected list

---

## Path 2: Run all tests (regression check)

```bash
npx vitest run
```

**Expected outcome**: All existing tests (parseSpec, parseConstitution) plus new projectStore tests pass. No regressions.

---

## Path 3: Validate WelcomeScreen recent projects

Start the Tauri dev app:

```bash
npm run tauri dev
```

**First launch (no projects.json yet)**:
1. WelcomeScreen shows "No recent projects" state (or empty list).
2. Click "Browse…" — file dialog opens.
3. Select a Spec Kit project directory.
4. App loads the project and shows MainPage.
5. Close the project (X button in TopBar).
6. WelcomeScreen now shows one recent project row (name + path + "just now").

**Second launch (projects.json exists)**:
1. Quit and relaunch the app.
2. WelcomeScreen shows the previously opened project.
3. Click the project row — app loads it without a file dialog.

**Expected outcome**: Project persists across app restarts. One-click open works.

---

## Path 4: Validate multi-project flow

With the app running and project A loaded:

1. Click the project name in the TopBar — dropdown opens showing project A (active, highlighted) and "Browse new project…".
2. Click "Browse new project…" — file dialog opens.
3. Select project B directory.
4. App loads project B. TopBar now shows project B's name.
5. Click TopBar again — dropdown shows both project A and project B (project B active).
6. Click project A — app switches to project A without a file dialog.

**Expected outcome**: Both projects appear in the switcher. Active project is highlighted. Switching is instant (same latency as initial open).

---

## Path 5: Validate stale project handling

1. Add a project that no longer exists (or rename its directory).
2. Reopen the app.
3. WelcomeScreen shows the stale project row with an "unavailable" label.
4. The row is not clickable (or shows an error if clicked).
5. A "Remove" button on the row removes it from the list.

**Expected outcome**: Stale paths are visible and removable, but not auto-deleted.

---

## Path 6: Validate 10-project limit

1. Open 11 distinct Spec Kit project directories sequentially.
2. Close and reopen the app.
3. WelcomeScreen shows exactly 10 projects (the 11 most-recent, minus the oldest).

**Expected outcome**: List never exceeds 10 entries.

---

## References

- Data model: `specs/002-project-switcher/data-model.md`
- Rust command contracts: `specs/002-project-switcher/contracts/rust-commands.md`
- Store API contract: `specs/002-project-switcher/contracts/store-api.md`
- Store source: `src/projectStore.js` (to be created)
- Store tests: `tests/projectStore.test.js` (to be created)
