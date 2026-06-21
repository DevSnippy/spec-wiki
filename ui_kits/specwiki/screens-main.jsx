/* SpecWiki screens — Welcome + Main Page (constitution dashboard). */
(function () {
const NS = window.SpecWikiDesignSystem_d3915e;

function PageTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-page-title)", fontWeight: 400, color: "var(--color-base-10)", margin: 0, lineHeight: 1.2 }}>{children}</h1>
      {sub && <div style={{ fontSize: "13px", color: "var(--color-base-50)", marginTop: "2px" }}>{sub}</div>}
      <hr style={{ border: 0, borderBottom: "1px solid var(--border-default)", margin: "6px 0 0" }} />
    </div>
  );
}

/* ---------- Welcome / Open Project ---------- */
function WelcomeScreen({ onOpen }) {
  const { Button, MessageBox } = NS;
  const [showErr, setShowErr] = React.useState(false);
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-sidebar)", fontFamily: "var(--font-sans)" }}>
      <div style={{ width: "460px", background: "#fff", border: "1px solid var(--border-default)", borderRadius: "3px", padding: "36px 40px", textAlign: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <img src="../../assets/specwiki-mark.svg" width="72" height="72" alt="" style={{ marginBottom: "12px" }} />
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "30px", fontWeight: 400, margin: "0 0 4px", color: "var(--color-base-10)" }}>SpecWiki</h1>
        <p style={{ fontSize: "14px", color: "var(--color-base-30)", margin: "0 0 24px", lineHeight: 1.6 }}>
          Browse any <a href="#" style={{ color: "var(--link)", textDecoration: "none" }}>Spec Kit</a> project as a fully cross-linked wiki — articles, talk pages, history and all.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
          <Button variant="progressive" onClick={onOpen} icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H3z" /></svg>
          }>Open Spec Kit Project</Button>
          <button onClick={() => setShowErr(true)} style={{ background: "none", border: "none", color: "var(--link)", fontSize: "13px", cursor: "pointer" }}>Open a folder without .specify/ (demo error)</button>
        </div>
        {showErr && (
          <div style={{ marginTop: "18px", textAlign: "left" }}>
            <MessageBox variant="error">This doesn't look like a Spec Kit project — no <code style={{ fontFamily: "var(--font-mono)" }}>.specify/</code> folder found.</MessageBox>
          </div>
        )}
        <div style={{ marginTop: "26px", fontSize: "12px", color: "var(--color-base-50)" }}>Read-only · 100% local · no files are ever written</div>
      </div>
    </div>
  );
}

/* ---------- Main Page (constitution dashboard) ---------- */
function MainPage({ data, navigate }) {
  const { WikiLink } = NS;
  const c = data.constitution;
  const totalTasks = data.features.reduce((n, f) => n + f.tasks.length, 0);
  const doneTasks = data.features.reduce((n, f) => n + f.tasks.filter((t) => t.done).length, 0);
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Masthead */}
      <div style={{ textAlign: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: "12px", marginBottom: "18px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "34px", fontWeight: 400, margin: 0, color: "var(--color-base-10)" }}>{c.title}</h1>
        <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "15px", color: "var(--color-base-30)", marginTop: "2px" }}>{data.project.tagline}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "22px", alignItems: "start" }}>
        {/* Featured-article box = constitution */}
        <section style={{ border: "1px dashed var(--status-planned-bd)", background: "#fcfcfd", borderRadius: "3px", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--color-base-10)" }}>From the constitution</span>
            <span style={{ fontSize: "11px", color: "var(--color-base-50)", fontFamily: "var(--font-mono)" }}>.specify/memory/constitution.md</span>
          </div>
          {c.principles.map((p, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "16px", fontWeight: 700, margin: "0 0 2px", color: "var(--color-base-10)" }}>{p.h}</h3>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--color-base-10)", margin: 0 }}>{p.t}</p>
            </div>
          ))}
        </section>

        {/* Right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <RailBox title="Recent changes">
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
              {data.recentChanges.slice(0, 5).map((r, i) => (
                <li key={i} style={{ fontSize: "13px", lineHeight: 1.4 }}>
                  <WikiLink href="#" onClick={(e) => { e.preventDefault(); navigate({ page: "article", slug: r.slug, sub: "spec" }); }}>{r.feature}</WikiLink>
                  <span style={{ color: "var(--color-base-50)" }}> — <code style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{r.file.split("/").pop()}</code>, {r.when}</span>
                </li>
              ))}
            </ul>
          </RailBox>
          <RailBox title="Contents">
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
              {data.features.map((f) => (
                <li key={f.slug} style={{ fontSize: "13px", display: "flex", gap: "6px" }}>
                  <span style={{ color: "var(--color-base-50)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>{f.number}</span>
                  <WikiLink href="#" onClick={(e) => { e.preventDefault(); navigate({ page: "article", slug: f.slug, sub: "spec" }); }}>{f.title}</WikiLink>
                </li>
              ))}
            </ul>
          </RailBox>
        </div>
      </div>

      {/* Bottom portal strip */}
      <div style={{ marginTop: "22px", borderTop: "1px solid var(--border-faint)", paddingTop: "14px", display: "flex", gap: "40px", alignItems: "center", flexWrap: "wrap" }}>
        <Stat n={data.features.length} label="features" />
        <Stat n={totalTasks} label="tasks tracked" />
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--color-base-30)", marginBottom: "4px" }}>
            <span>Overall progress</span><span>{doneTasks} / {totalTasks} tasks · {pct}%</span>
          </div>
          <div style={{ height: "10px", background: "var(--surface-header)", borderRadius: "999px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
            <div style={{ width: pct + "%", height: "100%", background: "var(--status-impl-fg)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RailBox({ title, children }) {
  return (
    <div style={{ border: "1px solid var(--border-default)", borderRadius: "3px", background: "var(--surface-sidebar)" }}>
      <div style={{ background: "var(--surface-accent)", borderBottom: "1px solid var(--border-default)", padding: "6px 12px", fontWeight: 700, fontSize: "13px", color: "var(--color-base-10)" }}>{title}</div>
      <div style={{ padding: "10px 12px" }}>{children}</div>
    </div>
  );
}
function Stat({ n, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "26px", color: "var(--color-base-10)" }}>{n}</div>
      <div style={{ fontSize: "12px", color: "var(--color-base-50)" }}>{label}</div>
    </div>
  );
}

Object.assign(window, { SpecWikiMain: { WelcomeScreen, MainPage, PageTitle } });
})();
