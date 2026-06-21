import { Wikitable } from "./designSystem";

// ---------- parseMarkdown ----------

function parseTableRow(line) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(cell => cell.trim());
}

export function parseMarkdown(text) {
  if (!text || !text.trim()) return [];

  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced code block
    if (/^```/.test(trimmed)) {
      const lang = trimmed.slice(3).trim() || null;
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: "code", lang, content: codeLines.join("\n") });
      continue;
    }

    // ATX heading
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      blocks.push({ type: "heading", level: headingMatch[1].length, content: headingMatch[2].trim() });
      i++;
      continue;
    }

    // Horizontal rule (check before unordered list to avoid --- confusion)
    if (/^(---+|\*\*\*+|___+)$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Blockquote
    if (/^>/.test(trimmed)) {
      const bqLines = [];
      while (i < lines.length && /^>/.test(lines[i].trim())) {
        bqLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", content: bqLines.join("\n").trim() });
      continue;
    }

    // GFM table: current line starts with |, next line is a separator row
    if (/^\|/.test(trimmed)) {
      const nextTrimmed = (lines[i + 1] || "").trim();
      if (/^\|[-|: ]+\|$/.test(nextTrimmed)) {
        const header = parseTableRow(trimmed);
        i += 2; // skip header row and separator row
        const rows = [];
        while (i < lines.length && /^\|/.test(lines[i].trim())) {
          rows.push(parseTableRow(lines[i].trim()));
          i++;
        }
        blocks.push({ type: "table", header, rows });
        continue;
      }
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, "").trim());
        i++;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, "").trim());
        i++;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    // Paragraph (default): accumulate until blank line or block-start line
    const paraLines = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (!l) break;
      if (/^#{1,6}\s/.test(l)) break;
      if (/^```/.test(l)) break;
      if (/^(---+|\*\*\*+|___+)$/.test(l)) break;
      if (/^[-*]\s+/.test(l)) break;
      if (/^\d+\.\s+/.test(l)) break;
      if (/^>/.test(l)) break;
      if (/^\|/.test(l) && /^\|[-|: ]+\|$/.test((lines[i + 1] || "").trim())) break;
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", content: paraLines.join("\n").trim() });
    }
  }

  return blocks;
}

// ---------- renderInline ----------

const CODE_STYLE = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.9em",
  background: "var(--surface-subtle)",
  padding: "1px 4px",
  borderRadius: "2px",
};

const INLINE_PATTERNS = [
  { re: /`([^`]+)`/,       tag: "code"   },
  { re: /\*\*([^*]+)\*\*/, tag: "strong" },
  { re: /__([^_]+)__/,     tag: "strong" },
  { re: /\*([^*]+)\*/,     tag: "em"     },
  { re: /_([^_]+)_/,       tag: "em"     },
];

function renderInline(text) {
  if (!text) return null;

  const result = [];
  let remaining = text;
  let key = 0;

  while (remaining) {
    let earliest = null;
    let matchedPattern = null;

    for (const p of INLINE_PATTERNS) {
      const m = p.re.exec(remaining);
      if (m !== null && (earliest === null || m.index < earliest.index)) {
        earliest = m;
        matchedPattern = p;
      }
    }

    if (!earliest) {
      result.push(remaining);
      break;
    }

    if (earliest.index > 0) {
      result.push(remaining.slice(0, earliest.index));
    }

    const inner = earliest[1];
    if (matchedPattern.tag === "code") {
      result.push(<code key={key++} style={CODE_STYLE}>{inner}</code>);
    } else if (matchedPattern.tag === "strong") {
      result.push(<strong key={key++}>{inner}</strong>);
    } else {
      result.push(<em key={key++}>{inner}</em>);
    }

    remaining = remaining.slice(earliest.index + earliest[0].length);
  }

  if (result.length === 0) return null;
  if (result.length === 1 && typeof result[0] === "string") return result[0];
  return result;
}

// ---------- Heading styles ----------

const HEADING_STYLES = {
  1: { fontFamily: "var(--font-serif)", fontSize: "24px",            fontWeight: 400, color: "var(--color-base-10)", borderBottom: "1px solid var(--border-default)", paddingBottom: "4px", margin: "28px 0 12px" },
  2: { fontFamily: "var(--font-serif)", fontSize: "var(--text-h2)",  fontWeight: 400, color: "var(--color-base-10)", borderBottom: "1px solid var(--border-default)", paddingBottom: "4px", margin: "22px 0 10px" },
  3: { fontFamily: "var(--font-serif)", fontSize: "16px",            fontWeight: 600, color: "var(--color-base-10)", margin: "18px 0 8px" },
  4: { fontFamily: "var(--font-sans)",  fontSize: "var(--text-body)", fontWeight: 700, color: "var(--color-base-10)", margin: "14px 0 6px" },
};

const PARA_STYLE = {
  fontSize: "var(--text-body)",
  lineHeight: "var(--leading-body)",
  color: "var(--color-base-10)",
  margin: "0 0 12px",
};

const CODE_BLOCK_STYLE = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  lineHeight: 1.6,
  background: "var(--surface-subtle)",
  border: "1px solid var(--border-default)",
  borderRadius: "2px",
  padding: "14px 16px",
  margin: "0 0 14px",
  whiteSpace: "pre-wrap",
  overflowX: "auto",
  color: "var(--color-base-10)",
  display: "block",
};

const BLOCKQUOTE_STYLE = {
  borderLeft: "3px solid var(--border-default)",
  paddingLeft: "14px",
  margin: "0 0 12px",
  color: "var(--color-base-30)",
  fontStyle: "italic",
};

const HR_STYLE = {
  border: "none",
  borderTop: "1px solid var(--border-default)",
  margin: "16px 0",
};

const LIST_STYLE = {
  margin: "0 0 12px",
  paddingLeft: "22px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const LIST_ITEM_STYLE = {
  fontSize: "var(--text-body)",
  lineHeight: "var(--leading-body)",
  color: "var(--color-base-10)",
};

// ---------- MarkdownView ----------

function renderBlock(block, key) {
  switch (block.type) {
    case "heading": {
      const style = HEADING_STYLES[block.level] || HEADING_STYLES[4];
      const Tag = `h${Math.min(block.level, 6)}`;
      return <Tag key={key} style={style}>{renderInline(block.content)}</Tag>;
    }
    case "paragraph":
      return <p key={key} style={PARA_STYLE}>{renderInline(block.content)}</p>;
    case "code":
      return <pre key={key} style={CODE_BLOCK_STYLE}><code style={{ fontFamily: "var(--font-mono)" }}>{block.content}</code></pre>;
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag key={key} style={LIST_STYLE}>
          {block.items.map((item, j) => (
            <li key={j} style={LIST_ITEM_STYLE}>{renderInline(item)}</li>
          ))}
        </Tag>
      );
    }
    case "blockquote":
      return <blockquote key={key} style={BLOCKQUOTE_STYLE}>{renderInline(block.content)}</blockquote>;
    case "table":
      return (
        <div key={key} style={{ marginBottom: "14px" }}>
          <Wikitable columns={block.header} rows={block.rows} />
        </div>
      );
    case "hr":
      return <hr key={key} style={HR_STYLE} />;
    default:
      return null;
  }
}

export function MarkdownView({ content }) {
  if (!content || !content.trim()) return <div />;
  const blocks = parseMarkdown(content);
  return (
    <div style={{ marginTop: "10px" }}>
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}
