# SpecWiki

A Tauri v2 desktop app that renders any [Spec Kit](https://github.com/speckit) project as a fully cross-linked wiki — Wikipedia-style articles, talk pages, git history, search, and more. All local, read-only, no servers.

## Features

### Spec Article View
Each `spec.md` file is parsed and rendered as a Wikipedia-style article:
- **Infobox** — title, git branch, last-modified date, status badge, and a checklist of which planning documents exist
- **Table of Contents** — auto-generated from the article's sections
- **User Stories** — rendered as priority-badged story cards (P1, P2, P3) with acceptance scenarios
- **Functional Requirements** — `FR-001`-labelled requirement list
- **Callout blocks** — `> **Note**:` and `> **Warning**:` render as coloured notice boxes
- **Tables** — pipe-tables render as styled Wikitables

### Planning Documents (Rendered Markdown)
All four planning documents are displayed with full markdown formatting instead of raw text:
- **Plan** (`plan.md`) — implementation plan with headings, tables, code blocks
- **Data Model** (`data-model.md`) — entity definitions and relationships
- **Research** (`research.md`) — technical decisions and rationale
- **Quickstart** (`quickstart.md`) — step-by-step validation guide with styled code blocks

The renderer is a zero-dependency pure-JS parser covering the GFM subset used in planning docs: headings H1–H4, paragraphs, fenced code blocks, bullet and ordered lists, blockquotes, GFM tables, and horizontal rules — with inline bold, italic, and inline code.

### Task Tracking
`tasks.md` is parsed and displayed as an interactive task table showing:
- Done / pending state per task
- Parallel-execution markers `[P]`
- Overall completion progress

### Talk Page
Clarifications (`## Clarifications` Q&A pairs in `spec.md`) are surfaced in a dedicated **Talk** tab, keeping the main article clean.

### View Source
A **View source** tab shows the raw markdown of any currently-displayed document (spec, plan, data model, research, or quickstart).

### Git History
A **History** tab lists all commits that touched the feature's directory, with commit hash, message, author, and relative time. Disabled automatically when the project is not a git repo.

### Full-text Search
Searches across every feature's title, overview, user story text, and functional requirements simultaneously.

### Recent Changes
A project-wide feed of recently modified files with links back to the feature and relative timestamps.

### All Specs
A sortable table of every feature in the project: number, title, status badge, file count, last modified.

### Project Switcher
Open any local Spec Kit project via a folder picker. SpecWiki remembers recently opened projects and lets you switch between them without restarting.

### Constitution Page
The main page renders your project constitution (`​.specify/memory/constitution.md`) as formatted markdown — overview, core principles, and technology stack — so the team's engineering principles are always one click away.

### Formatting Guide
A **Formatting Guide** page (linked from the sidebar) extracts the `## Wiki Formatting Standard` section from your constitution and displays each convention as a split card: prose description on the left, example markdown on the right. Includes a one-click copy of the full standard block.

### Dynamic Status Badge
The status badge on every feature (Draft → Planned → Ready to implement → Implemented) is computed automatically from real data:
- **Implemented** — all tasks in `tasks.md` are marked done
- **Ready to implement** — `tasks.md` exists with at least one incomplete task
- **Planned** — `plan.md` exists, no `tasks.md` yet
- **Draft** — only `spec.md` exists

The badge updates instantly when you reload a project after completing tasks.

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri v2 |
| Frontend | React 18 + Vite 5 |
| Backend / file I/O | Rust (`tauri` v2, `serde`) |
| Styling | CSS custom properties (design tokens) |
| Tests | Vitest 4 |
| Build | `npm run tauri build` |

Zero runtime npm dependencies beyond React and the Tauri API. The markdown renderer ships as ~150 lines of plain JS with no external packages.

## Getting Started

### Prerequisites
- Node.js ≥ 18
- Rust toolchain ([rustup.rs](https://rustup.rs))
- Tauri v2 CLI: already listed as a dev dependency

### Run in development
```bash
npm install
npm run tauri dev
```

### Build for production
```bash
npm run tauri build
```

Produces a native app bundle in `src-tauri/target/release/bundle/`.

### Run tests
```bash
npx vitest run
```

## Project Structure

```
spec-wiki/
├── src/                  # React + Vite frontend
│   ├── App.jsx           # Root component and router
│   ├── Shell.jsx         # Sidebar + layout shell
│   ├── ScreensMain.jsx   # Main page (constitution + stats)
│   ├── ScreensArticle.jsx# Feature article, talk, source, history
│   ├── ScreensSettings.jsx # Formatting guide
│   ├── markdownRenderer.jsx # Zero-dep GFM parser + MarkdownView component
│   ├── parsers.js        # Pure spec/constitution/tasks parsers
│   ├── projectLoader.js  # Loads a Spec Kit project via Tauri IPC
│   ├── projectStore.js   # State management (zustand-style)
│   └── designSystem.jsx  # Shared UI components
├── src-tauri/            # Rust backend
│   └── src/lib.rs        # Tauri commands (file I/O, git, dialog)
├── tests/                # Vitest unit tests
└── specs/                # This project's own Spec Kit specs
```

## What is a Spec Kit Project?

A Spec Kit project is a directory with a `specs/` folder where each feature lives in its own numbered subdirectory:

```
my-project/
└── specs/
    ├── 001-user-auth/
    │   ├── spec.md          # Feature specification (required)
    │   ├── plan.md          # Implementation plan
    │   ├── data-model.md    # Entity model
    │   ├── research.md      # Technical decisions
    │   ├── quickstart.md    # Validation guide
    │   └── tasks.md         # Task breakdown
    └── 002-dashboard/
        └── spec.md
```

Open any such directory in SpecWiki and every feature is instantly browsable as a wiki article.

## License

MIT
