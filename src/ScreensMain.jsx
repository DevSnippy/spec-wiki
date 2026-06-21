import { useState } from "react";
import { Button, MessageBox, WikiLink } from "./designSystem";
import { MarkdownView } from "./markdownRenderer";

export function PageTitle({ children, sub }) {
  return (
    <div style={{ marginBottom:"10px" }}>
      <h1 style={{ fontFamily:"var(--font-serif)", fontSize:"var(--text-page-title)", fontWeight:400, color:"var(--color-base-10)", margin:0, lineHeight:1.2 }}>{children}</h1>
      {sub && <div style={{ fontSize:"13px", color:"var(--color-base-50)", marginTop:"2px" }}>{sub}</div>}
      <hr style={{ border:0, borderBottom:"1px solid var(--border-default)", margin:"6px 0 0" }} />
    </div>
  );
}

function RecentProjectsList({ projects, onOpen, onRemove, loading }) {
  if (!projects || projects.length === 0) return null;
  return (
    <div style={{ marginTop:"20px", textAlign:"left", borderTop:"1px solid var(--border-default)", paddingTop:"16px" }}>
      <div style={{ fontSize:"11px", fontWeight:700, color:"var(--color-base-50)", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:"8px" }}>Recent</div>
      <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:"2px" }}>
        {projects.map((p) => (
          <li key={p.path} style={{ display:"flex", alignItems:"center", gap:"6px", borderRadius:"2px", padding:"5px 6px", background:"transparent" }}
            onMouseEnter={e => { if (p.available !== false) e.currentTarget.style.background="var(--surface-sidebar)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}>
            <button
              onClick={() => p.available !== false && !loading && onOpen(p.path)}
              disabled={p.available === false || loading}
              style={{ flex:1, background:"transparent", border:"none", padding:0, textAlign:"left", cursor: p.available !== false ? "pointer" : "default", minWidth:0 }}>
              <div style={{ fontSize:"13px", fontWeight:600, color: p.available !== false ? "var(--color-base-10)" : "var(--color-base-50)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {p.name}
                {p.available === false && <span style={{ marginLeft:"6px", fontSize:"11px", fontWeight:400, color:"var(--color-base-70)" }}>(unavailable)</span>}
              </div>
              <div style={{ fontSize:"11px", color:"var(--color-base-50)", fontFamily:"var(--font-mono)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.path}</div>
            </button>
            <button
              onClick={() => onRemove(p.path)}
              title="Remove from list"
              style={{ flex:"0 0 auto", background:"transparent", border:"none", cursor:"pointer", color:"var(--color-base-70)", padding:"2px 4px", fontSize:"14px", lineHeight:1, borderRadius:"2px" }}
              onMouseEnter={e => { e.currentTarget.style.color="var(--color-base-10)"; }}
              onMouseLeave={e => { e.currentTarget.style.color="var(--color-base-70)"; }}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WelcomeScreen({ onOpen, onOpenRecent, onRemove, recentProjects = [], loading, error }) {
  return (
    <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--surface-sidebar)", fontFamily:"var(--font-sans)" }}>
      <div style={{ width:"460px", background:"#fff", border:"1px solid var(--border-default)", borderRadius:"3px", padding:"36px 40px", boxShadow:"0 1px 2px rgba(0,0,0,0.05)" }}>
        <div style={{ textAlign:"center" }}>
          <img src="/assets/specwiki-mark.svg" width="72" height="72" alt="" style={{ marginBottom:"12px" }} />
          <h1 style={{ fontFamily:"var(--font-serif)", fontSize:"30px", fontWeight:400, margin:"0 0 4px", color:"var(--color-base-10)" }}>SpecWiki</h1>
          <p style={{ fontSize:"14px", color:"var(--color-base-30)", margin:"0 0 24px", lineHeight:1.6 }}>
            Browse any Spec Kit project as a fully cross-linked wiki — articles, talk pages, history and all.
          </p>
          <Button
            variant="progressive"
            onClick={onOpen}
            disabled={loading}
            icon={
              loading
                ? <span style={{ display:"inline-block", width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.6s linear infinite" }} />
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H3z" /></svg>
            }
          >
            {loading ? "Opening…" : "Browse…"}
          </Button>
          {error && (
            <div style={{ marginTop:"18px", textAlign:"left" }}>
              <MessageBox variant="error">{error}</MessageBox>
            </div>
          )}
        </div>
        <RecentProjectsList projects={recentProjects} onOpen={onOpenRecent} onRemove={onRemove} loading={loading} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{ marginTop:"20px", fontSize:"12px", color:"var(--color-base-50)", textAlign:"center" }}>Read-only · 100% local · no files are ever written</div>
      </div>
    </div>
  );
}

function getConstitutionDisplayContent(raw) {
  if (!raw) return null;
  const lines = raw.split("\n");
  const start = lines.findIndex(l => /^##\s+/.test(l));
  if (start < 0) return null;
  const end = lines.findIndex((l, i) => i > start && /^##\s+(wiki formatting standard|governance)/i.test(l));
  return lines.slice(start, end >= 0 ? end : undefined).join("\n").trim() || null;
}

export function MainPage({ data, navigate }) {
  const c = data.constitution;
  const totalTasks = data.features.reduce((n, f) => n + f.tasks.length, 0);
  const doneTasks = data.features.reduce((n, f) => n + f.tasks.filter(t => t.done).length, 0);
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div>
      <div style={{ textAlign:"center", borderBottom:"1px solid var(--border-default)", paddingBottom:"12px", marginBottom:"18px" }}>
        <h1 style={{ fontFamily:"var(--font-serif)", fontSize:"34px", fontWeight:400, margin:0, color:"var(--color-base-10)" }}>{c.title}</h1>
        <div style={{ fontFamily:"var(--font-serif)", fontStyle:"italic", fontSize:"15px", color:"var(--color-base-30)", marginTop:"2px" }}>{data.project.tagline}</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"22px", alignItems:"start" }}>
        <section style={{ border:"1px solid var(--border-default)", borderRadius:"3px", overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 16px", background:"var(--surface-header)", borderBottom:"1px solid var(--border-default)" }}>
            <span style={{ fontFamily:"var(--font-serif)", fontSize:"15px", fontWeight:600, color:"var(--color-base-10)" }}>Constitution</span>
            <span style={{ fontSize:"11px", color:"var(--color-base-50)", fontFamily:"var(--font-mono)" }}>.specify/memory/constitution.md</span>
          </div>
          <div style={{ padding:"4px 20px 16px" }}>
            {getConstitutionDisplayContent(c.rawContent) ? (
              <MarkdownView content={getConstitutionDisplayContent(c.rawContent)} />
            ) : c.principles.length > 0 ? (
              c.principles.map((p, i) => (
                <div key={i} style={{ marginBottom:"12px", marginTop:"12px" }}>
                  <h3 style={{ fontFamily:"var(--font-serif)", fontSize:"16px", fontWeight:600, margin:"0 0 4px", color:"var(--color-base-10)" }}>{p.h}</h3>
                  <p style={{ fontSize:"14px", lineHeight:1.6, color:"var(--color-base-10)", margin:0 }}>{p.t}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize:"14px", color:"var(--color-base-50)", margin:"12px 0 0", fontStyle:"italic" }}>No constitution.md found — add one at <code style={{ fontFamily:"var(--font-mono)" }}>.specify/memory/constitution.md</code>.</p>
            )}
          </div>
        </section>

        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {data.recentChanges.length > 0 && (
            <RailBox title="Recent changes">
              <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:"7px" }}>
                {data.recentChanges.slice(0, 5).map((r, i) => (
                  <li key={i} style={{ fontSize:"13px", lineHeight:1.4 }}>
                    <WikiLink href="#" onClick={e => { e.preventDefault(); navigate({ page:"article", slug:r.slug, sub:"spec" }); }}>{r.feature}</WikiLink>
                    <span style={{ color:"var(--color-base-50)" }}> — <code style={{ fontFamily:"var(--font-mono)", fontSize:"11px" }}>{r.file.split("/").pop()}</code>, {r.when}</span>
                  </li>
                ))}
              </ul>
            </RailBox>
          )}
          <RailBox title="Contents">
            {data.features.length === 0 ? (
              <p style={{ fontSize:"13px", color:"var(--color-base-50)", margin:0 }}>No features found in specs/</p>
            ) : (
              <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:"5px" }}>
                {data.features.map(f => (
                  <li key={f.slug} style={{ fontSize:"13px", display:"flex", gap:"6px" }}>
                    <span style={{ color:"var(--color-base-50)", fontFamily:"var(--font-mono)", fontSize:"11px" }}>{f.number}</span>
                    <WikiLink href="#" onClick={e => { e.preventDefault(); navigate({ page:"article", slug:f.slug, sub:"spec" }); }}>{f.title}</WikiLink>
                  </li>
                ))}
              </ul>
            )}
          </RailBox>
        </div>
      </div>

      {data.features.length > 0 && (
        <div style={{ marginTop:"22px", borderTop:"1px solid var(--border-faint)", paddingTop:"14px", display:"flex", gap:"40px", alignItems:"center", flexWrap:"wrap" }}>
          <Stat n={data.features.length} label="features" />
          <Stat n={totalTasks} label="tasks tracked" />
          {totalTasks > 0 && (
            <div style={{ flex:1, minWidth:"200px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"12px", color:"var(--color-base-30)", marginBottom:"4px" }}>
                <span>Overall progress</span><span>{doneTasks} / {totalTasks} tasks · {pct}%</span>
              </div>
              <div style={{ height:"10px", background:"var(--surface-header)", borderRadius:"999px", overflow:"hidden", border:"1px solid var(--border-subtle)" }}>
                <div style={{ width:pct+"%", height:"100%", background:"var(--status-impl-fg)" }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RailBox({ title, children }) {
  return (
    <div style={{ border:"1px solid var(--border-default)", borderRadius:"3px", background:"var(--surface-sidebar)" }}>
      <div style={{ background:"var(--surface-accent)", borderBottom:"1px solid var(--border-default)", padding:"6px 12px", fontWeight:700, fontSize:"13px", color:"var(--color-base-10)" }}>{title}</div>
      <div style={{ padding:"10px 12px" }}>{children}</div>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontFamily:"var(--font-serif)", fontSize:"26px", color:"var(--color-base-10)" }}>{n}</div>
      <div style={{ fontSize:"12px", color:"var(--color-base-50)" }}>{label}</div>
    </div>
  );
}
