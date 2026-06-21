import { describe, it, expect } from "vitest";
import { mergeProject, sortByRecent, pruneToLimit } from "../src/projectStore.js";

// ---------- T005: mergeProject ----------

describe("mergeProject - add new entry", () => {
  it("prepends a new entry to an empty list", () => {
    const result = mergeProject([], { path: "/a", name: "A", lastOpened: "2026-01-01T00:00:00.000Z" });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe("/a");
  });

  it("prepends a new entry to a non-empty list", () => {
    const existing = [{ path: "/b", name: "B", lastOpened: "2026-01-01T00:00:00.000Z" }];
    const result = mergeProject(existing, { path: "/a", name: "A", lastOpened: "2026-01-02T00:00:00.000Z" });
    expect(result).toHaveLength(2);
    expect(result[0].path).toBe("/a");
  });

  it("does not mutate the original list", () => {
    const original = [{ path: "/b", name: "B", lastOpened: "2026-01-01T00:00:00.000Z" }];
    mergeProject(original, { path: "/a", name: "A", lastOpened: "2026-01-02T00:00:00.000Z" });
    expect(original).toHaveLength(1);
  });
});

describe("mergeProject - update existing entry by path", () => {
  it("updates name and lastOpened when path already exists", () => {
    const existing = [{ path: "/a", name: "Old Name", lastOpened: "2026-01-01T00:00:00.000Z" }];
    const result = mergeProject(existing, { path: "/a", name: "New Name", lastOpened: "2026-06-01T00:00:00.000Z" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("New Name");
    expect(result[0].lastOpened).toBe("2026-06-01T00:00:00.000Z");
  });

  it("does not duplicate when updating an existing path", () => {
    const existing = [
      { path: "/a", name: "A", lastOpened: "2026-01-01T00:00:00.000Z" },
      { path: "/b", name: "B", lastOpened: "2026-01-02T00:00:00.000Z" },
    ];
    const result = mergeProject(existing, { path: "/a", name: "A Updated", lastOpened: "2026-06-01T00:00:00.000Z" });
    expect(result).toHaveLength(2);
    expect(result.filter(r => r.path === "/a")).toHaveLength(1);
  });
});

// ---------- T006: sortByRecent ----------

describe("sortByRecent", () => {
  it("sorts descending by lastOpened (most recent first)", () => {
    const list = [
      { path: "/a", name: "A", lastOpened: "2026-01-01T00:00:00.000Z" },
      { path: "/c", name: "C", lastOpened: "2026-03-01T00:00:00.000Z" },
      { path: "/b", name: "B", lastOpened: "2026-02-01T00:00:00.000Z" },
    ];
    const result = sortByRecent(list);
    expect(result[0].path).toBe("/c");
    expect(result[1].path).toBe("/b");
    expect(result[2].path).toBe("/a");
  });

  it("does not mutate the original list", () => {
    const list = [
      { path: "/a", name: "A", lastOpened: "2026-01-01T00:00:00.000Z" },
      { path: "/b", name: "B", lastOpened: "2026-02-01T00:00:00.000Z" },
    ];
    const original0 = list[0].path;
    sortByRecent(list);
    expect(list[0].path).toBe(original0);
  });

  it("returns a new array", () => {
    const list = [{ path: "/a", name: "A", lastOpened: "2026-01-01T00:00:00.000Z" }];
    expect(sortByRecent(list)).not.toBe(list);
  });

  it("handles empty list", () => {
    expect(sortByRecent([])).toEqual([]);
  });
});

// ---------- T007: pruneToLimit ----------

describe("pruneToLimit", () => {
  const makeList = (n) =>
    Array.from({ length: n }, (_, i) => ({
      path: `/p${i}`,
      name: `P${i}`,
      lastOpened: new Date(2026, 0, i + 1).toISOString(),
    }));

  it("returns all entries when list is shorter than limit", () => {
    const list = makeList(5);
    expect(pruneToLimit(list, 10)).toHaveLength(5);
  });

  it("truncates to the default limit of 10", () => {
    const list = makeList(15);
    expect(pruneToLimit(list)).toHaveLength(10);
  });

  it("truncates to a custom limit", () => {
    const list = makeList(8);
    expect(pruneToLimit(list, 3)).toHaveLength(3);
  });

  it("keeps the first (most recent) entries", () => {
    const list = makeList(5);
    const result = pruneToLimit(list, 3);
    expect(result[0].path).toBe("/p0");
    expect(result[2].path).toBe("/p2");
  });

  it("does not mutate the original list", () => {
    const list = makeList(5);
    pruneToLimit(list, 2);
    expect(list).toHaveLength(5);
  });

  it("returns a new array", () => {
    const list = makeList(3);
    expect(pruneToLimit(list, 10)).not.toBe(list);
  });
});
