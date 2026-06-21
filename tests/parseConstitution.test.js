import { describe, it, expect } from "vitest";
import { parseConstitution } from "../src/parsers.js";

const SAMPLE_CONSTITUTION = `
# SpecWiki Constitution

## Core Principles

### I. Test-Driven Development (NON-NEGOTIABLE)

All code must be covered by tests written before implementation.

### II. REST API

Backend MUST expose REST endpoints.

### III. Tauri Desktop Platform

Built as Tauri v2 desktop app.

## Wiki Formatting Standard

This section defines markdown conventions.

### Document Header

Every spec.md MUST begin with a header block.

## Technology Stack

- React 18 + Vite 5
- Rust via Tauri v2

## Development Workflow

Feature branches only; main is always shippable.

## Governance

Version: 1.0.0 | Ratified: 2026-06-21
`;

// ---------- T018: Wiki Formatting Standard NOT in principles ----------

describe("parseConstitution - Wiki Formatting Standard exclusion (T018)", () => {
  it("does NOT include Wiki Formatting Standard as a principle", () => {
    const { principles } = parseConstitution(SAMPLE_CONSTITUTION, "Test");
    const names = principles.map((p) => p.h);
    expect(names).not.toContain("Wiki Formatting Standard");
  });

  it("does NOT include Technology Stack as a principle", () => {
    const { principles } = parseConstitution(SAMPLE_CONSTITUTION, "Test");
    const names = principles.map((p) => p.h);
    expect(names).not.toContain("Technology Stack");
  });

  it("does NOT include Development Workflow as a principle", () => {
    const { principles } = parseConstitution(SAMPLE_CONSTITUTION, "Test");
    const names = principles.map((p) => p.h);
    expect(names).not.toContain("Development Workflow");
  });

  it("does NOT include Governance as a principle", () => {
    const { principles } = parseConstitution(SAMPLE_CONSTITUTION, "Test");
    const names = principles.map((p) => p.h);
    expect(names).not.toContain("Governance");
  });
});

// ---------- T019: Real principles are still present ----------

describe("parseConstitution - real principles preserved (T019)", () => {
  it("includes Core Principles section", () => {
    const { principles } = parseConstitution(SAMPLE_CONSTITUTION, "Test");
    expect(principles.some((p) => p.h === "Core Principles")).toBe(true);
  });

  it("extracts project title", () => {
    const { title } = parseConstitution(SAMPLE_CONSTITUTION, "Fallback");
    expect(title).toBe("SpecWiki Constitution");
  });

  it("principles list has only allowed sections", () => {
    const { principles } = parseConstitution(SAMPLE_CONSTITUTION, "Test");
    const forbidden = ["Wiki Formatting Standard", "Technology Stack", "Development Workflow", "Governance"];
    for (const p of principles) {
      expect(forbidden).not.toContain(p.h);
    }
  });
});
