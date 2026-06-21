// Pure parsing functions — no Tauri imports, fully unit-testable.

const NON_PRINCIPLE_SECTIONS =
  /^(wiki formatting standard|technology stack|development workflow|governance)/i;

export function parseConstitution(content, defaultTitle = "") {
  const lines = content.split("\n");
  const title =
    lines.find((l) => l.startsWith("# "))?.slice(2).trim() || defaultTitle;

  const principles = [];
  const formattingStandard = [];
  const fmtRawLines = [];
  let current = null;
  let body = [];
  let inFormattingSection = false;
  let fmtCard = null;
  let fmtCardLines = [];
  let inCodeFence = false;

  const flushFmtCard = () => {
    if (!fmtCard) return;
    // Split collected lines into prose segments and code blocks
    const segments = [];
    let codeLines = null;
    let proseLine = [];
    for (const l of fmtCardLines) {
      if (l.startsWith("```")) {
        if (codeLines === null) {
          if (proseLine.length) { segments.push({ type: "prose", text: proseLine.filter(Boolean).join(" ").trim() }); proseLine = []; }
          codeLines = [];
        } else {
          segments.push({ type: "code", text: codeLines.join("\n") });
          codeLines = null;
        }
      } else if (codeLines !== null) {
        codeLines.push(l);
      } else {
        proseLine.push(l.trim());
      }
    }
    if (proseLine.filter(Boolean).length) segments.push({ type: "prose", text: proseLine.filter(Boolean).join(" ").trim() });
    formattingStandard.push({ name: fmtCard, segments });
    fmtCard = null;
    fmtCardLines = [];
  };

  for (const line of lines) {
    if (line.startsWith("```")) inCodeFence = !inCodeFence;

    if (!inCodeFence && line.startsWith("## ")) {
      if (current) {
        current.t = body.filter(Boolean).join(" ").trim();
        if (!NON_PRINCIPLE_SECTIONS.test(current.h)) principles.push(current);
      }
      const h = line.slice(3).trim();
      inFormattingSection = /wiki formatting standard/i.test(h);
      if (inFormattingSection) { flushFmtCard(); fmtRawLines.push(line); }
      current = { h, t: "" };
      body = [];
    } else if (!inCodeFence && inFormattingSection && line.startsWith("### ")) {
      flushFmtCard();
      fmtCard = line.slice(4).trim();
      fmtCardLines = [];
      fmtRawLines.push(line);
    } else if (inFormattingSection && fmtCard !== null) {
      fmtCardLines.push(line);
      fmtRawLines.push(line);
    } else if (!inCodeFence && current && !line.startsWith("#")) {
      body.push(line.trim());
    }
  }
  flushFmtCard();
  if (current) {
    current.t = body.filter(Boolean).join(" ").trim();
    if (!NON_PRINCIPLE_SECTIONS.test(current.h)) principles.push(current);
  }

  return { title, principles, formattingStandard, formattingStandardRaw: fmtRawLines.join("\n"), rawContent: content };
}

export function parseSpec(content) {
  const lines = content.split("\n");
  const result = {
    title: "",
    branch: "",
    status: "",
    created: "",
    overview: "",
    stories: [],
    requirements: [],
    clarifications: [],
    callouts: [],
    tables: [],
  };

  let section = "";
  let overviewBody = [];
  let currentStory = null;
  let storyPhase = "summary";
  let tableBuffer = [];
  let inTable = false;

  const flushOverview = () => {
    if (overviewBody.length)
      result.overview = overviewBody.filter(Boolean).join(" ").trim();
    overviewBody = [];
  };

  const flushStory = () => {
    if (currentStory) result.stories.push(currentStory);
    currentStory = null;
    storyPhase = "summary";
  };

  const flushTable = () => {
    if (tableBuffer.length < 2) { tableBuffer = []; inTable = false; return; }
    const headerCells = tableBuffer[0].split("|").map(c => c.trim()).filter(Boolean);
    const rows = tableBuffer.slice(2).map(r =>
      r.split("|").map(c => c.trim()).filter(Boolean)
    ).filter(r => r.length > 0);
    result.tables.push({ columns: headerCells, rows });
    tableBuffer = [];
    inTable = false;
  };

  for (const line of lines) {
    // Title
    if (!result.title && line.startsWith("# ")) {
      result.title = line.slice(2).trim();
      continue;
    }

    // Header metadata
    const branchM = line.match(/^\*\*(?:Feature )?Branch:\*\*\s*`?([^`\n]+)`?/);
    if (branchM) { result.branch = branchM[1].trim(); continue; }

    const statusM = line.match(/^\*\*Status:\*\*\s*(\S+)/);
    if (statusM) { result.status = statusM[1].toLowerCase(); continue; }

    const createdM = line.match(/^\*\*Created:\*\*\s*(.+)/);
    if (createdM) { result.created = createdM[1].trim(); continue; }

    // Section headings
    if (line.startsWith("## ")) {
      flushOverview();
      if (section === "stories") flushStory();
      if (inTable) flushTable();
      const h = line.slice(3).trim().toLowerCase();
      if (/overview|summary/.test(h)) section = "overview";
      else if (/user stor|user scen|stories/.test(h)) section = "stories";
      else if (/functional|requirement/.test(h)) section = "requirements";
      else if (/clarif/.test(h)) section = "clarifications";
      else section = "other";
      continue;
    }

    // H3 story headings inside stories section
    if (section === "stories" && line.startsWith("### ")) {
      flushStory();
      const storyM = line.match(/###\s+User Story\s+\d+\s*[-–]\s*(.+?)(?:\s*\(Priority:\s*(P\d+)\))?\s*$/i);
      if (storyM) {
        currentStory = {
          title: storyM[1].trim(),
          priority: storyM[2] || null,
          summary: "",
          whyPriority: "",
          scenarios: [],
        };
        storyPhase = "summary";
      }
      continue;
    }

    // Pipe-table lines (any section)
    if (line.trim().startsWith("|")) {
      inTable = true;
      tableBuffer.push(line.trim());
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Blockquote callouts (any section)
    const calloutM = line.match(/^>\s+\*\*(Note|Warning|Error|Success)\*\*:\s*(.*)/i);
    if (calloutM) {
      const variantMap = { note: "notice", warning: "warning", error: "error", success: "success" };
      result.callouts.push({
        variant: variantMap[calloutM[1].toLowerCase()] || "notice",
        text: calloutM[2].trim(),
      });
      continue;
    }

    // Section body handling
    if (section === "overview") {
      overviewBody.push(line.trim());
    } else if (section === "stories") {
      if (!currentStory) {
        // Legacy flat bullet fallback
        const m = line.match(/^[-*]\s+(.+)/);
        if (m) result.stories.push({ title: m[1].trim(), priority: null, summary: "", whyPriority: "", scenarios: [] });
      } else {
        // Inside a ### story block
        if (line.startsWith("---")) { flushStory(); continue; }
        const whyM = line.match(/^\*\*Why this priority\*\*:\s*(.*)/);
        const scenarioM = line.match(/^\d+\.\s+\*\*Given\*\*/);
        const scenarioInline = line.match(/^(?:\d+\.)?\s*\*\*Given\*\*/);
        if (whyM) {
          storyPhase = "why";
          currentStory.whyPriority = whyM[1].trim();
        } else if (line.match(/^\*\*Acceptance Scenarios\*\*/)) {
          storyPhase = "scenarios";
        } else if (storyPhase === "scenarios" && scenarioInline) {
          currentStory.scenarios.push(line.replace(/^\d+\.\s*/, "").trim());
        } else if (storyPhase === "summary" && line.trim() && !line.startsWith("**")) {
          currentStory.summary += (currentStory.summary ? " " : "") + line.trim();
        }
      }
    } else if (section === "requirements") {
      const m = line.match(/^[-*]\s+(.+)/);
      if (m) {
        const raw = m[1].trim();
        const frM = raw.match(/^\*\*FR-(\d+)\*\*\s*[:\-]?\s*(.*)/);
        if (frM) {
          result.requirements.push({ id: `FR-${frM[1]}`, text: frM[2].trim() });
        } else {
          result.requirements.push({ id: null, text: raw });
        }
      }
    } else if (section === "clarifications") {
      const q = line.match(/^\*\*Q[:\*]+\*?\s*(.+)/);
      const a = line.match(/^\*\*A[:\*]+\*?\s*(.+)/);
      if (q) result._clarQ = q[1].trim();
      else if (a && result._clarQ) {
        result.clarifications.push({ q: result._clarQ, a: a[1].trim() });
        result._clarQ = null;
      }
    }
  }

  flushOverview();
  if (section === "stories") flushStory();
  if (inTable) flushTable();
  delete result._clarQ;

  return result;
}

export function parseTasks(content) {
  const tasks = [];
  for (const line of content.split("\n")) {
    const m = line.match(/^[-*]\s+\[([ xX])\]\s*(T\d+)?:?\s*(.+)/);
    if (!m) continue;
    const done = m[1].toLowerCase() === "x";
    const id = m[2] || `T${String(tasks.length + 1).padStart(3, "0")}`;
    let label = m[3].trim();
    const parallel = /`parallel`|\bparallel\b/i.test(label);
    label = label.replace(/\s*`parallel`|\s*\bparallel\b/gi, "").trim();
    tasks.push({ id, label, done, parallel });
  }
  return tasks;
}

export function inferStatus({ hasSpec, hasPlan, hasTasks }) {
  if (hasTasks) return "ready";
  if (hasPlan) return "planned";
  return "draft";
}
