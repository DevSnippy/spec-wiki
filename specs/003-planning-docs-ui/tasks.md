# Tasks: Planning Documents UI

**Input**: Design documents from `/specs/003-planning-docs-ui/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/renderer-api.md ✓, quickstart.md ✓

**Tests**: TDD required per constitution (Principle I). Unit tests for `parseMarkdown()` written first and confirmed failing before any implementation begins. No component rendering tests needed (research.md Decision 5).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths are included in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Understand the existing integration point before writing any code

- [X] T001 Read src/ScreensArticle.jsx to locate ArticleBody component and identify the four planning doc tab branches (sub === "plan", "data", "research", "quickstart") and the existing RawFile usage pattern

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TDD gate — unit tests must be written and confirmed failing before any implementation begins (Constitution Principle I)

**⚠️ CRITICAL**: No user story implementation can begin until T002 and T003 are complete

- [X] T002 Write failing unit tests for parseMarkdown() in tests/markdownRenderer.test.js covering: null/empty input returns [], heading H1–H4 produces { type:"heading", level, content }, paragraph produces { type:"paragraph", content }, fenced code block produces { type:"code", lang, content }, unordered list produces { type:"list", ordered:false, items }, ordered list produces { type:"list", ordered:true, items }, blockquote produces { type:"blockquote", content }, GFM table produces { type:"table", header, rows }, horizontal rule produces { type:"hr" }, bold/italic/inline code in paragraph content is preserved in content string
- [X] T003 Run `npx vitest run tests/markdownRenderer.test.js` and confirm tests fail with "Cannot find module './markdownRenderer'" (src/markdownRenderer.js does not exist yet)

**Checkpoint**: Tests are red. Implementation can now begin in Phase 3.

---

## Phase 3: User Story 1 — Read the Plan for Any Feature (Priority: P1) 🎯 MVP

**Goal**: Replace the raw-text plan.md display with formatted markdown rendering (headings, paragraphs, tables, code blocks).

**Independent Test**: With a project loaded that has a plan.md, navigate to that feature and click the Plan sub-tab — content renders with formatted H1/H2 headings, the constitution-check table is a proper table, and code is monospace — not a raw markdown string.

### Implementation for User Story 1

- [X] T004 [US1] Implement parseMarkdown(text) pure function in src/markdownRenderer.js — input: string | null | undefined; output: MarkdownBlock[]; always returns array, never throws; supports block types: heading (level 1–6, content string), paragraph (content string), code (lang string|null, content string), list (ordered bool, items string[]), blockquote (content string), table (header string[], rows string[][]), hr (no extra fields); consecutive blank lines collapsed; trim leading/trailing whitespace in content fields
- [X] T005 [US1] Implement renderInline(text) helper function in src/markdownRenderer.js — convert inline markdown spans within a text string to JSX: bold (**text** and __text__) → <strong>, italic (*text* and _text_) → <em>, inline code (`code`) → <code>; plain text spans remain as strings; return React node or array of nodes
- [X] T006 [US1] Implement MarkdownView({ content }) stateless functional React component in src/markdownRenderer.js — call parseMarkdown(content) and map each MarkdownBlock to JSX; heading levels map to visual hierarchy (H1 large, H2 section, H3 subsection, H4+ body-weight bold); code blocks use monospace font and var(--surface-subtle) background; tables use Wikitable component imported from ./designSystem; paragraphs and list items use renderInline(); render empty <div> when content is null/undefined/empty; wrap all output in a single root <div>
- [X] T007 [US1] Replace the plan branch in ArticleBody in src/ScreensArticle.jsx: where sub === "plan" (currently renders RawFile or similar), replace with <MarkdownView content={feature.planContent} />; add import { MarkdownView } from "./markdownRenderer" at top of file
- [X] T008 [US1] Run `npx vitest run tests/markdownRenderer.test.js` and confirm all parser unit tests pass (green)

**Checkpoint**: Plan tab renders plan.md formatted. All US1 acceptance scenarios satisfied. MVP deliverable.

---

## Phase 4: User Story 2 — Read the Data Model for Any Feature (Priority: P2)

**Goal**: Render data-model.md as formatted content in the Data Model tab using the same MarkdownView component created in Phase 3.

**Independent Test**: Navigate to the Data Model sub-tab for feature 003-planning-docs-ui — the MarkdownBlock AST example renders as a styled code block and section headings (H2) are visually distinct from body text.

### Implementation for User Story 2

- [X] T009 [US2] Replace the data branch in ArticleBody in src/ScreensArticle.jsx: where sub === "data" (currently renders RawFile or similar), replace with <MarkdownView content={feature.dataModelContent} />

**Checkpoint**: Data Model tab renders data-model.md formatted. US1 and US2 both work independently.

---

## Phase 5: User Story 3 — Read Research Notes for Any Feature (Priority: P2)

**Goal**: Render research.md as formatted content in the Research tab.

**Independent Test**: Navigate to the Research sub-tab — H2 headings ("Decision 1", "Decision 2", etc.) are visually distinct and the decision comparison table renders as a formatted table, not pipe characters.

### Implementation for User Story 3

- [X] T010 [US3] Replace the research branch in ArticleBody in src/ScreensArticle.jsx: where sub === "research" (currently renders RawFile or similar), replace with <MarkdownView content={feature.researchContent} />

**Checkpoint**: Research tab renders research.md formatted. US1, US2, and US3 all work independently.

---

## Phase 6: User Story 4 — Read the Quickstart Guide for Any Feature (Priority: P3)

**Goal**: Render quickstart.md as formatted content in the Quickstart tab, with bash code blocks and numbered steps clearly styled.

**Independent Test**: Navigate to the Quickstart sub-tab — numbered steps and bash fenced code blocks are legible and styled distinctly from body text paragraphs.

### Implementation for User Story 4

- [X] T011 [US4] Replace the quickstart branch in ArticleBody in src/ScreensArticle.jsx: where sub === "quickstart" (currently renders RawFile or similar), replace with <MarkdownView content={feature.quickstartContent} />

**Checkpoint**: All four document tabs render formatted content. All user stories independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Regression safety, edge case validation, and end-to-end quickstart verification

- [X] T012 [P] Verify the "View source" tab in src/ScreensArticle.jsx still uses SourceBody (unchanged) and still renders raw markdown text — the formatted tabs MUST NOT affect this branch
- [X] T013 [P] Verify missing document handling in src/ScreensArticle.jsx: feature.files.plan === false means the Plan tab does not appear in sub-navigation; same check for dataModel, research, quickstart flags — no blank page or JS error occurs when content is null
- [X] T014 Run `npx vitest run` (full test suite) and confirm all tests pass: markdownRenderer tests + projectStore tests + existing parser tests — zero regressions
- [X] T015 Run `npm run tauri dev` and execute quickstart.md Paths 3–7: Plan tab shows formatted headings/tables, Data Model tab shows styled code block, Research tab shows formatted decision table, Quickstart tab shows styled bash code blocks, and a feature without plan.md shows no Plan tab

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 (tests must be red first); creates shared MarkdownView
- **Phase 4 (US2)**: Depends on Phase 3 (MarkdownView must exist)
- **Phase 5 (US3)**: Depends on Phase 3 (MarkdownView must exist); independent of Phase 4
- **Phase 6 (US4)**: Depends on Phase 3 (MarkdownView must exist); independent of Phases 4–5
- **Phase 7 (Polish)**: Depends on Phases 3–6 all complete

### User Story Dependencies

- **US1 (P1)**: First story; creates the shared `parseMarkdown` + `MarkdownView` used by all others
- **US2 (P2)**: Depends on US1 (MarkdownView must exist); wires one tab; independent of US3/US4
- **US3 (P2)**: Depends on US1 (MarkdownView must exist); wires one tab; independent of US2/US4
- **US4 (P3)**: Depends on US1 (MarkdownView must exist); wires one tab; independent of US2/US3

### Within User Story 1

- T004 (parseMarkdown) → T005 (renderInline) → T006 (MarkdownView): all in same new file, sequential
- T007 (wire plan tab): depends on T006 (MarkdownView exported)
- T008 (run tests green): depends on T004–T007

### Within User Stories 2–4

- T009, T010, T011 each modify src/ScreensArticle.jsx — run sequentially to avoid conflicts
- Each is a single-line replacement; the full sequence takes minutes

### Parallel Opportunities

- T012 and T013 (Polish verification) can run in parallel — they are read-only checks
- US2 (T009), US3 (T010), US4 (T011) could be batched into one pass through src/ScreensArticle.jsx for efficiency (modify all three branches in one edit)

---

## Parallel Example: User Stories 2–4

```bash
# After US1 completes (T006 done, MarkdownView exported), all three wiring tasks
# can be done in one pass through src/ScreensArticle.jsx:
# - Replace sub === "data"      → <MarkdownView content={feature.dataModelContent} />
# - Replace sub === "research"  → <MarkdownView content={feature.researchContent} />
# - Replace sub === "quickstart" → <MarkdownView content={feature.quickstartContent} />
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Read ScreensArticle (T001)
2. Complete Phase 2: Write failing tests + confirm red (T002–T003)
3. Complete Phase 3: Implement renderer + wire plan tab (T004–T008)
4. **STOP and VALIDATE**: Tests green; plan tab renders formatted in tauri dev
5. Ship or demo Plan tab as MVP

### Incremental Delivery

1. Phase 1+2 → Understand codebase + red tests (foundation)
2. Phase 3 (US1) → Green tests + Plan tab renders → **MVP**
3. Phase 4 (US2) → Data Model tab renders
4. Phase 5 (US3) → Research tab renders
5. Phase 6 (US4) → Quickstart tab renders
6. Phase 7 → Full validation + regression check

---

## Notes

- [P] marks tasks with different files and no incomplete dependencies
- [Story] label maps each task to a specific user story for traceability
- **TDD gate**: T002–T003 must complete (red) before T004 begins — non-negotiable per constitution
- src/markdownRenderer.js is created entirely in Phase 3; US2–US4 only wire the existing MarkdownView
- The "View source" tab (SourceBody) is intentionally untouched — T012 verifies this
- feature.files.{plan,dataModel,research,quickstart} already gates tab visibility in the sidebar — no additional changes to projectLoader.js needed
- Zero new npm dependencies — MarkdownView uses Wikitable from existing ./designSystem
