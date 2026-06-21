import { useState, useEffect, useRef } from "react";
import { SidebarBox, SearchBox } from "./designSystem";

const iconBtn = { width:"32px", height:"32px", display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", border:"1px solid transparent", borderRadius:"2px", cursor:"pointer" };

function Wordmark({ onHome }) {
  return (
    <button onClick={onHome} style={{ display:"flex", alignItems:"center", gap:"10px", background:"transparent", border:"none", cursor:"pointer", padding:"4px 6px 14px", textAlign:"left", width:"100%" }}>
      <img src="/assets/specwiki-mark.svg" width="38" height="38" alt="" />
      <span style={{ fontFamily:"var(--font-serif)", fontSize:"20px", lineHeight:1.05, color:"var(--color-base-10)" }}>
        SpecWiki
        <span style={{ display:"block", fontFamily:"var(--font-sans)", fontSize:"10px", color:"var(--color-base-50)", letterSpacing:"0.04em" }}>THE SPEC KIT WIKI</span>
      </span>
    </button>
  );
}

function Sidebar({ features, route, navigate }) {
  return (
    <aside style={{ width:"var(--sidebar-width)", flex:"0 0 var(--sidebar-width)", background:"var(--surface-sidebar)", borderRight:"1px solid var(--border-default)", padding:"14px 12px", boxSizing:"border-box", overflowY:"auto", height:"100%" }}>
      <Wordmark onHome={() => navigate({ page:"main" })} />
      <SidebarBox title="Navigation" items={[
        { label:"Main Page", active:route.page==="main", onClick:() => navigate({ page:"main" }) },
        { label:"Random spec", onClick:() => features.length && navigate({ page:"article", slug:features[Math.floor(Math.random()*features.length)].slug, sub:"spec" }) },
        { label:"Recent changes", active:route.page==="special"&&route.which==="recent", onClick:() => navigate({ page:"special", which:"recent" }) },
      ]} />
      <SidebarBox title="Contents">
        <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:"1px", maxHeight:"40vh", overflowY:"auto" }}>
          {features.map(f => {
            const active = route.page==="article" && route.slug===f.slug;
            return (
              <li key={f.slug}>
                <a href="#" onClick={e => { e.preventDefault(); navigate({ page:"article", slug:f.slug, sub:"spec" }); }}
                  style={{ display:"flex", gap:"6px", padding:"3px 8px", borderRadius:"2px", fontSize:"var(--text-sidebar)", textDecoration:"none", color:active?"var(--color-base-10)":"var(--link)", fontWeight:active?700:400, background:active?"rgba(0,0,0,0.06)":"transparent" }}>
                  <span style={{ color:"var(--color-base-50)", fontFamily:"var(--font-mono)", fontSize:"11px" }}>{f.number}</span>
                  <span>{f.title}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </SidebarBox>
      <SidebarBox title="Tools" items={[
        { label:"All specs", active:route.page==="special"&&route.which==="allspecs", onClick:() => navigate({ page:"special", which:"allspecs" }) },
        { label:"Formatting guide", active:route.page==="settings", onClick:() => navigate({ page:"settings" }) },
      ]} />
    </aside>
  );
}

function ProjectSwitcher({ projectName, recentProjects = [], activeProjectPath, onBrowse, onSwitch, onRemove }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Switch project"
        style={{ display:"flex", alignItems:"center", gap:"6px", background:"var(--surface-sidebar)", border:"1px solid var(--border-default)", borderRadius:"3px", padding:"4px 10px", cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:"13px", fontWeight:600, color:"var(--color-base-10)", maxWidth:"200px" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor="var(--color-base-50)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border-default)"; }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H3z" /></svg>
        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{projectName}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, minWidth:"260px", maxWidth:"360px", background:"#fff", border:"1px solid var(--border-default)", borderRadius:"3px", boxShadow:"0 4px 12px rgba(0,0,0,0.12)", zIndex:100, fontFamily:"var(--font-sans)" }}>
          {recentProjects.length > 0 && (
            <>
              <div style={{ padding:"6px 10px 4px", fontSize:"10px", fontWeight:700, color:"var(--color-base-50)", letterSpacing:"0.06em", textTransform:"uppercase" }}>Recent Projects</div>
              <ul style={{ listStyle:"none", margin:0, padding:"0 0 6px", display:"flex", flexDirection:"column" }}>
                {recentProjects.map((p) => {
                  const isActive = p.path === activeProjectPath;
                  const unavailable = p.available === false;
                  return (
                    <li key={p.path} style={{ display:"flex", alignItems:"center", gap:"4px", padding:"0 6px" }}>
                      <button
                        onClick={() => { if (!unavailable && !isActive) { onSwitch(p.path); setOpen(false); } }}
                        disabled={unavailable}
                        style={{ flex:1, background: isActive ? "var(--surface-sidebar)" : "transparent", border:"none", borderRadius:"2px", padding:"6px 8px", textAlign:"left", cursor: unavailable || isActive ? "default" : "pointer", minWidth:0 }}
                        onMouseEnter={e => { if (!unavailable && !isActive) e.currentTarget.style.background="var(--surface-sidebar)"; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background="transparent"; }}>
                        <div style={{ fontSize:"13px", fontWeight: isActive ? 700 : 400, color: unavailable ? "var(--color-base-50)" : "var(--color-base-10)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:"6px" }}>
                          {isActive && <span style={{ color:"var(--status-impl-fg)", fontSize:"11px" }}>✓</span>}
                          {p.name}
                          {unavailable && <span style={{ fontSize:"11px", fontWeight:400, color:"var(--color-base-70)" }}>(unavailable)</span>}
                        </div>
                        <div style={{ fontSize:"11px", color:"var(--color-base-50)", fontFamily:"var(--font-mono)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.path}</div>
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); onRemove(p.path); }}
                        title="Remove"
                        style={{ flex:"0 0 auto", background:"transparent", border:"none", cursor:"pointer", color:"var(--color-base-70)", padding:"2px 5px", fontSize:"14px", borderRadius:"2px" }}
                        onMouseEnter={e => { e.currentTarget.style.color="var(--color-base-10)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color="var(--color-base-70)"; }}>
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div style={{ borderTop:"1px solid var(--border-faint)" }} />
            </>
          )}
          <button
            onClick={() => { onBrowse(); setOpen(false); }}
            style={{ display:"flex", alignItems:"center", gap:"8px", width:"100%", background:"transparent", border:"none", padding:"9px 14px", cursor:"pointer", fontSize:"13px", color:"var(--link)", fontFamily:"var(--font-sans)" }}
            onMouseEnter={e => { e.currentTarget.style.background="var(--surface-sidebar)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Browse new project…
          </button>
        </div>
      )}
    </div>
  );
}

function TopBar({ navigate, onClose, projectName, recentProjects, activeProjectPath, onBrowse, onSwitch, onRemove }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", height:"var(--topbar-height)", padding:"0 24px", boxSizing:"border-box", borderBottom:"1px solid var(--border-faint)", background:"#fff", flex:"0 0 auto" }}>
      <ProjectSwitcher
        projectName={projectName}
        recentProjects={recentProjects}
        activeProjectPath={activeProjectPath}
        onBrowse={onBrowse}
        onSwitch={onSwitch}
        onRemove={onRemove}
      />
      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
        <SearchBox
          width={300}
          onSubmit={q => q && navigate({ page:"special", which:"search", query:q })}
        />
        <button title="Close project" onClick={onClose} style={iconBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-base-30)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function AppShell({ features, route, navigate, onClose, projectName, projectPath, recentProjects, onBrowse, onSwitch, onRemove, children }) {
  return (
    <div style={{ display:"flex", height:"100%", background:"var(--surface-canvas)", fontFamily:"var(--font-sans)" }}>
      <Sidebar features={features} route={route} navigate={navigate} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, height:"100%" }}>
        <TopBar
          navigate={navigate}
          onClose={onClose}
          projectName={projectName}
          recentProjects={recentProjects}
          activeProjectPath={projectPath}
          onBrowse={onBrowse}
          onSwitch={onSwitch}
          onRemove={onRemove}
        />
        <main style={{ flex:1, overflowY:"auto", background:"#fff" }}>
          <div style={{ maxWidth:"var(--content-max)", margin:"0 auto", padding:"var(--pad-content-y) var(--pad-content-x) 60px" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
