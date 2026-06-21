import { describe, it, expect } from "vitest";
import { parseSpec } from "../src/parsers.js";

// ---------- T005: H3 story title and priority extraction ----------

describe("parseSpec - H3 story headings (T005)", () => {
  const md = `
# Feature Specification: Test Feature

**Feature Branch**: \`001-test\`

**Status**: draft

## Overview

Test overview.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic rendering (Priority: P1)

User opens SpecWiki.

**Why this priority**: Core deliverable.

**Acceptance Scenarios**:

1. **Given** app is open, **When** spec loaded, **Then** infobox appears.

---

### User Story 2 - Lead paragraph (Priority: P2)

Overview text appears.

**Why this priority**: Second most visible.

**Acceptance Scenarios**:

1. **Given** spec loaded, **When** article renders, **Then** lead paragraph shows.
`;

  it("extracts story title from H3 heading", () => {
    const result = parseSpec(md);
    expect(result.stories[0].title).toBe("Basic rendering");
  });

  it("extracts P1 priority from H3 heading suffix", () => {
    const result = parseSpec(md);
    expect(result.stories[0].priority).toBe("P1");
  });

  it("extracts P2 priority for second story", () => {
    const result = parseSpec(md);
    expect(result.stories[1].priority).toBe("P2");
  });

  it("extracts story count correctly", () => {
    const result = parseSpec(md);
    expect(result.stories).toHaveLength(2);
  });
});

// ---------- T006: Acceptance scenario extraction ----------

describe("parseSpec - acceptance scenarios (T006)", () => {
  const md = `
# Feature Specification: Scenarios Test

**Status**: draft

## User Scenarios & Testing

### User Story 1 - Title (Priority: P1)

Summary line here.

**Acceptance Scenarios**:

1. **Given** state A, **When** action B, **Then** outcome C.
2. **Given** state D, **When** action E, **Then** outcome F.
`;

  it("populates scenarios array", () => {
    const result = parseSpec(md);
    expect(result.stories[0].scenarios).toHaveLength(2);
  });

  it("scenario text starts with Given", () => {
    const result = parseSpec(md);
    expect(result.stories[0].scenarios[0]).toMatch(/^\*\*Given\*\*/);
  });
});

// ---------- T007: Structured FR-NNN requirements ----------

describe("parseSpec - structured requirements (T007)", () => {
  const md = `
# Feature Specification: Req Test

**Status**: draft

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST do A.
- **FR-002**: System MUST do B.
- Plain requirement without ID.
`;

  it("extracts requirement id FR-001", () => {
    const result = parseSpec(md);
    expect(result.requirements[0].id).toBe("FR-001");
  });

  it("extracts requirement text body", () => {
    const result = parseSpec(md);
    expect(result.requirements[0].text).toBe("System MUST do A.");
  });

  it("extracts requirement id FR-002", () => {
    const result = parseSpec(md);
    expect(result.requirements[1].id).toBe("FR-002");
  });

  it("handles plain requirements with null id", () => {
    const result = parseSpec(md);
    expect(result.requirements[2].id).toBeNull();
    expect(result.requirements[2].text).toBe("Plain requirement without ID.");
  });
});

// ---------- T008: Callout blocks from blockquotes ----------

describe("parseSpec - callout blocks (T008)", () => {
  const md = `
# Feature Specification: Callout Test

**Status**: draft

## Overview

Overview text.

> **Note**: This is an informational note.

> **Warning**: This is a warning.
`;

  it("parses Note as notice callout", () => {
    const result = parseSpec(md);
    const notice = result.callouts.find((c) => c.variant === "notice");
    expect(notice).toBeDefined();
    expect(notice.text).toBe("This is an informational note.");
  });

  it("parses Warning as warning callout", () => {
    const result = parseSpec(md);
    const warning = result.callouts.find((c) => c.variant === "warning");
    expect(warning).toBeDefined();
    expect(warning.text).toBe("This is a warning.");
  });

  it("returns two callouts total", () => {
    const result = parseSpec(md);
    expect(result.callouts).toHaveLength(2);
  });
});

// ---------- T009: Pipe-table extraction ----------

describe("parseSpec - pipe tables (T009)", () => {
  const md = `
# Feature Specification: Table Test

**Status**: draft

## Overview

Overview here.

| Col A | Col B | Col C |
|---|---|---|
| row1a | row1b | row1c |
| row2a | row2b | row2c |
`;

  it("extracts one table", () => {
    const result = parseSpec(md);
    expect(result.tables).toHaveLength(1);
  });

  it("extracts column headers", () => {
    const result = parseSpec(md);
    expect(result.tables[0].columns).toEqual(["Col A", "Col B", "Col C"]);
  });

  it("extracts two data rows", () => {
    const result = parseSpec(md);
    expect(result.tables[0].rows).toHaveLength(2);
  });

  it("extracts first row values", () => {
    const result = parseSpec(md);
    expect(result.tables[0].rows[0]).toEqual(["row1a", "row1b", "row1c"]);
  });
});

// ---------- Backward compatibility: legacy flat bullets still work ----------

describe("parseSpec - legacy flat bullet stories (backward compat)", () => {
  const md = `
# Feature Specification: Legacy

**Status**: draft

## User Scenarios & Testing

- As a user, I can do X.
- As a user, I can do Y.
`;

  it("still parses flat bullet stories", () => {
    const result = parseSpec(md);
    expect(result.stories).toHaveLength(2);
    expect(result.stories[0].title).toBe("As a user, I can do X.");
  });
});
