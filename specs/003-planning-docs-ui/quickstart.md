# Quickstart: Planning Documents UI

Validation guide for confirming the Planning Documents UI feature works end-to-end.

---

## Prerequisites

- Node.js ≥ 18 and Rust toolchain installed
- `npm install` completed at repo root
- A Spec Kit project with at least one feature that has a `plan.md` (this project, `spec-wiki`, qualifies — use `specs/003-planning-docs-ui/`)

---

## Path 1: Run parser unit tests (fastest)

```bash
npx vitest run tests/markdownRenderer.test.js
```

**Expected outcome**: All tests pass, covering:
- `parseMarkdown(null)` returns `[]`
- Headings H1–H4 produce `{ type:"heading", level, content }`
- Fenced code blocks produce `{ type:"code", lang, content }`
- Bullet lists produce `{ type:"list", ordered:false, items }`
- Ordered lists produce `{ type:"list", ordered:true, items }`
- GFM tables produce `{ type:"table", header, rows }`
- Blockquotes produce `{ type:"blockquote", content }`
- Paragraphs produce `{ type:"paragraph", content }`
- Horizontal rules produce `{ type:"hr" }`
- Bold/italic/inline code in paragraph content is preserved in the content string

---

## Path 2: Run all tests (regression check)

```bash
npx vitest run
```

**Expected outcome**: All tests pass — parser tests + projectStore tests + existing parser tests. No regressions.

---

## Path 3: Validate Plan tab renders formatted content

```bash
npm run tauri dev
```

1. Open the `spec-wiki` project directory.
2. Click on feature `003-planning-docs-ui` in the sidebar.
3. Click the **Plan** sub-tab.

**Expected outcome**:
- The plan.md content renders with formatted headings (H1 `# Implementation Plan...` is large serif), paragraphs, bold text, and the constitution-check table is a proper table — **not a raw text block**.
- The "View source" tab still shows the raw markdown text.

---

## Path 4: Validate Data Model tab

1. Click the **Data Model** sub-tab on the same feature.

**Expected outcome**:
- data-model.md renders with formatted code blocks (the `MarkdownBlock` AST example shows as a styled code block) and section headings.

---

## Path 5: Validate Research tab

1. Click the **Research** sub-tab.

**Expected outcome**:
- research.md renders with section headings (H2 "Decision 1", etc.) and the decision table renders as a formatted table.

---

## Path 6: Validate Quickstart tab

1. Click the **Quickstart** sub-tab.

**Expected outcome**:
- quickstart.md renders with numbered steps and fenced code blocks (`bash` blocks) styled distinctly from body text.

---

## Path 7: Validate missing document handling

1. Open a feature that has no `plan.md` (e.g., a freshly created spec with only `spec.md`).
2. The **Plan** tab does not appear in the sub-navigation (it is filtered out by `feature.files.plan === false`).

**Expected outcome**: No Plan tab is shown; no error occurs.

---

## References

- Parser contract: `specs/003-planning-docs-ui/contracts/renderer-api.md`
- Data model: `specs/003-planning-docs-ui/data-model.md`
- Source: `src/markdownRenderer.js` (to be created)
- Tests: `tests/markdownRenderer.test.js` (to be created)
- Integration point: `src/ScreensArticle.jsx` `ArticleBody` (plan/data/research/quickstart branches)
