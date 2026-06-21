import { describe, it, expect } from "vitest";
import { parseMarkdown } from "../src/markdownRenderer.jsx";

// ---------- Null / empty input ----------

describe("parseMarkdown - null/empty input", () => {
  it("returns [] for null", () => {
    expect(parseMarkdown(null)).toEqual([]);
  });
  it("returns [] for undefined", () => {
    expect(parseMarkdown(undefined)).toEqual([]);
  });
  it("returns [] for empty string", () => {
    expect(parseMarkdown("")).toEqual([]);
  });
  it("returns [] for whitespace-only string", () => {
    expect(parseMarkdown("   \n\n   ")).toEqual([]);
  });
});

// ---------- Headings ----------

describe("parseMarkdown - headings", () => {
  it("parses H1", () => {
    const blocks = parseMarkdown("# Hello World");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({ type: "heading", level: 1, content: "Hello World" });
  });
  it("parses H2", () => {
    const [b] = parseMarkdown("## Section Two");
    expect(b).toEqual({ type: "heading", level: 2, content: "Section Two" });
  });
  it("parses H3", () => {
    const [b] = parseMarkdown("### Sub Section");
    expect(b).toEqual({ type: "heading", level: 3, content: "Sub Section" });
  });
  it("parses H4", () => {
    const [b] = parseMarkdown("#### Deep Heading");
    expect(b).toEqual({ type: "heading", level: 4, content: "Deep Heading" });
  });
  it("trims heading content", () => {
    const [b] = parseMarkdown("#  Leading space  ");
    expect(b.content).toBe("Leading space");
  });
});

// ---------- Paragraphs ----------

describe("parseMarkdown - paragraphs", () => {
  it("parses a simple paragraph", () => {
    const blocks = parseMarkdown("This is a paragraph.");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({ type: "paragraph", content: "This is a paragraph." });
  });
  it("joins consecutive non-blank lines into one paragraph", () => {
    const [b] = parseMarkdown("Line one\nLine two\nLine three");
    expect(b.type).toBe("paragraph");
    expect(b.content).toContain("Line one");
  });
  it("produces separate blocks for paragraphs separated by blank lines", () => {
    const blocks = parseMarkdown("First paragraph.\n\nSecond paragraph.");
    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe("paragraph");
    expect(blocks[1].type).toBe("paragraph");
  });
  it("collapses multiple consecutive blank lines", () => {
    const blocks = parseMarkdown("Para one.\n\n\n\nPara two.");
    expect(blocks).toHaveLength(2);
  });
});

// ---------- Fenced code blocks ----------

describe("parseMarkdown - fenced code blocks", () => {
  it("parses a fenced code block with language", () => {
    const md = "```js\nconsole.log('hi');\n```";
    const [b] = parseMarkdown(md);
    expect(b).toEqual({ type: "code", lang: "js", content: "console.log('hi');" });
  });
  it("parses a fenced code block without language", () => {
    const md = "```\nsome code\n```";
    const [b] = parseMarkdown(md);
    expect(b.type).toBe("code");
    expect(b.lang).toBeNull();
    expect(b.content).toBe("some code");
  });
  it("preserves internal whitespace in code blocks", () => {
    const md = "```text\nline 1\n  line 2\nline 3\n```";
    const [b] = parseMarkdown(md);
    expect(b.content).toBe("line 1\n  line 2\nline 3");
  });
  it("parses bash code block (used in quickstart.md)", () => {
    const md = "```bash\nnpx vitest run\n```";
    const [b] = parseMarkdown(md);
    expect(b).toEqual({ type: "code", lang: "bash", content: "npx vitest run" });
  });
});

// ---------- Unordered lists ----------

describe("parseMarkdown - unordered lists", () => {
  it("parses a dash-prefixed unordered list", () => {
    const md = "- item one\n- item two\n- item three";
    const [b] = parseMarkdown(md);
    expect(b.type).toBe("list");
    expect(b.ordered).toBe(false);
    expect(b.items).toEqual(["item one", "item two", "item three"]);
  });
  it("parses an asterisk-prefixed unordered list", () => {
    const md = "* alpha\n* beta";
    const [b] = parseMarkdown(md);
    expect(b.type).toBe("list");
    expect(b.ordered).toBe(false);
    expect(b.items).toHaveLength(2);
  });
  it("trims list item content", () => {
    const [b] = parseMarkdown("-  extra space  ");
    expect(b.items[0]).toBe("extra space");
  });
});

// ---------- Ordered lists ----------

describe("parseMarkdown - ordered lists", () => {
  it("parses an ordered list", () => {
    const md = "1. first\n2. second\n3. third";
    const [b] = parseMarkdown(md);
    expect(b.type).toBe("list");
    expect(b.ordered).toBe(true);
    expect(b.items).toEqual(["first", "second", "third"]);
  });
  it("handles non-sequential numbers", () => {
    const md = "1. one\n1. also one\n1. still one";
    const [b] = parseMarkdown(md);
    expect(b.ordered).toBe(true);
    expect(b.items).toHaveLength(3);
  });
});

// ---------- Blockquotes ----------

describe("parseMarkdown - blockquotes", () => {
  it("parses a single-line blockquote", () => {
    const md = "> This is a quote.";
    const [b] = parseMarkdown(md);
    expect(b).toEqual({ type: "blockquote", content: "This is a quote." });
  });
  it("parses a multi-line blockquote", () => {
    const md = "> Line one.\n> Line two.";
    const [b] = parseMarkdown(md);
    expect(b.type).toBe("blockquote");
    expect(b.content).toContain("Line one");
    expect(b.content).toContain("Line two");
  });
  it("parses blockquote with bold marker (used in constitution notes)", () => {
    const md = "> **Note**: Important callout.";
    const [b] = parseMarkdown(md);
    expect(b.type).toBe("blockquote");
    expect(b.content).toContain("**Note**");
  });
});

// ---------- GFM Tables ----------

describe("parseMarkdown - GFM tables", () => {
  it("parses a simple table", () => {
    const md = "| A | B | C |\n|---|---|---|\n| 1 | 2 | 3 |";
    const [b] = parseMarkdown(md);
    expect(b.type).toBe("table");
    expect(b.header).toEqual(["A", "B", "C"]);
    expect(b.rows).toEqual([["1", "2", "3"]]);
  });
  it("parses a table with multiple rows", () => {
    const md = "| Name | Value |\n|------|-------|\n| foo | bar |\n| baz | qux |";
    const [b] = parseMarkdown(md);
    expect(b.type).toBe("table");
    expect(b.header).toHaveLength(2);
    expect(b.rows).toHaveLength(2);
    expect(b.rows[0]).toEqual(["foo", "bar"]);
    expect(b.rows[1]).toEqual(["baz", "qux"]);
  });
  it("trims whitespace in table cells", () => {
    const md = "|  Col A  |  Col B  |\n|---------|----------|\n|  val 1  |  val 2  |";
    const [b] = parseMarkdown(md);
    expect(b.header[0]).toBe("Col A");
    expect(b.rows[0][0]).toBe("val 1");
  });
  it("parses a table with alignment separators (colons)", () => {
    const md = "| Left | Center | Right |\n|:-----|:------:|------:|\n| a | b | c |";
    const [b] = parseMarkdown(md);
    expect(b.type).toBe("table");
    expect(b.header).toEqual(["Left", "Center", "Right"]);
  });
});

// ---------- Horizontal rules ----------

describe("parseMarkdown - horizontal rules", () => {
  it("parses --- as hr", () => {
    const [b] = parseMarkdown("---");
    expect(b).toEqual({ type: "hr" });
  });
  it("parses *** as hr", () => {
    const [b] = parseMarkdown("***");
    expect(b).toEqual({ type: "hr" });
  });
  it("parses ___ as hr", () => {
    const [b] = parseMarkdown("___");
    expect(b).toEqual({ type: "hr" });
  });
});

// ---------- Inline spans (preserved in content strings) ----------

describe("parseMarkdown - inline spans in paragraph content", () => {
  it("preserves bold markers in paragraph content", () => {
    const [b] = parseMarkdown("This is **bold** text.");
    expect(b.type).toBe("paragraph");
    expect(b.content).toContain("**bold**");
  });
  it("preserves italic markers in paragraph content", () => {
    const [b] = parseMarkdown("This is *italic* text.");
    expect(b.content).toContain("*italic*");
  });
  it("preserves inline code markers in paragraph content", () => {
    const [b] = parseMarkdown("Use `parseMarkdown()` to parse.");
    expect(b.content).toContain("`parseMarkdown()`");
  });
  it("preserves __bold__ alternative syntax", () => {
    const [b] = parseMarkdown("This is __bold__ too.");
    expect(b.content).toContain("__bold__");
  });
  it("preserves _italic_ alternative syntax", () => {
    const [b] = parseMarkdown("This is _italic_ too.");
    expect(b.content).toContain("_italic_");
  });
});

// ---------- Mixed document (document order preserved) ----------

describe("parseMarkdown - mixed document", () => {
  it("returns blocks in document order", () => {
    const md = [
      "# Title",
      "",
      "A paragraph.",
      "",
      "- item a",
      "- item b",
      "",
      "---",
      "",
      "## Section",
    ].join("\n");
    const blocks = parseMarkdown(md);
    expect(blocks[0].type).toBe("heading");
    expect(blocks[0].level).toBe(1);
    expect(blocks[1].type).toBe("paragraph");
    expect(blocks[2].type).toBe("list");
    expect(blocks[3].type).toBe("hr");
    expect(blocks[4].type).toBe("heading");
    expect(blocks[4].level).toBe(2);
  });
});
