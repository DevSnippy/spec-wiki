/* SpecWiki app shell — left Vector sidebar + top bar. Composes
   SidebarBox, SearchBox primitives from the design-system bundle. */
const NS = window.SpecWikiDesignSystem_d3915e;

function Wordmark({ onHome }) {
  return (
    <button onClick={onHome} style={{
      display: "flex", alignItems: "center", gap: "10px", background: "transparent",
      border: "none", cursor: "pointer", padding: "4px 6px 14px", textAlign: "left", width: "100%",
    }}>
      <img src="../../assets/specwiki-mark.svg" width="38" height="38" alt="" />
      <span style={{ fontFamily: "var(--font-serif)", fontSize: "20px", lineHeight: 1.05, color: "var(--color-base-10)" }}>
        SpecWiki
        <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "10px", color: "var(--color-base-50)", letterSpacing: "0.04em" }}>
          THE SPEC KIT WIKI
        </span>
      </span>
    </button>
  );
}

function Sidebar({ features, route, navigate }) {
  const { SidebarBox } = NS;
  return (
    <aside style={{
      width: "var(--sidebar-width)", flex: "0 0 var(--sidebar-width)",
      background: "var(--surface-sidebar)", borderRight: "1px solid var(--border-default)",
      padding: "14px 12px", boxSizing: "border-box", overflowY: "auto", height: "100%",
    }}>
      <Wordmark onHome={() => navigate({ page: "main" })} />
      <SidebarBox title="Navigation" items={[
        { label: "Main Page", active: route.page === "main", onClick: () => navigate({ page: "main" }) },
        { label: "Random spec", onClick: () => navigate({ page: "article", slug: features[Math.floor(Math.random() * features.length)].slug, sub: "spec" }) },
        { label: "Recent changes", active: route.page === "special" && route.which === "recent", onClick: () => navigate({ page: "special", which: "recent" }) },
      ]} />
      <SidebarBox title="Contents">
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "1px", maxHeight: "40vh", overflowY: "auto" }}>
          {features.map((f) => {
            const active = route.page === "article" && route.slug === f.slug;
            return (
              <li key={f.slug}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate({ page: "article", slug: f.slug, sub: "spec" }); }}
                  style={{
                    display: "flex", gap: "6px", padding: "3px 8px", borderRadius: "2px",
                    fontSize: "var(--text-sidebar)", textDecoration: "none",
                    color: active ? "var(--color-base-10)" : "var(--link)", fontWeight: active ? 700 : 400,
                    background: active ? "rgba(0,0,0,0.06)" : "transparent",
                  }}>
                  <span style={{ color: "var(--color-base-50)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>{f.number}</span>
                  <span>{f.title}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </SidebarBox>
      <SidebarBox title="Tools" items={[
        { label: "What links here", onClick: () => {} },
        { label: "All specs", active: route.page === "special" && route.which === "allspecs", onClick: () => navigate({ page: "special", which: "allspecs" }) },
        { label: "Special pages", onClick: () => navigate({ page: "special", which: "allspecs" }) },
      ]} />
    </aside>
  );
}

function TopBar({ navigate, onClose }) {
  const { SearchBox } = NS;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px",
      height: "var(--topbar-height)", padding: "0 24px", boxSizing: "border-box",
      borderBottom: "1px solid var(--border-faint)", background: "#fff", flex: "0 0 auto",
    }}>
      <SearchBox width={300} onSubmit={() => navigate({ page: "special", which: "search" })} />
      <button title="Settings" style={iconBtn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-base-30)" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 13a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V19a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 13a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V2a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 20 9h.1a2 2 0 1 1 0 4H20a1.6 1.6 0 0 0-.6 0z" />
        </svg>
      </button>
      <button title="Close project" onClick={onClose} style={iconBtn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-base-30)" strokeWidth="1.8" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
const iconBtn = { width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid transparent", borderRadius: "2px", cursor: "pointer" };

function AppShell({ features, route, navigate, onClose, children }) {
  return (
    <div style={{ display: "flex", height: "100%", background: "var(--surface-canvas)", fontFamily: "var(--font-sans)" }}>
      <Sidebar features={features} route={route} navigate={navigate} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
        <TopBar navigate={navigate} onClose={onClose} />
        <main style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
          <div style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "var(--pad-content-y) var(--pad-content-x) 60px" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { SpecWikiShell: { AppShell, Sidebar, TopBar, Wordmark } });
