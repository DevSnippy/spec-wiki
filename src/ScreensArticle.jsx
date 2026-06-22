import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ArticleTabs, SubNav, Infobox, WikiLink, TaskList, Wikitable, MessageBox, TableOfContents, StatusBadge } from "./designSystem";
import { MarkdownView } from "./markdownRenderer";
import { PageTitle } from "./ScreensMain";

function H2({ id, children }) {
  return <h2 id={id} style={{ fontFamily:"var(--font-serif)", fontSize:"var(--text-h2)", fontWeight:400, color:"var(--color-base-10)", borderBottom:"1px solid var(--border-default)", paddingBottom:"4px", margin:"22px 0 10px" }}>{children}</h2>;
}
function P({ children }) {
  return <p style={{ fontSize:"var(--text-body)", lineHeight:"var(--leading-body)", color:"var(--color-base-10)", margin:"0 0 12px" }}>{children}</p>;
}
function Bullets({ items }) {
  return (
    <ul style={{ margin:"0 0 12px", paddingLeft:"22px", display:"flex", flexDirection:"column", gap:"6px" }}>
      {items.map((it, i) => <li key={i} style={{ fontSize:"var(--text-body)", lineHeight:1.55, color:"var(--color-base-10)" }}>{it}</li>)}
    </ul>
  );
}

const PRIORITY_COLORS = {
  P1: { bg:"#fff3e0", border:"#fb8c00", fg:"#e65100" },
  P2: { bg:"#e3f2fd", border:"#1976d2", fg:"#0d47a1" },
  P3: { bg:"#f3e5f5", border:"#7b1fa2", fg:"#4a148c" },
};

function PriorityBadge({ priority }) {
  if (!priority) return null;
  const c = PRIORITY_COLORS[priority] || { bg:"#f5f5f5", border:"#9e9e9e", fg:"#424242" };
  return (
    <span style={{ display:"inline-block", fontSize:"11px", fontWeight:700, padding:"2px 7px", borderRadius:"3px", border:`1px solid ${c.border}`, background:c.bg, color:c.fg, marginLeft:"8px", verticalAlign:"middle" }}>
      {priority}
    </span>
  );
}

function StoryCard({ story }) {
  const title = typeof story === "string" ? story : story.title;
  const priority = typeof story === "string" ? null : story.priority;
  const summary = typeof story === "string" ? null : story.summary;
  const scenarios = typeof story === "string" ? [] : (story.scenarios || []);
  return (
    <div style={{ border:"1px solid var(--border-default)", borderRadius:"3px", padding:"12px 16px", marginBottom:"12px", background:"var(--surface-subtle)" }}>
      <div style={{ fontWeight:600, fontSize:"var(--text-body)", color:"var(--color-base-10)", marginBottom:"6px" }}>
        {title}
        <PriorityBadge priority={priority} />
      </div>
      {summary && <p style={{ margin:"0 0 8px", fontSize:"13px", lineHeight:1.55, color:"var(--color-base-30)" }}>{summary}</p>}
      {scenarios.length > 0 && (
        <ul style={{ margin:"6px 0 0", paddingLeft:"18px", display:"flex", flexDirection:"column", gap:"4px" }}>
          {scenarios.map((s, i) => (
            <li key={i} style={{ fontSize:"12px", lineHeight:1.55, color:"var(--color-base-30)", fontStyle:"italic" }}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequirementList({ requirements }) {
  return (
    <ul style={{ margin:"0 0 12px", paddingLeft:0, listStyle:"none", display:"flex", flexDirection:"column", gap:"6px" }}>
      {requirements.map((req, i) => {
        const id = typeof req === "string" ? null : req.id;
        const text = typeof req === "string" ? req : req.text;
        return (
          <li key={i} style={{ fontSize:"var(--text-body)", lineHeight:1.55, color:"var(--color-base-10)", display:"flex", gap:"8px", alignItems:"baseline" }}>
            {id && <code style={{ fontFamily:"var(--font-mono)", fontSize:"12px", color:"var(--color-base-50)", flexShrink:0 }}>{id}</code>}
            <span>{text}</span>
          </li>
        );
      })}
    </ul>
  );
}

function CalloutList({ callouts }) {
  if (!callouts || callouts.length === 0) return null;
  return (
    <>
      {callouts.map((c, i) => (
        <MessageBox key={i} variant={c.variant || "notice"}>{c.text}</MessageBox>
      ))}
    </>
  );
}

function InlineTable({ table }) {
  return (
    <div style={{ marginBottom:"14px" }}>
      <Wikitable columns={table.columns} rows={table.rows.map(row => row.map(cell => cell))} />
    </div>
  );
}
function RawFile({ content, path }) {
  return (
    <div style={{ marginTop:"10px" }}>
      {path && <div style={{ fontSize:"12px", color:"var(--color-base-50)", fontFamily:"var(--font-mono)", marginBottom:"8px" }}>{path}</div>}
      <pre style={{ fontFamily:"var(--font-mono)", fontSize:"13px", lineHeight:1.6, background:"var(--surface-subtle)", border:"1px solid var(--border-default)", borderRadius:"2px", padding:"14px 16px", margin:0, whiteSpace:"pre-wrap", color:"var(--color-base-10)", overflowX:"auto" }}>{content}</pre>
    </div>
  );
}

export function ArticlePage({ feature, route, navigate, isGitRepo, projectPath }) {
  const sub = route.sub || "spec";
  const tab = route.tab || "article";

  const subItems = [
    { id:"spec",       label:"Spec",       show:feature.files.spec },
    { id:"plan",       label:"Plan",       show:feature.files.plan },
    { id:"tasks",      label:"Tasks",      show:feature.files.tasks },
    { id:"data",       label:"Data Model", show:feature.files.dataModel },
    { id:"research",   label:"Research",   show:feature.files.research },
    { id:"quickstart", label:"Quickstart", show:feature.files.quickstart },
  ].filter(x => x.show);

  const setTab = t => navigate({ ...route, tab: t });
  const setSub = s => navigate({ ...route, sub: s, tab: "article" });

  return (
    <div>
      <ArticleTabs active={tab} onSelect={setTab} tabs={[
        { id:"article", label:"Article" },
        { id:"talk",    label:"Talk" },
        { id:"source",  label:"View source" },
        { id:"history", label:"History", disabled:!isGitRepo },
      ]} />
      <div style={{ marginTop:"14px" }}>
        <PageTitle sub={<code style={{ fontFamily:"var(--font-mono)", fontSize:"12px" }}>specs/{feature.slug}</code>}>{feature.title}</PageTitle>
        {tab === "article" && <SubNav active={sub} onSelect={setSub} items={subItems} />}
      </div>
      {tab === "article" && <ArticleBody feature={feature} sub={sub} />}
      {tab === "talk"    && <TalkBody feature={feature} />}
      {tab === "source"  && <SourceBody feature={feature} sub={sub} />}
      {tab === "history" && <HistoryBody feature={feature} isGitRepo={isGitRepo} projectPath={projectPath} />}
    </div>
  );
}

function ArticleBody({ feature, sub }) {
  if (sub === "tasks") {
    return (
      <div style={{ marginTop:"10px" }}>
        <P>Task breakdown from <code style={{ fontFamily:"var(--font-mono)" }}>tasks.md</code>. The <strong>P</strong> badge marks tasks that can run in parallel.</P>
        {feature.tasks.length > 0
          ? <TaskList tasks={feature.tasks} />
          : <MessageBox variant="notice">No tasks defined yet.</MessageBox>}
      </div>
    );
  }
  if (sub === "plan") {
    return feature.planContent
      ? <MarkdownView content={feature.planContent} />
      : <div style={{ marginTop:"10px" }}><MessageBox variant="notice">plan.md not found.</MessageBox></div>;
  }
  if (sub === "data") {
    return feature.dataModelContent
      ? <MarkdownView content={feature.dataModelContent} />
      : <div style={{ marginTop:"10px" }}><MessageBox variant="notice">data-model.md not found.</MessageBox></div>;
  }
  if (sub === "research") {
    return feature.researchContent
      ? <MarkdownView content={feature.researchContent} />
      : <div style={{ marginTop:"10px" }}><MessageBox variant="notice">research.md not found.</MessageBox></div>;
  }
  if (sub === "quickstart") {
    return feature.quickstartContent
      ? <MarkdownView content={feature.quickstartContent} />
      : <div style={{ marginTop:"10px" }}><MessageBox variant="notice">quickstart.md not found.</MessageBox></div>;
  }

  // Default: spec view with infobox + TOC
  const tocHeadings = [
    ...(feature.summary ? [{ level:2, label:"Overview", id:"overview" }] : []),
    ...(feature.stories.length ? [{ level:2, label:"User stories", id:"stories" }] : []),
    ...(feature.requirements.length ? [{ level:2, label:"Functional requirements", id:"reqs" }] : []),
    ...(feature.contracts.length ? [{ level:2, label:"External contracts", id:"contracts" }] : []),
  ];

  return (
    <div style={{ marginTop:"6px", display:"flex", gap:"24px", alignItems:"flex-start" }}>
      {/* Left: article content */}
      <div style={{ flex:1, minWidth:0 }}>
        {feature.summary && (
          <>
            <H2 id="overview">Overview</H2>
            <P>{feature.summary}</P>
          </>
        )}
        {feature.stories.length > 0 && (
          <>
            <H2 id="stories">User stories</H2>
            {feature.stories.map((story, i) => <StoryCard key={i} story={story} />)}
          </>
        )}
        {feature.requirements.length > 0 && (
          <>
            <H2 id="reqs">Functional requirements</H2>
            <RequirementList requirements={feature.requirements} />
          </>
        )}
        {feature.tables && feature.tables.length > 0 && (
          feature.tables.map((table, i) => <InlineTable key={i} table={table} />)
        )}
        {feature.callouts && feature.callouts.length > 0 && (
          <CalloutList callouts={feature.callouts} />
        )}
        {feature.contracts.length > 0 && (
          <div id="contracts">
            <H2>External contracts</H2>
            <P>Interface contracts in <code style={{ fontFamily:"var(--font-mono)" }}>contracts/</code>:</P>
            <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
              {feature.contracts.map(c => <WikiLink key={c} variant="external" href="#">{c}</WikiLink>)}
            </div>
          </div>
        )}
        {feature.tasks.length === 0 && feature.status === "draft" && (
          <div style={{ marginTop:"16px" }}>
            <MessageBox variant="notice">
              This feature is a <strong>Draft</strong> — only <code style={{ fontFamily:"var(--font-mono)" }}>spec.md</code> exists. Run <code style={{ fontFamily:"var(--font-mono)" }}>/speckit.plan</code> to add a plan.
            </MessageBox>
          </div>
        )}
      </div>
      {/* Right: sidebar — Infobox + TOC stacked */}
      <div style={{ flex:"0 0 270px", display:"flex", flexDirection:"column", gap:"12px" }}>
        <Infobox
          title={feature.title}
          slug={`specs:${feature.slug}`}
          branch={feature.branch}
          status={feature.status}
          lastModified={feature.modified}
          files={feature.files}
          style={{ float:"none", margin:0, width:"100%" }}
        />
        {tocHeadings.length > 0 && (
          <TableOfContents onSelect={id => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" })} headings={tocHeadings} style={{ maxWidth:"100%" }} />
        )}
      </div>
    </div>
  );
}

function TalkBody({ feature }) {
  if (!feature.clarifications.length) {
    return <div style={{ marginTop:"14px" }}><MessageBox variant="notice">No clarifications recorded for this feature.</MessageBox></div>;
  }
  return (
    <div style={{ marginTop:"14px" }}>
      <P>Q&amp;A log from the <code style={{ fontFamily:"var(--font-mono)" }}>## Clarifications</code> section of <code style={{ fontFamily:"var(--font-mono)" }}>spec.md</code>.</P>
      {feature.clarifications.map((c, i) => (
        <div key={i} style={{ borderLeft:"3px solid var(--border-default)", paddingLeft:"14px", margin:"0 0 16px" }}>
          <div style={{ fontWeight:700, fontSize:"14px", color:"var(--color-base-10)", marginBottom:"3px" }}>Q: {c.q}</div>
          <div style={{ fontSize:"14px", lineHeight:1.6, color:"var(--color-base-30)" }}>A: {c.a}</div>
        </div>
      ))}
    </div>
  );
}

function SourceBody({ feature, sub }) {
  const fileMap = {
    spec:      { content: feature.specContent,      name: "spec.md" },
    plan:      { content: feature.planContent,      name: "plan.md" },
    tasks:     { content: null,                     name: "tasks.md" },
    data:      { content: feature.dataModelContent, name: "data-model.md" },
    research:  { content: feature.researchContent,  name: "research.md" },
    quickstart:{ content: feature.quickstartContent,name: "quickstart.md" },
  };
  const { content, name } = fileMap[sub] || fileMap.spec;
  return (
    <div style={{ marginTop:"14px" }}>
      <div style={{ fontSize:"13px", color:"var(--color-base-50)", marginBottom:"8px" }}>
        Read-only source of <code style={{ fontFamily:"var(--font-mono)" }}>specs/{feature.slug}/{name}</code>
      </div>
      <pre style={{ fontFamily:"var(--font-mono)", fontSize:"13px", lineHeight:1.6, background:"var(--surface-subtle)", border:"1px solid var(--border-default)", borderRadius:"2px", padding:"14px 16px", margin:0, whiteSpace:"pre-wrap", color:"var(--color-base-10)" }}>
        {content || "(file content not loaded)"}
      </pre>
    </div>
  );
}

function HistoryBody({ feature, isGitRepo, projectPath }) {
  const [commits, setCommits] = useState(null);

  useEffect(() => {
    if (!isGitRepo || !projectPath) return;
    invoke("run_git", {
      projectPath,
      args: ["log", "--pretty=tformat:%h|%s|%an|%ar", "--", `specs/${feature.slug}/`],
    }).then(out => {
      const rows = out.trim().split("\n").filter(Boolean).map(line => line.split("|"));
      setCommits(rows);
    }).catch(() => setCommits([]));
  }, [feature.slug, isGitRepo, projectPath]);

  if (!isGitRepo) {
    return <div style={{ marginTop:"14px" }}><MessageBox variant="warning">Git history unavailable — not a git repository.</MessageBox></div>;
  }
  if (!commits) {
    return <div style={{ marginTop:"14px" }}><P>Loading git history…</P></div>;
  }
  if (!commits.length) {
    return <div style={{ marginTop:"14px" }}><MessageBox variant="notice">No commits found for this feature.</MessageBox></div>;
  }
  return (
    <div style={{ marginTop:"14px" }}>
      <P>Commits touching <code style={{ fontFamily:"var(--font-mono)" }}>specs/{feature.slug}/</code>:</P>
      <Wikitable columns={["Commit","Message","Author","When"]} rows={commits.map(c => [
        <WikiLink href="#" style={{ fontFamily:"var(--font-mono)", fontSize:"12px" }}>{c[0]}</WikiLink>,
        c[1], c[2], c[3],
      ])} />
    </div>
  );
}

export function AllSpecsPage({ data, navigate }) {
  return (
    <div>
      <PageTitle sub="Special page">Special:AllSpecs</PageTitle>
      <P>Every feature folder under <code style={{ fontFamily:"var(--font-mono)" }}>specs/</code>, in creation order.</P>
      {data.features.length === 0
        ? <MessageBox variant="notice">No features found.</MessageBox>
        : <Wikitable sortable columns={["#","Feature","Status","Files","Last modified"]} rows={data.features.map(f => [
            <code style={{ fontFamily:"var(--font-mono)", fontSize:"12px", color:"var(--color-base-30)" }}>{f.number}</code>,
            <WikiLink href="#" onClick={e => { e.preventDefault(); navigate({ page:"article", slug:f.slug, sub:"spec" }); }}>{f.title}</WikiLink>,
            <StatusBadge status={f.status} size="sm" />,
            String(Object.values(f.files).filter(Boolean).length),
            f.modified,
          ])} />
      }
    </div>
  );
}

export function RecentChangesPage({ data, navigate }) {
  return (
    <div>
      <PageTitle sub="Special page">Special:RecentChanges</PageTitle>
      <P>File modifications across the whole project, newest first.</P>
      {data.recentChanges.length === 0
        ? <MessageBox variant="notice">{data.project.isGitRepo ? "No recent changes found." : "Git history unavailable — not a git repository."}</MessageBox>
        : <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:"9px" }}>
            {data.recentChanges.map((r, i) => (
              <li key={i} style={{ fontSize:"14px", display:"flex", gap:"10px", alignItems:"baseline", borderBottom:"1px solid var(--border-faint)", paddingBottom:"8px" }}>
                <span style={{ color:"var(--color-base-50)", fontSize:"12px", width:"80px", flex:"0 0 80px" }}>{r.when}</span>
                <span>
                  <WikiLink href="#" onClick={e => { e.preventDefault(); navigate({ page:"article", slug:r.slug, sub:"spec" }); }}>{r.feature}</WikiLink>
                  <span style={{ color:"var(--color-base-50)" }}> — <code style={{ fontFamily:"var(--font-mono)", fontSize:"12px" }}>{r.file}</code></span>
                </span>
              </li>
            ))}
          </ul>
      }
    </div>
  );
}

export function SearchPage({ data, navigate, route }) {
  const [query, setQuery] = useState(route.query || "");

  const q = query.trim().toLowerCase();
  const results = q
    ? data.features.filter(f =>
        f.title.toLowerCase().includes(q) ||
        f.summary.toLowerCase().includes(q) ||
        f.slug.toLowerCase().includes(q) ||
        f.stories.some(s => s.title?.toLowerCase().includes(q) || s.summary?.toLowerCase().includes(q)) ||
        f.requirements.some(r => r.text?.toLowerCase().includes(q))
      )
    : [];

  return (
    <div>
      <PageTitle sub="Special page">Search</PageTitle>
      <div style={{ margin:"0 0 16px" }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search specs, stories, requirements…"
          autoFocus
          style={{ width:"100%", padding:"8px 12px", fontSize:"15px", border:"1px solid var(--border-default)", borderRadius:"2px", fontFamily:"var(--font-sans)", outline:"none", boxSizing:"border-box" }}
          onFocus={e => { e.target.style.borderColor="var(--focus-ring)"; e.target.style.boxShadow="inset 0 0 0 1px var(--focus-ring)"; }}
          onBlur={e => { e.target.style.borderColor="var(--border-default)"; e.target.style.boxShadow="none"; }}
        />
      </div>
      {q && (
        <P>
          {results.length === 0
            ? <>No features match <strong>"{query}"</strong>.</>
            : <>{results.length} result{results.length !== 1 ? "s" : ""} for <strong>"{query}"</strong></>}
        </P>
      )}
      {results.length > 0 && (
        <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:"14px" }}>
          {results.map(f => (
            <li key={f.slug}>
              <WikiLink href="#" onClick={e => { e.preventDefault(); navigate({ page:"article", slug:f.slug, sub:"spec" }); }} style={{ fontSize:"16px" }}>{f.title}</WikiLink>
              <p style={{ fontSize:"13px", color:"var(--color-base-30)", margin:"2px 0 0", lineHeight:1.5 }}>{f.summary || <em>No summary</em>}</p>
              <div style={{ fontSize:"12px", color:"var(--color-base-50)", marginTop:"2px", fontFamily:"var(--font-mono)" }}>specs/{f.slug}/spec.md</div>
            </li>
          ))}
        </ul>
      )}
      {!q && (
        <P style={{ color:"var(--color-base-50)" }}>Start typing to search across {data.features.length} feature{data.features.length !== 1 ? "s" : ""}.</P>
      )}
    </div>
  );
}
