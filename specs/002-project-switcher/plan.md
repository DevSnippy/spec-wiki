# Implementation Plan: Project Switcher

**Branch**: `002-project-switcher` | **Date**: 2026-06-21 | **Spec**: `specs/002-project-switcher/spec.md` *(not yet authored — see user brief)*

**Input**: User brief — "remember what projects are open, add new ones, switch between them."

## Summary

The Project Switcher feature adds persistent project history to SpecWiki so users can track multiple Spec Kit projects, reopen them with one click, and switch the active project without going through the file dialog each time. Persistence uses a `projects.json` file stored in the OS-appropriate Tauri app data directory, read and written via two new Rust commands (`get_app_data_dir`, `write_file`). The frontend gains a `projectStore.js` module for reading/writing the project list and two UI changes: the WelcomeScreen gains a recent-projects list, and the TopBar gains a project-switcher control that lets the user switch or add a project while inside the app.

## Technical Context

**Language/Version**: JavaScript ES modules (React 18 JSX) + Rust 2021 edition

**Primary Dependencies**: React 18, Vite 5, Tauri v2 (`@tauri-apps/api` v2), Vitest 4 — no new npm or Cargo packages required

**Storage**: `projects.json` in the Tauri-managed app data directory (`AppData\Roaming\com.specwiki.app` on Windows, `~/Library/Application Support/com.specwiki.app` on macOS, `~/.local/share/com.specwiki.app` on Linux); accessed via new Rust commands `get_app_data_dir` + existing `read_file` + new `write_file`.

**Testing**: Vitest 4 for JS store logic (pure functions mockable without Tauri); `cargo test` for new Rust commands

**Target Platform**: macOS, Windows, Linux desktop via Tauri v2

**Project Type**: Feature addition to existing desktop app

**Performance Goals**: Project list read ≤ 50 ms on startup; project switch latency same as initial project open

**Constraints**: Fully offline; max 10 recent projects stored; stale/deleted paths shown as "unavailable" (not auto-deleted); one active project at a time; no new Tauri plugins

**Scale/Scope**: Single user; ≤ 10 stored projects

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Test-Driven Development | PASS (gated) | `projectStore.js` pure logic MUST have Vitest tests before implementation. New Rust commands MUST have `cargo test` coverage. All new React components follow Red-Green-Refactor. |
| II. REST API | JUSTIFIED VIOLATION | Same as existing codebase: Tauri IPC (`invoke()`) used instead of HTTP REST. New commands follow the same established pattern. See Complexity Tracking. |
| III. Tauri Desktop Platform | PASS | `get_app_data_dir` uses `tauri::Manager::path().app_data_dir()` — idiomatic Tauri v2 API. `write_file` uses `std::fs::write` with `create_dir_all` for the parent. No new plugins. |

## Project Structure

### Documentation (this feature)

```text
specs/002-project-switcher/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── rust-commands.md # New Tauri command signatures
│   └── store-api.md     # projectStore.js public API contract
└── tasks.md             # Phase 2 output (/speckit-tasks — not yet created)
```

### Source Code changes

```text
src/
├── projectStore.js      # NEW — read/write recent-projects list; pure logic + Tauri bridge
├── projectLoader.js     # MODIFY — call saveRecentProject() after every successful load
├── ScreensMain.jsx      # MODIFY — WelcomeScreen gains recent-projects list with 1-click open
├── Shell.jsx            # MODIFY — TopBar gains ProjectSwitcher dropdown control
└── App.jsx              # MODIFY — load project list on mount; pass to WelcomeScreen + TopBar

src-tauri/src/
└── lib.rs               # MODIFY — register get_app_data_dir and write_file commands

tests/
└── projectStore.test.js # NEW — Vitest tests for mergeProject, sortByRecent, pruneToLimit
```

**Structure Decision**: Single-project layout unchanged. New `projectStore.js` isolates all persistence concerns so it can be tested without Tauri mocks.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| REST API principle: Tauri IPC used instead of HTTP REST | Same as existing codebase — Tauri IPC is idiomatic, security-model-safe, and zero-latency for a local desktop app. | Existing justification carries; no new deviation introduced by this feature. |
