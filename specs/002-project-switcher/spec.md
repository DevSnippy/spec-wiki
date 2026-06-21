# Feature Specification: Project Switcher

**Feature Branch**: `002-project-switcher`

**Created**: 2026-06-21

**Status**: planned

## Overview

Add persistent project history to SpecWiki so users can track multiple Spec Kit projects, reopen them with a single click, and switch the active project at any time without going through the file dialog again.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reopen a recent project (Priority: P1)

A user who works on multiple projects wants to switch back to a project they've opened before without clicking through a file dialog.

**Why this priority**: This is the core use case — without it every session starts from scratch.

**Acceptance Scenarios**:

1. **Given** the user has previously opened project A, **When** they relaunch SpecWiki, **Then** project A appears in the recent-projects list on the WelcomeScreen.
2. **Given** a recent project is listed, **When** the user clicks its row, **Then** the project loads immediately with no file dialog.

---

### User Story 2 - Add a new project while inside another (Priority: P2)

A user is browsing project A and wants to open project B without first closing project A.

**Why this priority**: Context switching without closing is a key productivity win.

**Acceptance Scenarios**:

1. **Given** project A is loaded, **When** the user clicks the project name in the TopBar, **Then** a dropdown appears with all recent projects and a "Browse new project…" option.
2. **Given** the switcher dropdown is open, **When** the user clicks "Browse new project…", **Then** the file dialog opens and selecting a directory loads that project.

---

### User Story 3 - Switch between remembered projects (Priority: P2)

A user wants to jump from the currently active project to another project they've opened before.

**Why this priority**: Without this, "remembering" projects has no value once you're inside the app.

**Acceptance Scenarios**:

1. **Given** projects A and B are both in the recent list and A is active, **When** the user opens the TopBar dropdown and clicks B, **Then** the app switches to project B instantly.
2. **Given** a recent project's directory has been deleted, **When** the dropdown or WelcomeScreen renders, **Then** that entry shows as "unavailable" and cannot be opened.

---

### User Story 4 - Remove a stale project from the list (Priority: P3)

A user wants to clean up projects they no longer work on from the recent list.

**Why this priority**: List hygiene — important but not blocking.

**Acceptance Scenarios**:

1. **Given** a project is in the recent list, **When** the user clicks its remove button, **Then** it is removed from the list immediately and from persistent storage.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist the recent-projects list across app restarts using the OS app data directory.
- **FR-002**: System MUST store at most 10 recent projects; opening an 11th MUST drop the oldest.
- **FR-003**: System MUST display recent projects on the WelcomeScreen sorted most-recent-first.
- **FR-004**: System MUST allow one-click loading of any recent project from the WelcomeScreen.
- **FR-005**: System MUST show a project-switcher dropdown in the TopBar when a project is loaded.
- **FR-006**: System MUST allow adding a new project via the file dialog from within the TopBar switcher.
- **FR-007**: System MUST update the recent-projects list every time a project is successfully loaded.
- **FR-008**: System MUST display stale project paths (directory no longer exists) as "unavailable" without auto-removing them.
- **FR-009**: System MUST allow manual removal of any entry from the recent-projects list.
- **FR-010**: System MUST support only one active project at a time.

## Clarifications

**Q**: Should the app support multiple simultaneously open projects (tabs)?
**A**: No — one active project at a time for v1. Tabs are a future feature.

**Q**: What happens to the recent list if projects.json is corrupted?
**A**: Return an empty list and log a warning; do not crash. The user can add projects again normally.
