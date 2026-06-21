# Research: Planning Documents UI

**Date**: 2026-06-21 | **Status**: Final

---

## Decision 1: Markdown Rendering Approach

**Decision**: Write a custom lightweight markdown-to-JSX parser in `src/markdownRenderer.js`. No new npm packages.

**Rationale**:
- Planning documents (plan.md, data-model.md, research.md, quickstart.md) use a bounded subset of GFM: headings, paragraphs, bold/italic, inline code, fenced code blocks, unordered/ordered lists, blockquotes, GFM tables, and horizontal rules. A custom renderer covering this subset is < 200 lines.
- Zero new dependencies aligns with the project's constitution preference for simplicity and auditable code.
- A pure function `parseMarkdown(text) → Block[]` is trivially unit-testable with Vitest without mocking.
- Content comes from the user's own local project files — there is no XSS risk, but `dangerouslySetInnerHTML` is still avoided as a matter of clean practice.

**Alternatives considered**:
- `marked` (npm): Parse markdown → HTML string → `dangerouslySetInnerHTML`. Lighter than `react-markdown` but introduces a dependency and bypasses React's element tree.
- `react-markdown` + `remark-gfm`: Full-featured, idiomatic React. Adds 2 dependencies and significant bundle weight (~40 KB gzipped) for a use case covered by ~150 lines of custom code.
- Reusing `parseSpec` from `parsers.js`: `parseSpec` is tightly coupled to the Spec Kit `spec.md` structure (sections, stories, requirements). Extending it for general markdown would break its contract.

---

## Decision 2: Component Architecture

**Decision**: Export `parseMarkdown(text)` (pure function) and `MarkdownView({ content })` (React component) from a single new file `src/markdownRenderer.js`.

**Rationale**:
- Co-locating the parser and renderer keeps markdown logic self-contained.
- The pure function `parseMarkdown` is independently testable in Vitest without rendering.
- `MarkdownView` is a thin wrapper: `parseMarkdown(content).map(block → <Block />)` — no state, no effects.
- This avoids modifying `designSystem.jsx` for a domain-specific component.

**Alternatives considered**:
- Put `MarkdownView` in `designSystem.jsx`: Would mix domain-specific markdown rendering into the generic design system, making it harder to maintain.
- Put everything in `ScreensArticle.jsx` inline: Untestable without rendering the full article page.

---

## Decision 3: Block Type Coverage

**Decision**: Support the following GFM block types in the parser:

| Block Type | Syntax | Why included |
|---|---|---|
| ATX Heading | `# H1` … `#### H4` | plan.md uses H1–H3; data-model.md uses H2–H4 |
| Paragraph | freeform text | all documents |
| Fenced code block | ` ``` lang … ``` ` | plan.md, quickstart.md, data-model.md |
| Unordered list | `- item`, `* item` | all documents |
| Ordered list | `1. item` | quickstart.md (step lists) |
| Blockquote | `> text` | plan.md (constitution notes), research.md |
| GFM table | `\|col\|col\|` + separator | plan.md, data-model.md, research.md |
| Horizontal rule | `---` / `***` | all documents (section dividers) |

**Inline spans** within paragraphs and list items:
- Bold: `**text**` or `__text__`
- Italic: `*text*` or `_text_`
- Inline code: `` `code` ``

**Excluded** (not present in planning docs): images, footnotes, definition lists, HTML blocks, strikethrough.

---

## Decision 4: Integration Point in ScreensArticle.jsx

**Decision**: Replace the four `RawFile`-based branches in `ArticleBody` (`sub === "plan"`, `"data"`, `"research"`, `"quickstart"`) with `<MarkdownView content={...} />`. Keep the `"View source"` tab unchanged (it uses `SourceBody` which intentionally shows raw text).

**Rationale**: Minimal change to a working system. The content strings are already available on the `feature` object — no changes to routing, data loading, or the shell are needed.

---

## Decision 5: Test Strategy

**Decision**: Test `parseMarkdown(text)` at the unit level in `tests/markdownRenderer.test.js`. No component rendering tests needed for this feature.

**Rationale**:
- The parser is a pure function — it takes a string and returns a plain JS array. Vitest can test it without JSDOM or React rendering.
- The renderer (`MarkdownView`) is a trivial map over parser output; visual correctness is verified via the dev app (quickstart paths).
- Constitution Principle I (TDD) is satisfied: tests are written first and fail before the implementation exists.
