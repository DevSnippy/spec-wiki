# Implementation Plan: Planning Documents UI

**Branch**: `003-planning-docs-ui` | **Date**: 2026-06-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-planning-docs-ui/spec.md`

## Summary

Replace the raw-text `<pre>` display of planning documents (plan.md, data-model.md, research.md, quickstart.md) in `ArticlePage` with a formatted markdown renderer. The planning document tabs already exist in `src/ScreensArticle.jsx` and the content strings are already loaded via `src/projectLoader.js`. The only new code needed is a pure markdown-to-JSX parser + renderer (`src/markdownRenderer.js`) and updated tab bodies that use it instead of `RawFile`.

## Technical Context

**Language/Version**: JavaScript (ES2022), JSX, Rust 2021

**Primary Dependencies**: React 18, Vite 5, Tauri v2 — existing only; **no new npm packages**

**Storage**: N/A — planning doc content already loaded as strings in `feature.planContent`, `feature.dataModelContent`, `feature.researchContent`, `feature.quickstartContent`

**Testing**: Vitest 4 (frontend unit tests), `cargo test` (no new Rust tests needed)

**Target Platform**: Tauri v2 desktop (macOS, Windows, Linux)

**Project Type**: Desktop app (Tauri + React)

**Performance Goals**: Markdown rendering must complete in < 16ms per document (60fps budget); documents are small (< 100 KB)

**Constraints**: Zero new npm dependencies; the renderer must handle the GFM subset used in planning docs (headings H1–H4, paragraphs, bold/italic, inline code, fenced code blocks, bullet + ordered lists, blockquotes, GFM tables, horizontal rules)

**Scale/Scope**: Renders 4 document types across however many features exist in the project; all rendering is synchronous and in-memory

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. TDD | ✅ PASS | `tests/markdownRenderer.test.js` written and red before `src/markdownRenderer.js` implementation |
| II. REST API | ✅ N/A — justified | No new backend calls needed. Planning doc content is already in-memory from project load. Tauri IPC deviation remains justified (documented in 002-project-switcher plan). |
| III. Tauri Desktop Platform | ✅ PASS | No platform-specific changes. Pure JS/JSX renderer runs in the Tauri webview. |

## Project Structure

### Documentation (this feature)

```text
specs/003-planning-docs-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code Changes

```text
src/
├── markdownRenderer.js      # NEW — pure markdown-to-AST + JSX renderer
├── ScreensArticle.jsx       # MODIFY — replace RawFile with MarkdownView for planning docs

tests/
└── markdownRenderer.test.js # NEW — Vitest TDD tests for the renderer
```

**No changes needed to**:
- `src/projectLoader.js` — already loads all four planning doc content strings
- `src/parsers.js` — spec parsing is unchanged
- `src-tauri/src/lib.rs` — no new Rust commands needed
- `src/App.jsx`, `src/Shell.jsx`, `src/ScreensMain.jsx` — no routing changes needed
- `src/designSystem.jsx` — new `MarkdownView` component lives in `markdownRenderer.js` (co-locates renderer logic with its JSX output)

**Structure Decision**: Single new file `src/markdownRenderer.js` that exports `parseMarkdown(text)` (pure function → block AST) and `MarkdownView({ content })` (React component). This keeps markdown rendering fully self-contained and testable without touching the design system or any other source file unnecessarily.

## Complexity Tracking

> No constitution violations.
