# SpecWiki Constitution

**Status**: ratified | **Version**: 1.0.1 | **Ratified**: 2026-06-21 | **Last Amended**: 2026-06-21

## Overview

SpecWiki is a Tauri v2 desktop application that renders Spec Kit project wikis in a
Wikipedia-style layout. This constitution defines the non-negotiable engineering principles,
technology choices, and development workflow that every contributor and AI agent MUST follow.

## Core Principles

### I. Test-Driven Development (NON-NEGOTIABLE)

All code changes MUST be covered by tests written before implementation (Red-Green-Refactor cycle).
No code MUST be merged to `main` unless every test in the suite passes.

> **Note**: This gate is machine-enforced in CI. It is not optional and cannot be bypassed by convention or time pressure.

- Tests MUST be written and confirmed **failing** before any implementation begins.
- A fully green test run is a hard prerequisite for any pull request targeting `main`.
- Unit, integration, and contract tests all contribute; at least one test type MUST cover each new behaviour.

**Rationale**: Merging untested code to `main` creates regressions that reach production. A CI gate makes this invariant machine-enforced rather than process-dependent.

### II. REST API

The application MUST expose backend functionality through RESTful HTTP endpoints. All
frontend-to-backend communication MUST go through this REST layer.

- Endpoints MUST follow REST conventions: resource-named paths, correct HTTP verbs (GET, POST, PUT, DELETE), and JSON request/response bodies.
- No direct Rust FFI calls MUST be used for business logic; REST contracts are the sole interface boundary.
- API contracts (OpenAPI or equivalent) MUST be maintained and versioned alongside source code.
- Breaking changes to an endpoint MUST increment the API version.

**Rationale**: A REST boundary provides a clean, independently testable interface between the React frontend and the Rust/Tauri backend, enabling layer-by-layer testing and clear contract ownership.

### III. Tauri Desktop Platform

SpecWiki MUST be built and distributed exclusively as a Tauri v2 desktop application.

- All platform-specific integrations MUST use Tauri v2 APIs and official plugins (e.g., `tauri-plugin-dialog`).
- Native OS capabilities MUST be accessed via Tauri commands — never via direct Node.js or raw browser APIs that bypass the Tauri security model.
- The build pipeline MUST produce platform-native bundles via `tauri build` for all target OSes.
- New native capabilities MUST be evaluated against available Tauri v2 plugins before custom implementations are considered.

**Rationale**: Tauri provides a secure, performant Rust-backed shell with access to native OS capabilities while keeping the UI layer in React/Vite and preserving a minimal attack surface.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Desktop shell | Tauri v2 (`@tauri-apps/api` v2, `@tauri-apps/cli` v2) |
| Backend / commands | Rust (`tauri` crate v2, `serde`, `serde_json`) |
| Frontend tests | Vitest |
| Backend tests | `cargo test` |
| API format | JSON over HTTP REST |
| Build | `npm run tauri build` |

## Development Workflow

- All feature work MUST happen on dedicated branches; `main` MUST always be in a shippable state.
- Pull requests targeting `main` MUST have a passing CI run before merge (Principle I enforces this automatically).
- REST endpoint changes MUST include updated API contract documentation in the same PR.
- Adding a new Tauri plugin MUST be reflected in the Technology Stack table of the relevant feature plan before implementation begins.
- Complexity deviations from these principles MUST be justified in the plan's Complexity Tracking table before work starts.

## Wiki Formatting Standard

This section defines the authoritative markdown conventions for `spec.md` files so SpecWiki
renders them with a Wikipedia-style layout. Spec authors MUST follow these conventions; SpecWiki's
parser relies on them to extract structured data for display.

> **Note**: Visit **Formatting Guide** in the SpecWiki sidebar to copy this section and see a live reference card for each convention.

### Document Header

Every `spec.md` MUST begin with this block:

```markdown
# Feature Specification: [Human-Readable Title]

**Feature Branch**: `[###-feature-name]`

**Created**: [YYYY-MM-DD]

**Status**: [draft | planned | ready | implemented]
```

The `# ` heading becomes the page title and Infobox title. `**Status**:` drives the StatusBadge.

### Overview Section

```markdown
## Overview

One to three sentences summarising the feature. This becomes the article lead paragraph.
```

The `## Overview` heading (also accepted: `## Summary`) triggers lead-paragraph extraction.
All non-blank body lines are joined and displayed below the Infobox.

### User Stories

```markdown
## User Scenarios & Testing *(mandatory)*

### User Story 1 - [Brief Title] (Priority: P1)

[One sentence describing the user journey]

**Why this priority**: [Reason]

**Acceptance Scenarios**:

1. **Given** [state], **When** [action], **Then** [outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)
```

- The `## ` heading MUST match the pattern `/user stor/i` (e.g., "User Scenarios & Testing").
- Each `### User Story N - Title (Priority: P?)` heading produces a story card with a priority badge (P1 = highest). The `(Priority: P?)` suffix is required for the badge to appear.
- `**Given**…**When**…**Then**…` lines are extracted as acceptance scenarios.

### Functional Requirements

```markdown
## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST [capability]
- **FR-002**: System MUST [capability]
```

- The `## ` heading MUST match `/functional|requirement/i`.
- Each `- **FR-NNN**: text` bullet renders with the `FR-NNN` identifier as a monospace label.

### Callout Blocks

```markdown
> **Note**: Informational callout — renders as a blue notice box.

> **Warning**: Warning callout — renders as an amber warning box.
```

Blockquote lines starting with `**Note**:` or `**Warning**:` render as coloured MessageBox components. Use sparingly — one or two per spec maximum.

### Tables

```markdown
| Column A | Column B | Column C |
|---|---|---|
| value 1  | value 2  | value 3  |
```

Standard pipe-table syntax renders as a striped Wikitable component.

### Heading Level Summary

| Level | Usage | Effect in SpecWiki |
|---|---|---|
| `# ` | Document title (once, first line only) | Page H1 + Infobox title |
| `## ` | Major sections (Overview, User Scenarios, Requirements, Clarifications) | Section extraction trigger |
| `### ` | Sub-sections (User Story N, Functional Requirements sub-heading) | Story card / sub-heading |
| `####` | Rarely used — not parsed; visible in source view only | No structured rendering |

### Clarifications (Talk Tab)

```markdown
## Clarifications

**Q**: [Question text]
**A**: [Answer text]
```

Pairs under `## Clarifications` appear in the **Talk** tab, not the article body.

## Governance

This constitution supersedes all other development practices and informal agreements.

- Amendments require a documented proposal reviewed by the team and merged to `main` with a version increment.
- `CONSTITUTION_VERSION` MUST follow semantic versioning:

| Bump | When |
|---|---|
| MAJOR | Principle removal or backward-incompatible redefinition |
| MINOR | New principle or material section expansion |
| PATCH | Clarifications, typo fixes, reformatting, non-semantic refinements |

- Compliance is reviewed during pull request code review; any violation flagged during review MUST be resolved before the PR is approved and merged.
- This file lives at `.specify/memory/constitution.md` and is the authoritative source of truth for all agents and contributors.
