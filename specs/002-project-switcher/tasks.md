# Tasks: Project Switcher

**Input**: Design documents from `specs/002-project-switcher/`

**Branch**: `002-project-switcher`

**Tech stack**: React 18 + Vite 5 (JS/JSX), Tauri v2 (Rust), Vitest 4

**TDD note**: Constitution Principle I is non-negotiable. All test tasks MUST be written and confirmed **failing** before their corresponding implementation tasks begin.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no mutual dependencies)
- **[US?]**: Which user story this task belongs to

---

## Phase 1: Setup — Rust Backend Commands

**Purpose**: Add the two new Tauri commands that the entire feature depends on. No user story can be implemented until the JS layer can write to the app data directory.

**⚠️ CRITICAL**: Phases 2–6 all depend on these commands existing in the build.

- [x] T001 Add `get_app_data_dir(app: AppHandle) → Result<String, String>` command to `src-tauri/src/lib.rs` using `app.path().app_data_dir()`
- [x] T002 Add `write_file(path: String, content: String) → Result<(), String>` command to `src-tauri/src/lib.rs` with `create_dir_all` for parent
- [x] T003 Register `get_app_data_dir` and `write_file` in `tauri::generate_handler![]` in `src-tauri/src/lib.rs`
- [x] T004 [P] Write `cargo test` for `write_file`: create a temp file, write content, read it back with `std::fs::read_to_string`, assert equality in `src-tauri/src/lib.rs`

**Checkpoint**: `cargo test` passes. `npm run tauri dev` compiles with both new commands available via `invoke()`.

---

## Phase 2: Foundational — projectStore.js (Tests First)

**Purpose**: The persistence module and project-loader extensions that ALL user story phases depend on. Must be complete before any UI work.

**⚠️ CRITICAL**: No user story phase can begin until this phase is complete.

### Tests (write first — must FAIL before implementation)

- [x] T005 Write failing Vitest tests for `mergeProject` (add new entry, update existing by path, no mutation) in `tests/projectStore.test.js`
- [x] T006 [P] Write failing Vitest tests for `sortByRecent` (descending order, stable sort, no mutation) in `tests/projectStore.test.js`
- [x] T007 [P] Write failing Vitest tests for `pruneToLimit` (default 10, custom limit, no mutation, respects order) in `tests/projectStore.test.js`

### Implementation (make tests pass)

- [x] T008 Create `src/projectStore.js` with `mergeProject(list, entry)` pure function (makes T005 pass)
- [x] T009 [P] Add `sortByRecent(list)` pure function to `src/projectStore.js` (makes T006 pass)
- [x] T010 [P] Add `pruneToLimit(list, limit=10)` pure function to `src/projectStore.js` (makes T007 pass)
- [x] T011 Add `getRecentProjects()` async function to `src/projectStore.js` — reads `<appDataDir>/projects.json` via `invoke("file_exists")` + `invoke("read_file")`; returns `[]` on missing or malformed file with `console.warn`
- [x] T012 Add `saveRecentProject(path, name)` async function to `src/projectStore.js` — calls `getRecentProjects`, `mergeProject`, `sortByRecent`, `pruneToLimit`, then `invoke("write_file")`
- [x] T013 Add `removeRecentProject(path)` async function to `src/projectStore.js` — calls `getRecentProjects`, filters by path, writes back via `invoke("write_file")`
- [x] T014 Add `loadProjectByPath(path)` function to `src/projectLoader.js` — calls existing `loadProject(path)` without the file dialog
- [x] T015 Update `pickAndLoadProject()` in `src/projectLoader.js` to call `saveRecentProject(projectPath, data.project.name)` after a successful `loadProject()` call

**Checkpoint**: `npx vitest run tests/projectStore.test.js` — all tests pass. `projectStore.js` exports all six functions.

---

## Phase 3: User Story 1 — Reopen a Recent Project (Priority: P1) 🎯 MVP

**Goal**: User sees their previously opened projects on the WelcomeScreen and can reopen any with one click.

**Independent Test**: Open a project via Browse, close the app, relaunch — the project appears in the recent list and loads on click (quickstart.md Path 3).

- [x] T016 Add `recentProjects` state (default `[]`) and a `useEffect` that calls `getRecentProjects()` on mount to `src/App.jsx`
- [x] T017 Add `refreshRecentProjects` helper (calls `getRecentProjects()` and sets state) to `src/App.jsx`; call it after every successful `setProject()` call
- [x] T018 [US1] Pass `recentProjects` and `onOpenRecent` props into `<WelcomeScreen>` in `src/App.jsx`; `onOpenRecent` calls `loadProjectByPath()` then `setProject()` + `refreshRecentProjects()`
- [x] T019 [US1] Add `RecentProjectsList` section to `WelcomeScreen` in `src/ScreensMain.jsx`: renders a row per `ProjectRecord` with project name, truncated path, and formatted `lastOpened`; empty state shows nothing extra
- [x] T020 [US1] Rename existing "Open Spec Kit Project" button to "Browse…" in `WelcomeScreen` in `src/ScreensMain.jsx` and keep it as the primary CTA
- [x] T021 [US1] [P] Add `available` field check: in `App.jsx` `refreshRecentProjects`, call `invoke("file_exists", { path })` for each record and annotate with `available: true/false`
- [x] T022 [US1] Render unavailable rows with muted style and "(unavailable)" label in `RecentProjectsList` in `src/ScreensMain.jsx`; disable click on unavailable rows

**Checkpoint**: US1 fully functional. Recent projects persist and are clickable. Unavailable paths show as muted. Quickstart Path 3 passes.

---

## Phase 4: User Story 2 — Add a New Project While Inside Another (Priority: P2)

**Goal**: User inside a loaded project can open a brand-new project via a TopBar control without first closing the current one.

**Independent Test**: With a project loaded, click the TopBar chip → click "Browse new project…" → pick a directory → new project loads and both appear in the recent list (quickstart.md Path 4, first half).

- [x] T023 [US2] Add `ProjectSwitcher` component to `src/Shell.jsx`: renders the current project name as a button/chip in `TopBar`; accepts `projectName`, `onBrowse`, `onSwitch`, `recentProjects`, `activeProjectPath` props
- [x] T024 [US2] Add `switcherOpen` state (local to `ProjectSwitcher`) and toggle dropdown panel on chip click in `src/Shell.jsx`
- [x] T025 [US2] Add "Browse new project…" button at the bottom of the `ProjectSwitcher` dropdown in `src/Shell.jsx`; clicking it calls `onBrowse()` and closes the dropdown
- [x] T026 [US2] Pass `projectName={project.project.name}`, `onBrowse={handleOpen}`, `recentProjects`, `activeProjectPath={project.projectPath}`, and `onSwitch` props into `<AppShell>` → `<TopBar>` → `<ProjectSwitcher>` in `src/App.jsx` and `src/Shell.jsx`
- [x] T027 [US2] Add `onSwitch` handler in `src/App.jsx`: calls `loadProjectByPath(path)`, `setProject()`, `refreshRecentProjects()`; also triggers `setRoute({ page:"main" })`

**Checkpoint**: US2 functional. TopBar chip visible, dropdown opens, Browse loads a new project. Quickstart Path 4 (first half) passes.

---

## Phase 5: User Story 3 — Switch Between Remembered Projects (Priority: P2)

**Goal**: The TopBar dropdown lists all recent projects so the user can jump between them without touching the file dialog.

**Independent Test**: With projects A and B in the list and A active, click TopBar → click B → B loads, A no longer active; stale entry shows "(unavailable)" and is not clickable (quickstart.md Path 4, second half + Path 5).

- [x] T028 [US3] Render `recentProjects` list inside `ProjectSwitcher` dropdown in `src/Shell.jsx`: one row per record with name and truncated path
- [x] T029 [US3] Highlight the active project row (matching `activeProjectPath`) in `ProjectSwitcher` in `src/Shell.jsx`
- [x] T030 [US3] Wire project row click to call `onSwitch(record.path)` and close dropdown in `src/Shell.jsx`; disable click on unavailable entries
- [x] T031 [US3] [P] Show "(unavailable)" label and muted style on stale rows in `ProjectSwitcher` dropdown in `src/Shell.jsx` (reuse `available` field from annotated `recentProjects`)
- [x] T032 [US3] Close `ProjectSwitcher` dropdown on click-outside using a `useEffect` + document click listener in `src/Shell.jsx`

**Checkpoint**: US3 functional. All recent projects appear in the dropdown. Clicking switches the active project. Stale entries are visually distinguished and not clickable. Quickstart Paths 4–5 pass.

---

## Phase 6: User Story 4 — Remove a Project from the List (Priority: P3)

**Goal**: User can delete any entry from the recent-projects list in both the WelcomeScreen and the TopBar dropdown.

**Independent Test**: Click the remove button on a project row → it disappears from the list immediately and does not reappear after app restart (quickstart.md Path 5, remove step).

- [x] T033 [US4] Add remove (×) icon button to each `RecentProjectsList` row in `src/ScreensMain.jsx`; calls `onRemove(record.path)` prop
- [x] T034 [US4] Add `onRemove` handler in `src/App.jsx`: calls `removeRecentProject(path)` then `refreshRecentProjects()`; pass down to `WelcomeScreen`
- [x] T035 [US4] [P] Add remove (×) icon button to each `ProjectSwitcher` dropdown row in `src/Shell.jsx`; calls `onRemove(record.path)` and refreshes the dropdown; stop event propagation so remove doesn't trigger row click
- [x] T036 [US4] Pass `onRemove` prop through `App.jsx` → `AppShell` → `TopBar` → `ProjectSwitcher` in `src/Shell.jsx`

**Checkpoint**: US4 functional. Remove buttons work in both WelcomeScreen and TopBar. Entries are gone after removal and stay gone after restart.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, and final validation across all stories.

- [x] T037 Verify `getRecentProjects()` returns `[]` and logs a `console.warn` when `projects.json` is missing or contains malformed JSON in `src/projectStore.js`
- [x] T038 [P] Add `try/catch` in `App.jsx` around the `onOpenRecent` and `onSwitch` handlers; show the existing `error` state if `loadProjectByPath` throws (e.g. "Not a Spec Kit project")
- [x] T039 [P] Run `npx vitest run` — confirm all tests pass (T005–T007 store tests + existing parser tests)
- [x] T040 Run quickstart.md Path 6 (10-project limit): open 11 projects in sequence, confirm list stays at ≤ 10 entries

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Rust commands)**: No dependencies — start immediately
- **Phase 2 (projectStore.js)**: Depends on Phase 1 (`invoke("write_file")` must exist) — BLOCKS Phases 3–6
- **Phase 3 (US1)**: Depends on Phase 2 — first deliverable
- **Phase 4 (US2)**: Depends on Phase 2; the `ProjectSwitcher` component can be built in parallel with Phase 3
- **Phase 5 (US3)**: Depends on Phase 4 (`ProjectSwitcher` must exist)
- **Phase 6 (US4)**: Depends on Phase 3 (WelcomeScreen rows) and Phase 4 (dropdown rows)
- **Phase 7 (Polish)**: Depends on Phases 3–6 complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only — no dependency on US2/US3/US4
- **US2 (P2)**: Depends on Phase 2 only — no dependency on US1; builds `ProjectSwitcher` shell
- **US3 (P2)**: Depends on US2 (needs `ProjectSwitcher` to exist)
- **US4 (P3)**: Depends on US1 (WelcomeScreen rows) and US2 (dropdown rows)

### Within Each Phase

- Tests (T005–T007) MUST fail before T008–T010 implementation begins
- Pure functions (T008–T010) before async I/O functions (T011–T013)
- `projectStore.js` complete before `projectLoader.js` changes (T014–T015)

### Parallel Opportunities

- T004 (Rust tests), T006, T007 (store tests): can run in parallel after T005 skeleton exists
- T009, T010 (sortByRecent, pruneToLimit): parallel after T008 file created
- T021 (availability check) parallel with T019–T020 (WelcomeScreen UI)
- T031 (stale labels in switcher) parallel with T028–T030
- Phase 3 and Phase 4 can start in parallel once Phase 2 is complete (different files)

---

## Parallel Example: Phase 2 Store Tests

```
# Write all three test suites at once (same file, sequential):
T005 → T006 → T007  (all in tests/projectStore.test.js)

# Then implement all three pure functions in parallel (same file, no conflicts):
T008 (mergeProject) ‖ T009 (sortByRecent) ‖ T010 (pruneToLimit)
```

## Parallel Example: Phase 3 + Phase 4

```
# Once Phase 2 is complete:
T016–T022 (WelcomeScreen / App state)  ‖  T023–T027 (ProjectSwitcher shell)
```

---

## Implementation Strategy

### MVP (User Story 1 only)

1. Complete Phase 1: Rust commands
2. Complete Phase 2: projectStore.js + tests
3. Complete Phase 3: US1 (WelcomeScreen recent list)
4. **STOP and VALIDATE**: quickstart.md Path 1 + Path 3
5. Ship — users can already reopen recent projects

### Incremental Delivery

1. Phase 1 + 2 → foundation ready
2. Phase 3 → US1 done (MVP)
3. Phase 4 + 5 → US2 + US3 done (TopBar switcher fully functional)
4. Phase 6 → US4 done (list hygiene)
5. Phase 7 → polished and validated

---

## Notes

- `[P]` tasks touch different files or sections and have no dependency on each other within the same phase
- Each phase produces a working, independently testable increment
- The `available` field on `ProjectRecord` is runtime-only — never written to `projects.json`
- The `TopBar` `ProjectSwitcher` replaces no existing button; it is inserted between the search box and the close (×) button
- `loadProjectByPath` is a thin wrapper over the existing `loadProject`; no logic duplication
