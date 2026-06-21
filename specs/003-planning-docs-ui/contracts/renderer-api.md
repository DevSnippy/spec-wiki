# Contract: Markdown Renderer API

**Module**: `src/markdownRenderer.js`  
**Type**: Pure JS functions + React component  
**Consumers**: `src/ScreensArticle.jsx` (ArticleBody)

---

## parseMarkdown(text)

```js
parseMarkdown(text: string | null | undefined) → MarkdownBlock[]
```

**Guarantees**:
- Always returns an array (never throws, never returns null/undefined)
- Returns `[]` for null, undefined, or empty string input
- Output order matches document order (top-to-bottom)
- Each block has a `type` field matching the MarkdownBlock union from data-model.md
- Consecutive blank lines are collapsed; they do not produce block nodes
- Leading/trailing whitespace in `content` strings is trimmed

**Block type coverage** (see research.md Decision 3 for full list):
- `heading` with `level` (1–6) and `content`
- `paragraph` with `content`
- `code` with `lang` (nullable) and `content`
- `list` with `ordered` (bool) and `items` (string[])
- `blockquote` with `content`
- `table` with `header` (string[]) and `rows` (string[][])
- `hr` (no extra fields)

**Out of scope**: HTML blocks, nested lists, multi-paragraph list items, image syntax, footnotes.

---

## MarkdownView({ content })

```jsx
<MarkdownView content={string | null} />
```

**Props**:
- `content`: raw markdown string (or null/undefined → renders nothing)

**Guarantees**:
- Stateless functional component; no side effects
- Renders an empty `<div>` when content is null/undefined/empty
- Wraps output in a single root `<div>` with class-less inline styles matching the SpecWiki design system
- Heading levels map to visual hierarchy: H1 → article-title size, H2 → section header, H3 → subsection, H4+ → body-weight bold
- Code blocks use monospace font and `var(--surface-subtle)` background
- Tables use the existing `Wikitable` component from `designSystem.jsx`
- Bold/italic/inline code in paragraphs and list items are rendered as `<strong>`, `<em>`, `<code>` respectively

**Not guaranteed**: pixel-perfect rendering of arbitrary markdown; edge cases outside the supported block types render as paragraphs
