import { useState } from "react";

/* ---- MessageBox ---- */
export function MessageBox({ variant = "notice", icon, children, style }) {
  const map = {
    notice:  { border: "var(--notice-border)",  bg: "var(--notice-bg)",  mark: "ⓘ" },
    warning: { border: "var(--warning-border)", bg: "var(--warning-bg)", mark: "△" },
    error:   { border: "var(--error-border)",   bg: "var(--error-bg)",   mark: "✕" },
    success: { border: "var(--success-border)", bg: "var(--success-bg)", mark: "✓" },
  };
  const m = map[variant] || map.notice;
  return (
    <div style={{ display:"flex", gap:"10px", alignItems:"flex-start", background:m.bg, border:"1px solid var(--border-subtle)", borderLeft:`4px solid ${m.border}`, borderRadius:"2px", padding:"10px 14px", fontFamily:"var(--font-sans)", fontSize:"var(--text-body)", color:"var(--color-base-10)", lineHeight:1.5, margin:"10px 0", ...style }}>
      <span aria-hidden="true" style={{ color:m.border, fontWeight:700, lineHeight:1.4 }}>{icon || m.mark}</span>
      <div style={{ flex:1 }}>{children}</div>
    </div>
  );
}

/* ---- StatusBadge ---- */
export function StatusBadge({ status = "draft", size = "md", style }) {
  const map = {
    draft:       { fg:"var(--status-draft-fg)",   bg:"var(--status-draft-bg)",   bd:"var(--status-draft-bd)",   label:"Draft" },
    planned:     { fg:"var(--status-planned-fg)", bg:"var(--status-planned-bg)", bd:"var(--status-planned-bd)", label:"Planned" },
    ready:       { fg:"var(--status-ready-fg)",   bg:"var(--status-ready-bg)",   bd:"var(--status-ready-bd)",   label:"Ready to implement" },
    implemented: { fg:"var(--status-impl-fg)",    bg:"var(--status-impl-bg)",    bd:"var(--status-impl-bd)",    label:"Implemented" },
  };
  const s = map[status] || map.draft;
  const sm = size === "sm";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", fontFamily:"var(--font-sans)", fontWeight:700, lineHeight:1, fontSize:sm?"11px":"12px", padding:sm?"3px 7px":"5px 9px", borderRadius:"var(--radius-xs)", border:`1px solid ${s.bd}`, color:s.fg, background:s.bg, whiteSpace:"nowrap", ...style }}>
      {s.label}
    </span>
  );
}

/* ---- Infobox ---- */
export function Infobox({ title, slug, branch, status = "draft", lastModified, files = {}, style }) {
  const fileOrder = [["spec","spec.md"],["plan","plan.md"],["tasks","tasks.md"],["dataModel","data-model.md"],["research","research.md"],["quickstart","quickstart.md"]];
  const thStyle = { textAlign:"left", verticalAlign:"top", fontWeight:700, color:"var(--color-base-30)", padding:"5px 8px 5px 0", width:"42%", fontSize:"var(--text-small)" };
  const tdStyle = { padding:"5px 0", fontSize:"var(--text-small)", color:"var(--color-base-10)" };
  const Row = ({ label, children }) => (
    <tr>
      <th style={thStyle}>{label}</th>
      <td style={tdStyle}>{children}</td>
    </tr>
  );
  return (
    <aside style={{ float:"right", width:"270px", margin:"4px 0 16px 24px", background:"var(--surface-sidebar)", border:"1px solid var(--border-default)", borderRadius:"var(--radius-sm)", fontFamily:"var(--font-sans)", ...style }}>
      <div style={{ padding:"8px 10px", textAlign:"center", fontWeight:700, fontSize:"15px", color:"var(--color-base-10)", borderBottom:"1px solid var(--border-default)", background:"var(--surface-header)" }}>{title}</div>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <tbody>
          <tr><td colSpan={2} style={{ padding:"8px 10px 2px" }}><StatusBadge status={status} size="sm" /></td></tr>
        </tbody>
        <tbody>
          <tr>
            <td colSpan={2} style={{ padding:"0 10px" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <tbody>
                  {slug && <Row label="Slug"><code style={{ fontFamily:"var(--font-mono)", fontSize:"12px" }}>{slug}</code></Row>}
                  {branch && <Row label="Git branch"><code style={{ fontFamily:"var(--font-mono)", fontSize:"12px" }}>{branch}</code></Row>}
                  {lastModified && <Row label="Last modified">{lastModified}</Row>}
                  <Row label="Files present">
                    <div style={{ display:"flex", flexDirection:"column", gap:"3px" }}>
                      {fileOrder.map(([key, name]) => (
                        <div key={key} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                          <span style={{ color:files[key]?"var(--status-impl-fg)":"var(--color-base-70)", fontWeight:700, width:"12px", display:"inline-block" }}>{files[key]?"✓":"✗"}</span>
                          <code style={{ fontFamily:"var(--font-mono)", fontSize:"12px", color:files[key]?"var(--color-base-10)":"var(--color-base-50)" }}>{name}</code>
                        </div>
                      ))}
                    </div>
                  </Row>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ height:"8px" }} />
    </aside>
  );
}

/* ---- TaskList ---- */
export function TaskList({ tasks = [], style }) {
  const cell = (extra = {}) => ({ border:"1px solid var(--border-default)", padding:"6px 10px", verticalAlign:"middle", ...extra });
  return (
    <table style={{ borderCollapse:"collapse", width:"100%", fontFamily:"var(--font-sans)", background:"var(--surface-page)", margin:"8px 0", ...style }}>
      <thead>
        <tr>
          {["","ID","Task",""].map((h, i) => (
            <th key={i} style={{ background:"var(--surface-header)", border:"1px solid var(--border-default)", padding:"6px 10px", textAlign:"left", fontWeight:700, fontSize:"var(--text-small)", color:"var(--color-base-10)", width:i===0?"34px":i===1?"64px":i===3?"48px":"auto" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tasks.map((t, i) => (
          <tr key={i}>
            <td style={cell({ textAlign:"center" })}>
              <span style={{ display:"inline-block", width:"15px", height:"15px", border:"1px solid var(--border-default)", borderRadius:"2px", background:t.done?"var(--status-impl-fg)":"#fff", color:"#fff", fontSize:"11px", lineHeight:"15px", textAlign:"center" }}>{t.done?"✓":""}</span>
            </td>
            <td style={cell()}><code style={{ fontFamily:"var(--font-mono)", fontSize:"12px", color:"var(--color-base-30)" }}>{t.id}</code></td>
            <td style={cell({ color:"var(--color-base-10)", fontSize:"var(--text-body)", opacity:t.done?0.55:1 })}>{t.label}</td>
            <td style={cell({ textAlign:"center" })}>
              {t.parallel && <span title="Parallelizable" style={{ display:"inline-block", fontFamily:"var(--font-mono)", fontWeight:700, fontSize:"11px", padding:"1px 5px", borderRadius:"2px", color:"var(--marker-parallel-fg)", background:"var(--marker-parallel-bg)" }}>P</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---- WikiLink ---- */
export function WikiLink({ href = "#", variant = "internal", children, onClick, style }) {
  const colors = { internal:"var(--link)", visited:"var(--link-visited)", red:"var(--link-red)", external:"var(--link-external)" };
  return (
    <a href={href} onClick={onClick} title={variant==="red"?"Page does not exist":undefined}
      style={{ color:colors[variant]||colors.internal, textDecoration:"none", cursor:"pointer", fontFamily:"inherit", ...style }}
      onMouseEnter={e => e.currentTarget.style.textDecoration="underline"}
      onMouseLeave={e => e.currentTarget.style.textDecoration="none"}>
      {children}
      {variant === "external" && <span style={{ fontSize:"0.78em", marginLeft:"2px", verticalAlign:"1px" }}>↗</span>}
    </a>
  );
}

/* ---- Wikitable ---- */
export function Wikitable({ columns, rows, children, sortable = false, style }) {
  const tableStyle = { borderCollapse:"collapse", fontFamily:"var(--font-sans)", background:"var(--surface-page)", margin:"8px 0", ...style };
  if (children) return <table style={tableStyle}>{children}</table>;
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i} style={{ background:"var(--surface-header)", border:"1px solid var(--border-default)", padding:"6px 10px", textAlign:"left", fontWeight:700, fontSize:"var(--text-small)", color:"var(--color-base-10)", cursor:sortable?"pointer":"default", whiteSpace:"nowrap" }}>
              {c}{sortable && <span style={{ color:"var(--color-base-50)", marginLeft:"5px", fontSize:"10px" }}>⇕</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={ri}>
            {r.map((cell, ci) => (
              <td key={ci} style={{ border:"1px solid var(--border-default)", padding:"6px 10px", fontSize:"var(--text-body)", color:"var(--color-base-10)", verticalAlign:"top" }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---- ArticleTabs ---- */
export function ArticleTabs({ tabs, active, onSelect, style }) {
  const items = tabs || [{ id:"article", label:"Article" },{ id:"talk", label:"Talk" },{ id:"source", label:"View source" },{ id:"history", label:"History" }];
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:"2px", borderBottom:"1px solid var(--border-default)", fontFamily:"var(--font-sans)", ...style }}>
      {items.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id} onClick={() => !t.disabled && onSelect && onSelect(t.id)} disabled={t.disabled}
            style={{ background:"transparent", border:"none", padding:"7px 12px 8px", cursor:t.disabled?"default":"pointer", fontSize:"var(--text-small)", fontFamily:"var(--font-sans)", color:t.disabled?"var(--color-base-70)":isActive?"var(--color-base-10)":"var(--link)", fontWeight:isActive?700:400, borderBottom:isActive?"2px solid var(--primary)":"2px solid transparent", marginBottom:"-1px" }}
            onMouseEnter={e => { if (!isActive && !t.disabled) e.currentTarget.style.textDecoration="underline"; }}
            onMouseLeave={e => { e.currentTarget.style.textDecoration="none"; }}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---- Button ---- */
export function Button({ variant = "normal", size = "md", icon, children, onClick, disabled = false, style }) {
  const sm = size === "sm";
  const variants = {
    normal:      { background:"var(--button-progressive-bg)",   borderColor:"var(--button-progressive-border)", color:"var(--color-base-10)" },
    progressive: { background:"var(--primary)",                 borderColor:"var(--primary)",                   color:"var(--primary-fg)" },
    quiet:       { background:"transparent",                    borderColor:"transparent",                      color:"var(--link)" },
  };
  const hovers = {
    normal:      { background:"#fff", borderColor:"var(--color-base-50)" },
    progressive: { background:"var(--primary-hover)", borderColor:"var(--primary-hover)" },
    quiet:       { background:"var(--surface-sidebar)" },
  };
  const v = variants[variant] || variants.normal;
  const base = { display:"inline-flex", alignItems:"center", gap:"6px", fontFamily:"var(--font-sans)", fontWeight:700, fontSize:sm?"13px":"14px", lineHeight:1, cursor:disabled?"default":"pointer", padding:sm?"5px 10px":"7px 13px", borderRadius:"var(--radius-xs)", border:"1px solid", transition:"background-color 100ms, border-color 100ms", userSelect:"none", whiteSpace:"nowrap", opacity:disabled?0.55:1 };
  return (
    <button onClick={disabled?undefined:onClick} disabled={disabled}
      style={{ ...base, ...v, ...style }}
      onMouseEnter={e => { if (!disabled) Object.assign(e.currentTarget.style, hovers[variant]); }}
      onMouseLeave={e => { if (!disabled) Object.assign(e.currentTarget.style, v); }}>
      {icon && <span aria-hidden="true" style={{ display:"inline-flex", fontSize:"1.05em" }}>{icon}</span>}
      {children}
    </button>
  );
}

/* ---- SearchBox ---- */
export function SearchBox({ placeholder = "Search this project", value: valueProp, onChange, onSubmit, width = 280, style }) {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit && onSubmit(value); }}
      style={{ display:"flex", alignItems:"center", width, height:"var(--search-height)", background:"#fff", border:`1px solid ${focused?"var(--focus-ring)":"var(--border-default)"}`, boxShadow:focused?"inset 0 0 0 1px var(--focus-ring)":"none", borderRadius:"var(--search-radius)", padding:"0 8px", transition:"border-color 100ms, box-shadow 100ms", ...style }}>
      <span aria-hidden="true" style={{ color:"var(--color-base-50)", fontSize:"15px", marginRight:"6px", display:"inline-flex" }}>
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="8.5" cy="8.5" r="6" /><line x1="13" y1="13" x2="18" y2="18" strokeLinecap="round" />
        </svg>
      </span>
      <input type="text" value={value} placeholder={placeholder}
        onChange={e => { if (!isControlled) setInternalValue(e.target.value); onChange && onChange(e.target.value); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ flex:1, border:"none", outline:"none", background:"transparent", fontFamily:"var(--font-sans)", fontSize:"14px", color:"var(--color-base-10)" }} />
    </form>
  );
}

/* ---- SidebarBox ---- */
export function SidebarBox({ title, items, children, style }) {
  return (
    <div style={{ marginBottom:"18px", fontFamily:"var(--font-sans)", ...style }}>
      {title && <div style={{ fontSize:"12px", color:"var(--color-base-30)", fontWeight:400, padding:"0 0 4px 0", marginBottom:"2px" }}>{title}</div>}
      {items ? (
        <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:"1px" }}>
          {items.map((it, i) => (
            <li key={i}>
              <a href={it.href||"#"} onClick={e => { if (it.onClick) { e.preventDefault(); it.onClick(); } }}
                style={{ display:"block", padding:"3px 8px", borderRadius:"2px", fontSize:"var(--text-sidebar)", textDecoration:"none", color:it.active?"var(--color-base-10)":"var(--link)", fontWeight:it.active?700:400, background:it.active?"rgba(0,0,0,0.06)":"transparent" }}
                onMouseEnter={e => { if (!it.active) e.currentTarget.style.background="rgba(0,0,0,0.04)"; }}
                onMouseLeave={e => { if (!it.active) e.currentTarget.style.background="transparent"; }}>
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      ) : children}
    </div>
  );
}

/* ---- SubNav ---- */
export function SubNav({ items, active, onSelect, style }) {
  return (
    <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:"0", fontFamily:"var(--font-sans)", fontSize:"var(--text-small)", color:"var(--color-base-50)", margin:"6px 0 2px", ...style }}>
      {items.map((it, i) => {
        const isActive = it.id === active;
        return (
          <span key={it.id}>
            {i > 0 && <span style={{ margin:"0 8px", color:"var(--color-base-70)" }}>·</span>}
            {isActive
              ? <span style={{ fontWeight:700, color:"var(--color-base-10)" }}>{it.label}</span>
              : <WikiLink href={it.href||"#"} onClick={e => { e.preventDefault(); onSelect && onSelect(it.id); }}>{it.label}</WikiLink>}
          </span>
        );
      })}
    </div>
  );
}

/* ---- TableOfContents ---- */
export function TableOfContents({ headings = [], onSelect, title = "Contents", style }) {
  const counters = [];
  const numbered = headings.map(h => {
    const depth = Math.max(0, (h.level || 2) - 2);
    counters.length = depth + 1;
    counters[depth] = (counters[depth] || 0) + 1;
    for (let i = depth + 1; i < counters.length; i++) counters[i] = 0;
    return { ...h, num: counters.slice(0, depth + 1).filter(n => n).join(".") };
  });
  return (
    <nav style={{ display:"inline-block", minWidth:"180px", maxWidth:"var(--toc-max)", background:"var(--surface-sidebar)", border:"1px solid var(--border-default)", borderRadius:"var(--radius-sm)", padding:"10px 14px", fontFamily:"var(--font-sans)", fontSize:"var(--text-small)", ...style }}>
      <div style={{ fontWeight:700, textAlign:"center", marginBottom:"6px", color:"var(--color-base-10)" }}>{title}</div>
      <ol style={{ listStyle:"none", margin:0, padding:0 }}>
        {numbered.map((h, i) => (
          <li key={i} style={{ padding:"2px 0", paddingLeft:`${(h.level - 2) * 16}px` }}>
            <a href={`#${h.id}`} onClick={e => { e.preventDefault(); onSelect && onSelect(h.id); }}
              style={{ color:"var(--link)", textDecoration:"none", display:"flex", gap:"8px" }}
              onMouseEnter={e => e.currentTarget.style.textDecoration="underline"}
              onMouseLeave={e => e.currentTarget.style.textDecoration="none"}>
              <span style={{ color:"var(--color-base-30)" }}>{h.num}</span>
              <span>{h.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
