/* SpecWiki screens — Feature Article (+ Talk / Source / History) and
   the Special: namespace pages (AllSpecs, RecentChanges, Search). */
(function () {
const NS = window.SpecWikiDesignSystem_d3915e;
const { PageTitle } = window.SpecWikiMain;

function H2({ id, children }) {
  return <h2 id={id} style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-h2)", fontWeight: 400, color: "var(--color-base-10)", borderBottom: "1px solid var(--border-default)", paddingBottom: "4px", margin: "22px 0 10px" }}>{children}</h2>;
}
function P({ children }) {
  return <p style={{ fontSize: "var(--text-body)", lineHeight: "var(--leading-body)", color: "var(--color-base-10)", margin: "0 0 12px" }}>{children}</p>;
}
function Bullets({ items }) {
  return <ul style={{ margin: "0 0 12px", paddingLeft: "22px", display: "flex", flexDirection: "column", gap: "6px" }}>{items.map((it, i) => <li key={i} style={{ fontSize: "var(--text-body)", lineHeight: 1.55, color: "var(--color-base-10)" }}>{it}</li>)}</ul>;
}

/* ---------- Feature article ---------- */
function ArticlePage({ feature, route, navigate, isGitRepo }) {
  const { ArticleTabs, SubNav, Infobox, WikiLink, TaskList, Wikitable, MessageBox, TableOfContents } = NS;
  const sub = route.sub || "spec";
  const tab = route.tab || "article";

  const subItems = [
    { id: "spec", label: "Spec", show: feature.files.spec },
    { id: "plan", label: "Plan", show: feature.files.plan },
    { id: "tasks", label: "Tasks", show: feature.files.tasks },
    { id: "data", label: "Data Model", show: feature.files.dataModel },
    { id: "research", label: "Research", show: feature.files.research },
    { id: "quickstart", label: "Quickstart", show: feature.files.quickstart },
  ].filter((x) => x.show);

  const setTab = (t) => navigate({ ...route, tab: t });
  const setSub = (s) => navigate({ ...route, sub: s, tab: "article" });

  return (
    <div>
      <ArticleTabs active={tab} onSelect={setTab} tabs={[
        { id: "article", label: "Article" },
        { id: "talk", label: "Talk" },
        { id: "source", label: "View source" },
        { id: "history", label: "History", disabled: !isGitRepo },
      ]} />

      <div style={{ marginTop: "14px" }}>
        <PageTitle sub={<code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>Specs:{feature.slug}</code>}>{feature.title}</PageTitle>
        {tab === "article" && <SubNav active={sub} onSelect={setSub} items={subItems} />}
      </div>

      {tab === "article" && <ArticleBody feature={feature} sub={sub} navigate={navigate} comps={{ Infobox, WikiLink, TaskList, Wikitable, TableOfContents, MessageBox }} />}
      {tab === "talk" && <TalkBody feature={feature} />}
      {tab === "source" && <SourceBody feature={feature} sub={sub} />}
      {tab === "history" && <HistoryBody feature={feature} isGitRepo={isGitRepo} />}
    </div>
  );
}

function ArticleBody({ feature, sub, navigate, comps }) {
  const { Infobox, WikiLink, TaskList, Wikitable, TableOfContents, MessageBox } = comps;

  if (sub === "tasks") {
    return (
      <div style={{ marginTop: "10px" }}>
        <P>Task breakdown from <code style={{ fontFamily: "var(--font-mono)" }}>tasks.md</code>. The <strong>P</strong> badge marks tasks that can run in parallel.</P>
        <TaskList tasks={feature.tasks} />
      </div>
    );
  }
  if (sub === "plan") {
    return (
      <div style={{ marginTop: "10px" }}>
        <P>Technical plan from <code style={{ fontFamily: "var(--font-mono)" }}>plan.md</code> — chosen stack and architecture for <strong>{feature.title}</strong>.</P>
        <H2>Tech stack</H2>
        <Bullets items={["Tauri (Rust) shell with the fs + dialog plugins", "React + TypeScript frontend", "SignalR for realtime board sync", "SQLite via the data model in data-model.md"]} />
        <H2>Architecture</H2>
        <P>Each feature is a self-contained library per constitution principle I; the board UI consumes those libraries only through their public contracts.</P>
      </div>
    );
  }
  if (sub === "data") {
    return (
      <div style={{ marginTop: "10px" }}>
        <P>Entities from <code style={{ fontFamily: "var(--font-mono)" }}>data-model.md</code>.</P>
        <Wikitable columns={["Entity", "Key fields", "Relationships"]} rows={[
          ["Board", "id, name, ownerId", "has many Column"],
          ["Column", "id, title, order", "belongs to Board, has many Card"],
          ["Card", "id, title, status, assigneeId", "belongs to Column, has many Comment"],
          ["Comment", "id, body, authorId, createdAt", "belongs to Card"],
        ]} />
      </div>
    );
  }
  if (sub === "research") {
    return <div style={{ marginTop: "10px" }}><P>Findings from <code style={{ fontFamily: "var(--font-mono)" }}>research.md</code> — evaluation of realtime transports and the decision to standardise on SignalR for its automatic reconnection and group semantics.</P></div>;
  }
  if (sub === "quickstart") {
    return <div style={{ marginTop: "10px" }}><P>Steps from <code style={{ fontFamily: "var(--font-mono)" }}>quickstart.md</code> to run the feature locally and verify the happy path.</P></div>;
  }

  /* default: spec.md body with infobox + TOC */
  return (
    <div style={{ marginTop: "6px" }}>
      <Infobox
        title={feature.title}
        slug={"Specs:" + feature.slug}
        branch={feature.branch}
        status={feature.status}
        lastModified={feature.modified}
        files={feature.files}
      />
      <div style={{ float: "right", clear: "right", margin: "0 0 12px 18px" }}>
        <TableOfContents onSelect={() => {}} headings={[
          { level: 2, label: "Overview", id: "overview" },
          { level: 2, label: "User stories", id: "stories" },
          { level: 2, label: "Functional requirements", id: "reqs" },
          ...(feature.contracts.length ? [{ level: 2, label: "External contracts", id: "contracts" }] : []),
        ]} />
      </div>
      <H2 id="overview">Overview</H2>
      <P>{feature.summary}</P>
      <H2 id="stories">User stories</H2>
      <Bullets items={feature.stories} />
      <H2 id="reqs">Functional requirements</H2>
      <Bullets items={feature.requirements} />
      {feature.contracts.length > 0 && (
        <div id="contracts">
          <H2>External contracts</H2>
          <P>Interface contracts live in <code style={{ fontFamily: "var(--font-mono)" }}>contracts/</code>:</P>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {feature.contracts.map((c) => (
              <WikiLink key={c} variant="external" href="#">{c}</WikiLink>
            ))}
          </div>
        </div>
      )}
      {feature.tasks.length === 0 && feature.status === "draft" && (
        <div style={{ marginTop: "16px" }}><MessageBox variant="notice">This feature is a <strong>Draft</strong> — only <code style={{ fontFamily: "var(--font-mono)" }}>spec.md</code> exists. Run <code style={{ fontFamily: "var(--font-mono)" }}>/speckit.plan</code> to add a plan.</MessageBox></div>
      )}
    </div>
  );
}

function TalkBody({ feature }) {
  const { MessageBox } = NS;
  if (!feature.clarifications.length) {
    return <div style={{ marginTop: "14px" }}><MessageBox variant="notice">No clarifications recorded for this feature.</MessageBox></div>;
  }
  return (
    <div style={{ marginTop: "14px" }}>
      <P>Q&amp;A log from the <code style={{ fontFamily: "var(--font-mono)" }}>## Clarifications</code> section of <code style={{ fontFamily: "var(--font-mono)" }}>spec.md</code>, resolved before planning.</P>
      {feature.clarifications.map((c, i) => (
        <div key={i} style={{ borderLeft: "3px solid var(--border-default)", paddingLeft: "14px", margin: "0 0 16px" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-base-10)", marginBottom: "3px" }}>Q: {c.q}</div>
          <div style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--color-base-30)" }}>A: {c.a}</div>
        </div>
      ))}
    </div>
  );
}

function SourceBody({ feature, sub }) {
  const file = sub === "tasks" ? "tasks.md" : sub === "plan" ? "plan.md" : "spec.md";
  const src = `# ${feature.title}\n\n**Branch:** \`${feature.branch}\`\n**Status:** ${feature.status}\n\n## Overview\n\n${feature.summary}\n\n## User Stories\n\n${feature.stories.map((s) => "- " + s).join("\n")}\n\n## Functional Requirements\n\n${feature.requirements.map((r, i) => `- **FR-${String(i + 1).padStart(3, "0")}** ${r}`).join("\n")}\n`;
  return (
    <div style={{ marginTop: "14px" }}>
      <div style={{ fontSize: "13px", color: "var(--color-base-50)", marginBottom: "8px" }}>Read-only source of <code style={{ fontFamily: "var(--font-mono)" }}>{feature.slug}/{file}</code></div>
      <pre style={{ fontFamily: "var(--font-mono)", fontSize: "13px", lineHeight: 1.6, background: "var(--surface-subtle)", border: "1px solid var(--border-default)", borderRadius: "2px", padding: "14px 16px", margin: 0, whiteSpace: "pre-wrap", color: "var(--color-base-10)" }}>{src}</pre>
    </div>
  );
}

function HistoryBody({ feature, isGitRepo }) {
  const { Wikitable, MessageBox, WikiLink } = NS;
  if (!isGitRepo) {
    return <div style={{ marginTop: "14px" }}><MessageBox variant="warning">Git history unavailable — not a git repository.</MessageBox></div>;
  }
  const commits = [
    ["a3f9c21", "spec: refine functional requirements after clarify", "morgan", feature.modified],
    ["7b2e0d4", "plan: choose SignalR for realtime sync", "alex", "5 days ago"],
    ["e91c8aa", "spec: initial draft from /speckit.specify", "morgan", "2 weeks ago"],
  ];
  return (
    <div style={{ marginTop: "14px" }}>
      <P>Commits touching files in <code style={{ fontFamily: "var(--font-mono)" }}>{feature.slug}/</code>:</P>
      <Wikitable columns={["Commit", "Message", "Author", "When"]} rows={commits.map((c) => [
        <WikiLink href="#" style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{c[0]}</WikiLink>,
        c[1], c[2], c[3],
      ])} />
    </div>
  );
}

/* ---------- Special: pages ---------- */
function AllSpecsPage({ data, navigate }) {
  const { Wikitable, WikiLink, StatusBadge } = NS;
  return (
    <div>
      <PageTitle sub="Special page">Special:AllSpecs</PageTitle>
      <P>Every feature folder under <code style={{ fontFamily: "var(--font-mono)" }}>specs/</code>, in creation order.</P>
      <Wikitable sortable columns={["#", "Feature", "Status", "Files", "Last modified"]} rows={data.features.map((f) => [
        <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-base-30)" }}>{f.number}</code>,
        <WikiLink href="#" onClick={(e) => { e.preventDefault(); navigate({ page: "article", slug: f.slug, sub: "spec" }); }}>{f.title}</WikiLink>,
        <StatusBadge status={f.status} size="sm" />,
        String(Object.values(f.files).filter(Boolean).length),
        f.modified,
      ])} />
    </div>
  );
}

function RecentChangesPage({ data, navigate }) {
  const { WikiLink } = NS;
  return (
    <div>
      <PageTitle sub="Special page">Special:RecentChanges</PageTitle>
      <P>File modifications across the whole project, newest first.</P>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "9px" }}>
        {data.recentChanges.map((r, i) => (
          <li key={i} style={{ fontSize: "14px", display: "flex", gap: "10px", alignItems: "baseline", borderBottom: "1px solid var(--border-faint)", paddingBottom: "8px" }}>
            <span style={{ color: "var(--color-base-50)", fontSize: "12px", width: "80px", flex: "0 0 80px" }}>{r.when}</span>
            <span>
              <WikiLink href="#" onClick={(e) => { e.preventDefault(); navigate({ page: "article", slug: r.slug, sub: "spec" }); }}>{r.feature}</WikiLink>
              <span style={{ color: "var(--color-base-50)" }}> — <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{r.file}</code></span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SearchPage({ data, navigate }) {
  const { WikiLink } = NS;
  return (
    <div>
      <PageTitle sub="Special page">Search results</PageTitle>
      <P>Showing features matching <strong>"board"</strong> — full-text search across all spec files.</P>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
        {data.features.filter((f) => /board|task|csv|present/i.test(f.summary)).map((f) => (
          <li key={f.slug}>
            <WikiLink href="#" onClick={(e) => { e.preventDefault(); navigate({ page: "article", slug: f.slug, sub: "spec" }); }} style={{ fontSize: "16px" }}>{f.title}</WikiLink>
            <p style={{ fontSize: "13px", color: "var(--color-base-30)", margin: "2px 0 0", lineHeight: 1.5 }}>{f.summary}</p>
            <div style={{ fontSize: "12px", color: "var(--color-base-50)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>specs/{f.slug}/spec.md</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

Object.assign(window, { SpecWikiArticle: { ArticlePage, AllSpecsPage, RecentChangesPage, SearchPage } });
})();
