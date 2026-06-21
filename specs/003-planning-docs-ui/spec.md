# Feature Specification: Planning Documents UI

**Feature Branch**: `003-planning-docs-ui`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: "the plan / data model /research / quickstart are still .md file and not a ui"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the Plan for Any Feature (Priority: P1)

A user working inside SpecWiki wants to read the implementation plan for a feature without leaving the app and opening a text editor. They navigate to a feature and access its planning document in a formatted, readable page — the same way they already read the spec article.

**Why this priority**: The plan is the most referenced planning document during active development. Surfacing it in SpecWiki removes the constant context switch to a file browser or text editor, making it the highest-value document to render first.

**Independent Test**: With a project loaded that has a `plan.md` inside a feature directory, navigate to that feature and access the plan view — the document renders as formatted text (headings, paragraphs, tables, code blocks) without requiring any external tool.

**Acceptance Scenarios**:

1. **Given** a feature with a `plan.md` file, **When** the user opens that feature and navigates to the plan view, **Then** the plan content is displayed formatted (headings, paragraphs, tables) — not as raw markdown.
2. **Given** a feature without a `plan.md` file, **When** the user navigates to the plan view, **Then** a clear "No plan document found" message is shown.
3. **Given** a plan view is open, **When** the user navigates to a different feature, **Then** the plan view updates to show the new feature's plan.

---

### User Story 2 - Read the Data Model for Any Feature (Priority: P2)

A user wants to understand the entities and data structures described in `data-model.md` for a feature, rendered in the same Wikipedia-style layout as the spec article.

**Why this priority**: The data model is referenced heavily during implementation. It is less central than the plan but equally unreadable as raw markdown.

**Independent Test**: With a project that has a `data-model.md`, navigate to the data model view for that feature — the document renders with formatted headings, entity descriptions, and structured content.

**Acceptance Scenarios**:

1. **Given** a feature with a `data-model.md`, **When** the user navigates to the data model view, **Then** the content is rendered formatted, not as raw text.
2. **Given** a feature without a `data-model.md`, **When** the user navigates to the data model view, **Then** a "No data model document found" message is shown.

---

### User Story 3 - Read Research Notes for Any Feature (Priority: P2)

A user wants to revisit the technical decisions and rationale captured in `research.md` for a feature, without opening the file in a text editor.

**Why this priority**: Research notes are often revisited to understand why a decision was made. Sharing priority with the data model since both are secondary planning artifacts.

**Independent Test**: With a project that has a `research.md`, navigate to the research view for a feature — the document renders with formatted sections.

**Acceptance Scenarios**:

1. **Given** a feature with a `research.md`, **When** the user navigates to the research view, **Then** the content renders with formatted headings and paragraphs.
2. **Given** a feature without a `research.md`, **When** the user navigates to the research view, **Then** a clear empty state is shown.

---

### User Story 4 - Read the Quickstart Guide for Any Feature (Priority: P3)

A user wants to follow the end-to-end validation guide (`quickstart.md`) for a feature from within SpecWiki — seeing code blocks and numbered steps rendered clearly.

**Why this priority**: Quickstart guides are used less frequently (primarily during QA), so they are lower priority than plan, data model, and research.

**Independent Test**: With a feature that has a `quickstart.md`, navigate to the quickstart view — the document renders with formatted steps and code blocks that are easy to follow.

**Acceptance Scenarios**:

1. **Given** a feature with a `quickstart.md`, **When** the user navigates to the quickstart view, **Then** numbered steps and code blocks are legible and formatted.
2. **Given** a feature without a `quickstart.md`, **When** the user navigates to the quickstart view, **Then** an empty state is shown.

---

### Edge Cases

- What happens when a planning document is empty (zero bytes)?
- How does the system handle malformed or extremely long documents (>100 KB)?
- What if only some planning documents exist (e.g., plan.md present but no research.md)?
- What happens if a planning document is updated on disk while the user is viewing it?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: For each feature, the app MUST surface links or tabs to each available planning document (plan, data-model, research, quickstart).
- **FR-002**: Each planning document MUST be rendered as formatted content (headings, paragraphs, tables, code blocks) — NOT as raw markdown text.
- **FR-003**: When a planning document does not exist for a feature, the view MUST display a user-friendly "not available" message rather than an error.
- **FR-004**: The user MUST be able to navigate between planning document views and the spec article without losing their place in the feature.
- **FR-005**: Planning document views MUST be accessible from the same navigation context as the existing spec article tab.
- **FR-006**: Documents MUST be loaded from the feature's directory on disk at view time (not cached at project-load time), so edits to `.md` files are reflected on next open.
- **FR-007**: The feature's sidebar entry MUST clearly indicate which planning documents are present vs. absent for a given feature.

### Key Entities

- **PlanningDocument**: One of `plan.md`, `data-model.md`, `research.md`, `quickstart.md` found inside a feature directory; has presence (exists/missing), a document type (plan | data-model | research | quickstart), and raw content (string).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open any planning document for any feature in under 2 seconds without leaving SpecWiki or opening a file manager or text editor.
- **SC-002**: All four document types (plan, data-model, research, quickstart) render with the same visual quality as the spec article — readable headings, paragraphs, tables, and code blocks.
- **SC-003**: When a document is missing, the user understands immediately (within one glance) that it does not exist — no ambiguous blank page or error.
- **SC-004**: Navigating between planning documents and the spec article requires at most two clicks from any starting point inside a feature.

## Assumptions

- Planning documents live inside the feature directory at predictable filenames (`plan.md`, `data-model.md`, `research.md`, `quickstart.md`); no discovery scan is needed.
- The existing markdown rendering capabilities (already used for spec articles) can be reused for planning documents.
- Planning documents are read-only in SpecWiki (editing is done in an external editor); no write capability is needed.
- A feature may have zero, one, or all four planning documents — the app must handle any combination gracefully.
- The feature directory path is already known at project-load time; loading a planning document is a single file-read operation.
