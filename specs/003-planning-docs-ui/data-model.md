# Data Model: Planning Documents UI

**Date**: 2026-06-21

---

## MarkdownBlock (AST Node)

The parser converts a raw markdown string into an array of `MarkdownBlock` objects. This is the intermediate representation between raw text and rendered JSX.

```text
MarkdownBlock
├── type: "heading" | "paragraph" | "code" | "list" | "blockquote" | "table" | "hr"
│
├── (type = "heading")
│   ├── level: 1 | 2 | 3 | 4 | 5 | 6
│   └── content: string  (inline markdown, may contain bold/italic/code spans)
│
├── (type = "paragraph")
│   └── content: string  (inline markdown)
│
├── (type = "code")
│   ├── lang: string | null  (language hint from fenced code block)
│   └── content: string  (raw code, no inline processing)
│
├── (type = "list")
│   ├── ordered: boolean
│   └── items: string[]  (each item is inline markdown)
│
├── (type = "blockquote")
│   └── content: string  (raw text inside the quote; may span multiple lines)
│
├── (type = "table")
│   ├── header: string[]  (column header labels)
│   └── rows: string[][]  (2D array; each inner array is one row's cells)
│
└── (type = "hr")
    (no extra fields)
```

## InlineSpan (inline content within content strings)

`content` fields in heading, paragraph, list item, and blockquote blocks contain raw markdown inline syntax. The renderer resolves these to JSX using a secondary `renderInline(text)` function.

```text
InlineSpan
├── plain: string
├── bold: string  (wrapped in ** or __)
├── italic: string  (wrapped in * or _)
└── code: string  (wrapped in `)
```

## Existing Feature Object (unchanged fields consumed by this feature)

The `feature` object returned by `projectLoader.js` already carries all the content this feature needs:

```text
feature
├── planContent: string | null        (raw plan.md content)
├── dataModelContent: string | null   (raw data-model.md content)
├── researchContent: string | null    (raw research.md content)
├── quickstartContent: string | null  (raw quickstart.md content)
└── files
    ├── plan: boolean         (tab visibility gate)
    ├── dataModel: boolean
    ├── research: boolean
    └── quickstart: boolean
```

No new fields are added to the `feature` object. `MarkdownView` receives the raw string and parses it at render time.

## State Model

`MarkdownView` is stateless — it is a pure function of its `content` prop. No `useState` or `useEffect` is needed. Parsing happens synchronously during render; documents are small enough that no memoization is required.
