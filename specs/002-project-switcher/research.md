# Research: Project Switcher

## Decision 1: Persistence mechanism

**Decision**: Custom `projects.json` file in the Tauri-managed app data directory, read/written via two new Rust commands — `get_app_data_dir` and `write_file`. Reading reuses the existing `read_file` command.

**Rationale**: This approach adds zero new dependencies (no new Cargo crates, no new npm packages). The `tauri::Manager::path().app_data_dir()` API is stable in Tauri v2 and returns the correct OS-specific path. Writing via `std::fs::write` is straightforward. The pattern is identical to how the rest of the app accesses the filesystem, making it easy to test and maintain.

**Alternatives considered**:
- `@tauri-apps/plugin-store`: A Tauri v2 plugin providing a reactive key-value store. Rejected because it adds a Cargo and npm dependency for a use case (a single small JSON file) that `fs::write` handles just as well.
- `localStorage` / `sessionStorage`: Browser storage APIs available in Tauri's WebView. Rejected because storage is per-origin and can be cleared by WebView cache management. Tauri's app data dir is more durable and is the correct location for application state.
- Hardcoded config path (`~/.specwiki/projects.json`): Rejected because `app_data_dir()` returns the platform-correct path without hardcoding.

---

## Decision 2: App data directory path

**Decision**: Use `app.path().app_data_dir()` from `tauri::Manager` in the `get_app_data_dir` Rust command. The path is returned as a string to the JS layer, which appends `"/projects.json"` to form the full file path.

**Rationale**: This is the Tauri v2 recommended way to get a persistent, user-specific storage location. On macOS it resolves to `~/Library/Application Support/<bundle-id>`, on Windows to `%APPDATA%\<bundle-id>`, on Linux to `~/.local/share/<bundle-id>`.

**Note**: The Tauri app bundle identifier must be set in `src-tauri/tauri.conf.json` (it is — `com.specwiki.app` or similar). The command returns the directory path; `write_file` is responsible for creating it with `create_dir_all` if absent.

---

## Decision 3: Project list size limit and stale path handling

**Decision**: Keep the 10 most recently opened projects. Stale paths (directory no longer exists) are shown with an "unavailable" label and a remove button — they are NOT auto-removed on load.

**Rationale**: Drives can be unmounted temporarily (external SSDs, network shares, removable volumes). Auto-removing a project path because the directory is momentarily absent would destroy the user's history silently. The user can manually remove a stale entry. 10 items is enough for typical usage and keeps the JSON file trivial.

---

## Decision 4: UI placement of the project switcher

**Decision**:
- **WelcomeScreen** (when no project is loaded): Shows a "Recent Projects" list of clickable rows with project name, path, and last-opened time. "Browse…" button opens the file dialog for new projects.
- **TopBar** (when a project is loaded): Shows the current project name as a clickable button. Clicking opens an inline dropdown listing all recent projects (active one highlighted) plus "Browse new project…" at the bottom. Switching closes the dropdown and replaces the active project.

**Rationale**: These are the two natural contexts where users need the switcher. The WelcomeScreen solves "reopen a known project fast." The TopBar switcher solves "I'm already in project A and want to switch to B without closing the app."

**Alternatives considered**:
- Dedicated sidebar section "My Projects": Rejected because the sidebar is scoped to the current project's features; a project-global control in the sidebar is a category mismatch.
- Always-visible projects panel (split-pane): Rejected as too complex for v1; a dropdown is sufficient.

---

## Decision 5: Active project state management

**Decision**: One active project at a time. `App.jsx` holds `project` state (existing) and `recentProjects` state (new). Switching replaces `project` in place — no tab system, no multi-window. The previous project's data is discarded from memory.

**Rationale**: The app already has a single `project` state slot. Multi-project tabs would require significant refactoring of the routing model. One-at-a-time with instant switching covers the stated user need ("switch between them").

---

## Decision 6: Pure logic separation for testability

**Decision**: `projectStore.js` exposes two layers:
1. **Pure functions** (`mergeProject`, `sortByRecent`, `pruneToLimit`, `markUnavailable`) — no Tauri imports, fully testable with Vitest.
2. **Async I/O functions** (`getRecentProjects`, `saveRecentProject`, `removeRecentProject`) — thin wrappers that call the pure functions and invoke Tauri commands.

**Rationale**: The existing `parsers.js` follows the same pattern (pure, no Tauri) and is well-tested. Isolating pure logic from I/O keeps the test surface clean and allows the Vitest tests to run without a Tauri environment.
