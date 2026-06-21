import { useState } from "react";
import { MessageBox } from "./designSystem";
import { PageTitle } from "./ScreensMain";

function CopyBlock({ raw }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const el = document.createElement("textarea");
    el.value = raw;
    el.style.position = "fixed";
    el.style.left = "-9999px";
    el.style.top = "-9999px";
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      border: "1px solid var(--border-default)",
      borderRadius: "3px",
      marginBottom: "28px",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        background: "var(--surface-header)",
        borderBottom: "1px solid var(--border-default)",
      }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--color-base-10)" }}>
            Paste into your constitution
          </span>
          <span style={{ marginLeft: "10px", fontSize: "12px", color: "var(--color-base-50)" }}>
            Add this block to{" "}
            <code style={{ fontFamily: "var(--font-mono)" }}>.specify/memory/constitution.md</code>
            {" "}before the{" "}
            <code style={{ fontFamily: "var(--font-mono)" }}>## Governance</code> section
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 14px",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "var(--font-sans)",
            cursor: "pointer",
            borderRadius: "3px",
            border: copied ? "1px solid var(--status-impl-bd)" : "1px solid var(--border-default)",
            background: copied ? "var(--status-impl-bg)" : "#fff",
            color: copied ? "var(--status-impl-fg)" : "var(--color-base-10)",
            transition: "all 0.15s",
          }}
        >
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Scrollable code preview */}
      <div style={{
        maxHeight: "280px",
        overflowY: "auto",
        background: "var(--surface-subtle)",
        padding: "14px 18px",
      }}>
        <pre style={{
          margin: 0,
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          lineHeight: 1.7,
          color: "var(--color-base-10)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {raw}
        </pre>
      </div>
    </div>
  );
}

function SectionCard({ name, segments }) {
  return (
    <div style={{
      border: "1px solid var(--border-default)",
      borderRadius: "3px",
      marginBottom: "16px",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "9px 16px",
        background: "var(--surface-header)",
        borderBottom: "1px solid var(--border-default)",
        fontFamily: "var(--font-serif)",
        fontSize: "14px",
        fontWeight: 600,
        color: "var(--color-base-10)",
      }}>
        {name}
      </div>
      <div style={{ display: "flex" }}>
        {/* Left: description */}
        <div style={{
          flex: "1 1 42%",
          padding: "12px 16px",
          borderRight: "1px solid var(--border-default)",
          fontSize: "13px",
          lineHeight: 1.65,
          color: "var(--color-base-30)",
        }}>
          {segments.map((seg, i) =>
            seg.type === "prose"
              ? <p key={i} style={{ margin: "0 0 6px" }}>{seg.text}</p>
              : null
          )}
        </div>
        {/* Right: markdown to write */}
        <div style={{
          flex: "1 1 58%",
          background: "var(--surface-subtle)",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          {segments.filter(s => s.type === "code").length === 0 ? (
            <span style={{ fontSize: "12px", color: "var(--color-base-50)", fontStyle: "italic" }}>
              See prose description.
            </span>
          ) : (
            segments.map((seg, i) =>
              seg.type === "code" ? (
                <pre key={i} style={{
                  margin: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  lineHeight: 1.65,
                  color: "var(--color-base-10)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {seg.text}
                </pre>
              ) : null
            )
          )}
        </div>
      </div>
    </div>
  );
}

export function SettingsPage({ constitution }) {
  const conventions = constitution?.formattingStandard || [];
  const raw = constitution?.formattingStandardRaw || "";

  return (
    <div>
      <PageTitle sub="Special page">Special:FormattingGuide</PageTitle>

      <p style={{
        fontSize: "var(--text-body)",
        lineHeight: "var(--leading-body)",
        color: "var(--color-base-30)",
        margin: "0 0 18px",
      }}>
        These conventions are read from the <strong>Wiki Formatting Standard</strong> section of
        your constitution. Copy the block below into your{" "}
        <code style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>
          .specify/memory/constitution.md
        </code>{" "}
        if it's missing, then write your{" "}
        <code style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>spec.md</code> files
        using the markdown on the right of each card.
      </p>

      {conventions.length === 0 ? (
        <>
          <MessageBox variant="warning">
            No <strong>Wiki Formatting Standard</strong> section found in your constitution.
            Copy the block below and paste it into{" "}
            <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
              .specify/memory/constitution.md
            </code>{" "}
            before the <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>## Governance</code> section,
            then reload the project.
          </MessageBox>
          <div style={{ marginTop: "16px" }}>
            <CopyBlock raw={FALLBACK_STANDARD} />
          </div>
        </>
      ) : (
        <>
          <CopyBlock raw={raw} />

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border-default)" }} />
            <span style={{ fontSize: "12px", color: "var(--color-base-50)", whiteSpace: "nowrap" }}>
              {conventions.length} conventions · description → markdown to write
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-default)" }} />
          </div>

          {conventions.map((conv, i) => (
            <SectionCard key={i} name={conv.name} segments={conv.segments} />
          ))}
        </>
      )}
    </div>
  );
}

// Shown when no formatting standard exists in the constitution yet
const FALLBACK_STANDARD = `## Wiki Formatting Standard

This section defines the authoritative markdown conventions for \`spec.md\` files so SpecWiki
renders them with a Wikipedia-style layout.

### Document Header

Every \`spec.md\` MUST begin with this block:

\`\`\`markdown
# Feature Specification: [Human-Readable Title]

**Feature Branch**: \`[###-feature-name]\`

**Created**: [YYYY-MM-DD]

**Status**: [draft | planned | ready | implemented]
\`\`\`

The \`# \` heading becomes the page title and Infobox title. \`**Status**:\` drives the StatusBadge.

### Overview Section

\`\`\`markdown
## Overview

One to three sentences summarising the feature. This becomes the article lead paragraph.
\`\`\`

The \`## Overview\` heading (also accepted: \`## Summary\`) triggers lead-paragraph extraction.

### User Stories

\`\`\`markdown
## User Scenarios & Testing *(mandatory)*

### User Story 1 - [Brief Title] (Priority: P1)

[One sentence describing the user journey]

**Why this priority**: [Reason]

**Acceptance Scenarios**:

1. **Given** [state], **When** [action], **Then** [outcome]
\`\`\`

The \`(Priority: P?)\` suffix on each \`### \` heading is required for priority badge rendering.

### Functional Requirements

\`\`\`markdown
## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST [capability]
- **FR-002**: System MUST [capability]
\`\`\`

Each \`- **FR-NNN**: text\` bullet renders with the identifier as a monospace label.

### Callout Blocks

\`\`\`markdown
> **Note**: Informational callout — renders as a blue notice box.

> **Warning**: Warning callout — renders as an amber warning box.
\`\`\`

### Tables

\`\`\`markdown
| Column A | Column B |
|---|---|
| value 1  | value 2  |
\`\`\`

### Clarifications (Talk Tab)

\`\`\`markdown
## Clarifications

**Q**: [Question text]
**A**: [Answer text]
\`\`\`

Pairs under \`## Clarifications\` appear in the Talk tab only.`;
