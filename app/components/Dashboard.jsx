"use client";

import { useState, useRef, useEffect } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// Light-mode dashboard as requested (Notion + Linear + Perplexity feel)
// Neutral grays, soft backgrounds, minimal color, surgical accent use
const T = {
  bg: "#F7F7F8",
  surface: "#FFFFFF",
  surfaceHover: "#FAFAFA",
  border: "rgba(0,0,0,0.07)",
  borderMed: "rgba(0,0,0,0.11)",
  text: "#0F0F12",
  textSecondary: "#6B6B80",
  textTertiary: "#A0A0B8",
  accent: "#6366F1",
  accentLight: "rgba(99,102,241,0.08)",
  accentBorder: "rgba(99,102,241,0.22)",
  accentText: "#4F46E5",
  sidebarBg: "#FFFFFF",
  sidebarBorder: "rgba(0,0,0,0.06)",
  success: "#059669",
  successBg: "rgba(5,150,105,0.08)",
  warning: "#B45309",
  warningBg: "rgba(180,83,9,0.08)",
  muted: "#E4E4EA",
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: ${T.bg};
    color: ${T.text};
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 2px; }

  ::selection { background: rgba(99,102,241,0.15); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  @keyframes shimmer {
    from { background-position: -400px 0; }
    to   { background-position: 400px 0; }
  }

  .fadeup-0 { animation: fadeUp 0.4s ease 0.04s both; }
  .fadeup-1 { animation: fadeUp 0.4s ease 0.10s both; }
  .fadeup-2 { animation: fadeUp 0.4s ease 0.16s both; }
  .fadeup-3 { animation: fadeUp 0.4s ease 0.22s both; }
  .fadeup-4 { animation: fadeUp 0.4s ease 0.28s both; }
  .fadeup-5 { animation: fadeUp 0.4s ease 0.34s both; }
  .fadeup-6 { animation: fadeUp 0.4s ease 0.40s both; }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 7px 10px;
    border-radius: 7px;
    border: none;
    background: transparent;
    color: ${T.textSecondary};
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    font-family: inherit;
    width: 100%;
    text-align: left;
    transition: background 0.12s ease, color 0.12s ease;
    white-space: nowrap;
    text-decoration: none;
  }
  .nav-item:hover { background: ${T.bg}; color: ${T.text}; }
  .nav-item.active {
    background: ${T.accentLight};
    color: ${T.accentText};
    font-weight: 500;
  }

  .doc-row { transition: background 0.12s ease; }
  .doc-row:hover { background: ${T.bg}; }

  .card-hover { transition: box-shadow 0.15s ease, transform 0.15s ease; }
  .card-hover:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-1px); }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    font-family: 'JetBrains Mono', monospace;
  }

  @media (max-width: 900px) {
    .sidebar-full { width: 56px !important; }
    .sidebar-label { display: none !important; }
    .sidebar-section-title { display: none !important; }
  }

  @media (max-width: 640px) {
    .main-cols { flex-direction: column !important; }
  }
`;

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ic = ({ d, size = 16, stroke = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {d}
  </svg>
);

const Icons = {
  brain: <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>,
  home: <><rect x="3" y="9" width="18" height="13" rx="2"/><path d="M3 9l9-7 9 7"/></>,
  docs: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
  graph: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
  notes: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/><polyline points="14 2 14 8 20 8"/></>,
  collection: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  sparkle: <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z"/></>,
  arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  pdf: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
  chevronRight: <polyline points="9 18 15 12 9 6"/>,
  moreH: <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
  externalLink: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
  note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></>,
};

const Icon = ({ name, size = 16, color = "currentColor" }) => (
  <Ic d={Icons[name]} size={size} stroke={color} />
);

// ─── DATA ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home",       icon: "home",       label: "Home" },
  { id: "docs",       icon: "docs",       label: "My Documents" },
  { id: "chat",       icon: "chat",       label: "AI Chat" },
  { id: "graph",      icon: "graph",      label: "Knowledge Graph" },
  { id: "notes",      icon: "notes",      label: "Notes" },
  { id: "collection", icon: "collection", label: "Collections" },
];

const DOCS = [
  { name: "Attention Is All You Need", type: "pdf",   size: "2.4 MB", uploaded: "2h ago",     status: "indexed",    topics: 34 },
  { name: "Product Strategy Q3 2025",  type: "note",  size: "12 KB",  uploaded: "Yesterday",  status: "indexed",    topics: 12 },
  { name: "System Design Primer",      type: "pdf",   size: "8.1 MB", uploaded: "2 days ago", status: "indexed",    topics: 41 },
  { name: "ML Interview Prep",         type: "pdf",   size: "1.8 MB", uploaded: "3 days ago", status: "processing", topics: null },
  { name: "Architecture Diagrams",     type: "image", size: "840 KB", uploaded: "4 days ago", status: "indexed",    topics: 8 },
  { name: "Research Bibliography",     type: "link",  size: "—",      uploaded: "5 days ago", status: "indexed",    topics: 19 },
];

const CONVERSATIONS = [
  {
    question: "Summarize transformer attention mechanisms",
    preview: "Transformer attention works by computing weighted sums of value vectors, where weights are determined by query-key compatibility. Your papers highlight three main contributions: parallelization over RNNs, multi-head diversity, and O(1) path length between positions...",
    time: "2h ago",
    sources: 3,
  },
  {
    question: "What are the key differences in my product strategy notes?",
    preview: "Comparing your Q2 and Q3 strategy notes, the main shifts are: (1) pivot from growth-at-all-costs to retention-first, (2) enterprise tier moved to top priority, (3) new emphasis on collaboration features over solo productivity...",
    time: "Yesterday",
    sources: 2,
  },
  {
    question: "Explain CAP theorem from my system design notes",
    preview: "Based on your System Design Primer, CAP theorem states that a distributed system can only guarantee two of three properties: Consistency, Availability, and Partition tolerance. Your notes recommend CP systems for financial data and AP for social feeds...",
    time: "2 days ago",
    sources: 1,
  },
];

const STATS = [
  { label: "Documents",          value: "12",   sub: "+3 this week",     icon: "docs",    color: T.accent,   colorBg: T.accentLight },
  { label: "AI Conversations",   value: "48",   sub: "4.2s avg response", icon: "sparkle", color: "#7C3AED",  colorBg: "rgba(124,58,237,0.08)" },
  { label: "Knowledge Stored",   value: "2.4 GB", sub: "68% embedded",   icon: "graph",   color: "#059669",  colorBg: "rgba(5,150,105,0.08)" },
  { label: "Topics",             value: "34",   sub: "Auto-extracted",   icon: "collection", color: "#D97706", colorBg: "rgba(217,119,6,0.08)" },
];

const SUGGESTIONS = [
  "Summarize my latest PDF",
  "Find my ML notes",
  "Explain this concept",
  "What did I read about transformers?",
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const typeConfig = (type) => ({
  pdf:   { icon: "pdf",   color: "#EF4444", bg: "rgba(239,68,68,0.09)",  label: "PDF" },
  note:  { icon: "note",  color: "#6366F1", bg: T.accentLight,            label: "Note" },
  image: { icon: "image", color: "#059669", bg: "rgba(5,150,105,0.09)",  label: "Image" },
  link:  { icon: "link",  color: "#D97706", bg: "rgba(217,119,6,0.09)",  label: "Link" },
}[type] || { icon: "docs", color: T.textSecondary, bg: T.bg, label: type });

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon, color, colorBg, animClass }) => (
  <div
    className={`card-hover ${animClass}`}
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: "12px",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      flex: "1 1 160px",
      minWidth: 0,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: "12px", color: T.textSecondary, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
      <div style={{
        width: "30px", height: "30px",
        borderRadius: "8px",
        background: colorBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color,
      }}>
        <Icon name={icon} size={15} color={color} />
      </div>
    </div>
    <div>
      <div style={{ fontSize: "26px", fontWeight: 600, color: T.text, letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "12px", color: T.textSecondary, marginTop: "4px" }}>{sub}</div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const cfg = status === "indexed"
    ? { label: "Indexed",    bg: T.successBg,  color: T.success }
    : { label: "Processing", bg: T.accentLight, color: T.accentText };
  return (
    <span className="chip" style={{ background: cfg.bg, color: cfg.color }}>
      {status === "processing" && (
        <div style={{
          width: "6px", height: "6px",
          borderRadius: "50%",
          border: `1.5px solid ${cfg.color}`,
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
          flexShrink: 0,
        }} />
      )}
      {cfg.label}
    </span>
  );
};

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const Sidebar = ({ active, onNavigate }) => (
  <aside
    className="sidebar-full"
    style={{
      width: "220px",
      flexShrink: 0,
      background: T.sidebarBg,
      borderRight: `1px solid ${T.sidebarBorder}`,
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      padding: "0 0 16px",
      zIndex: 20,
    }}
  >
    {/* Logo */}
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "9px",
      padding: "18px 16px 14px",
      borderBottom: `1px solid ${T.border}`,
      marginBottom: "8px",
    }}>
      <div style={{
        width: "26px", height: "26px",
        background: T.accent,
        borderRadius: "7px",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon name="brain" size={14} color="white" />
      </div>
      <span
        className="sidebar-label"
        style={{ fontSize: "14px", fontWeight: 600, color: T.text, letterSpacing: "-0.02em" }}
      >
        Second Brain
      </span>
    </div>

    {/* Main nav */}
    <nav style={{ flex: 1, padding: "0 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
      <span
        className="sidebar-section-title"
        style={{ fontSize: "10px", fontWeight: 600, color: T.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 10px 4px" }}
      >
        Workspace
      </span>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-item${active === item.id ? " active" : ""}`}
          onClick={() => onNavigate(item.id)}
        >
          <Icon name={item.icon} size={15} color="currentColor" />
          <span className="sidebar-label">{item.label}</span>
        </button>
      ))}

      <span
        className="sidebar-section-title"
        style={{ fontSize: "10px", fontWeight: 600, color: T.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", padding: "16px 10px 4px" }}
      >
        Account
      </span>
      <button className="nav-item" onClick={() => onNavigate("settings")}>
        <Icon name="settings" size={15} color="currentColor" />
        <span className="sidebar-label">Settings</span>
      </button>
    </nav>

    {/* User profile */}
    <div style={{
      margin: "0 8px",
      padding: "12px",
      borderRadius: "10px",
      background: T.bg,
      border: `1px solid ${T.border}`,
      display: "flex",
      alignItems: "center",
      gap: "10px",
    }}>
      <div style={{
        width: "30px", height: "30px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #6366F1, #818CF8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "12px", fontWeight: 600, color: "white",
        flexShrink: 0,
      }}>J</div>
      <div className="sidebar-label" style={{ minWidth: 0 }}>
        <div style={{ fontSize: "12px", fontWeight: 500, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Jamie Chen</div>
        <div style={{ fontSize: "11px", color: T.textSecondary }}>Pro plan</div>
      </div>
    </div>
  </aside>
);

// ─── TOP NAV ──────────────────────────────────────────────────────────────────
const TopNav = ({ onUpload }) => {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header style={{
      height: "54px",
      background: T.surface,
      borderBottom: `1px solid ${T.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      {/* Search */}
      <div style={{
        position: "relative",
        width: "clamp(200px, 35%, 420px)",
      }}>
        <div style={{
          position: "absolute",
          left: "11px",
          top: "50%",
          transform: "translateY(-50%)",
          color: focused ? T.accent : T.textTertiary,
          pointerEvents: "none",
          transition: "color 0.15s ease",
        }}>
          <Icon name="search" size={14} color="currentColor" />
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search your knowledge..."
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: "34px",
            background: T.bg,
            border: `1px solid ${focused ? T.accentBorder : T.border}`,
            borderRadius: "8px",
            padding: "0 32px 0 34px",
            fontSize: "13px",
            color: T.text,
            outline: "none",
            fontFamily: "inherit",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.08)" : "none",
          }}
        />
        <div style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "10px",
          color: T.textTertiary,
          fontFamily: "JetBrains Mono, monospace",
          background: T.surface,
          border: `1px solid ${T.border}`,
          padding: "1px 5px",
          borderRadius: "4px",
          pointerEvents: "none",
        }}>⌘K</div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Bell */}
        <button style={{
          width: "34px", height: "34px",
          border: `1px solid ${T.border}`,
          borderRadius: "8px",
          background: "transparent",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.textSecondary,
          position: "relative",
          transition: "background 0.12s ease, color 0.12s ease",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.color = T.text; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSecondary; }}
        >
          <Icon name="bell" size={15} color="currentColor" />
          <div style={{
            position: "absolute",
            top: "7px", right: "7px",
            width: "6px", height: "6px",
            borderRadius: "50%",
            background: T.accent,
            border: `2px solid ${T.surface}`,
          }} />
        </button>

        {/* Avatar */}
        <div style={{
          width: "30px", height: "30px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366F1, #818CF8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: 600, color: "white",
          cursor: "pointer",
          flexShrink: 0,
        }}>J</div>

        {/* Upload CTA */}
        <button
          onClick={onUpload}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "0 14px",
            height: "34px",
            borderRadius: "8px",
            border: "none",
            background: T.accent,
            color: "white",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          <Icon name="upload" size={13} color="white" />
          Upload
        </button>
      </div>
    </header>
  );
};

// ─── AI SEARCH BOX ────────────────────────────────────────────────────────────
const AISearchBox = () => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState(null);

  const submit = () => {
    if (!query.trim()) return;
    setThinking(true);
    setResult(null);
    setTimeout(() => {
      setThinking(false);
      setResult(`Based on your ${Math.floor(Math.random() * 10 + 3)} documents on this topic, here's what I found...`);
    }, 1400);
  };

  return (
    <div className="fadeup-1" style={{
      background: T.surface,
      border: `1px solid ${focused ? T.accentBorder : T.border}`,
      borderRadius: "14px",
      overflow: "hidden",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      {/* Input row */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px" }}>
        <div style={{
          width: "28px", height: "28px",
          borderRadius: "7px",
          background: T.accentLight,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon name="sparkle" size={14} color={T.accentText} />
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Ask anything from your documents..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "14px",
            color: T.text,
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={submit}
          disabled={!query.trim() || thinking}
          style={{
            width: "30px", height: "30px",
            borderRadius: "7px",
            border: "none",
            background: query.trim() ? T.accent : T.muted,
            color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: query.trim() ? "pointer" : "default",
            transition: "background 0.15s ease",
            flexShrink: 0,
          }}
        >
          {thinking
            ? <div style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            : <Icon name="send" size={13} color="white" />}
        </button>
      </div>

      {/* Suggestions */}
      {!result && !thinking && (
        <div style={{
          borderTop: `1px solid ${T.border}`,
          padding: "10px 16px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); setFocused(true); }}
              style={{
                fontSize: "12px",
                color: T.textSecondary,
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: "20px",
                padding: "5px 12px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "border-color 0.12s ease, color 0.12s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accentBorder; e.currentTarget.style.color = T.accentText; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecondary; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Thinking / result */}
      {(thinking || result) && (
        <div style={{
          borderTop: `1px solid ${T.border}`,
          padding: "14px 16px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
        }}>
          <div style={{
            width: "22px", height: "22px",
            borderRadius: "6px",
            background: T.accentLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginTop: "1px",
          }}>
            <Icon name="sparkle" size={12} color={T.accentText} />
          </div>
          {thinking ? (
            <div style={{ display: "flex", gap: "4px", paddingTop: "4px" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: T.accent,
                  animation: `pulse 1.2s ease-in-out ${i * 0.18}s infinite`,
                }} />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "13px", color: T.text, lineHeight: 1.65 }}>{result}</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── DOCUMENTS TABLE ──────────────────────────────────────────────────────────
const DocumentsTable = () => (
  <div className="fadeup-4" style={{
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: "12px",
    overflow: "hidden",
  }}>
    {/* Header */}
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px 12px",
      borderBottom: `1px solid ${T.border}`,
    }}>
      <h2 style={{ fontSize: "13px", fontWeight: 600, color: T.text }}>Recent Documents</h2>
      <button style={{
        fontSize: "12px", color: T.accent,
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px",
      }}>
        View all <Icon name="arrowRight" size={12} color="currentColor" />
      </button>
    </div>

    {/* Column headers */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 80px 90px 100px 80px",
      padding: "8px 20px",
      gap: "12px",
    }}>
      {["Document", "Type", "Uploaded", "Status", ""].map(h => (
        <span key={h} style={{ fontSize: "11px", fontWeight: 500, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</span>
      ))}
    </div>

    {/* Rows */}
    {DOCS.map((doc, i) => {
      const tc = typeConfig(doc.type);
      return (
        <div
          key={i}
          className="doc-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px 90px 100px 80px",
            padding: "11px 20px",
            gap: "12px",
            alignItems: "center",
            borderTop: `1px solid ${T.border}`,
            cursor: "pointer",
            animation: `fadeUp 0.35s ease ${0.05 + i * 0.05}s both`,
          }}
        >
          {/* Name + icon */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <div style={{
              width: "28px", height: "28px",
              borderRadius: "7px",
              background: tc.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: tc.color,
              flexShrink: 0,
            }}>
              <Icon name={tc.icon} size={13} color="currentColor" />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 400, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {doc.name}
            </span>
          </div>

          {/* Type badge */}
          <div>
            <span className="chip" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
          </div>

          {/* Date */}
          <span style={{ fontSize: "12px", color: T.textSecondary }}>{doc.uploaded}</span>

          {/* Status */}
          <StatusBadge status={doc.status} />

          {/* Actions */}
          <div style={{ display: "flex", gap: "4px" }}>
            <button style={{
              width: "26px", height: "26px",
              border: `1px solid ${T.border}`,
              borderRadius: "6px",
              background: "transparent",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.textTertiary,
            }}>
              <Icon name="chat" size={12} color="currentColor" />
            </button>
            <button style={{
              width: "26px", height: "26px",
              border: `1px solid ${T.border}`,
              borderRadius: "6px",
              background: "transparent",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.textTertiary,
            }}>
              <Icon name="moreH" size={12} color="currentColor" />
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

// ─── AI CONVERSATION CARD ─────────────────────────────────────────────────────
const ConversationCard = ({ q, preview, time, sources, index }) => (
  <div
    className="card-hover"
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: "12px",
      padding: "16px",
      cursor: "pointer",
      animation: `fadeUp 0.4s ease ${0.3 + index * 0.07}s both`,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}
  >
    {/* Question */}
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
      <div style={{
        width: "20px", height: "20px",
        borderRadius: "5px",
        background: T.accentLight,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: "1px",
      }}>
        <Icon name="sparkle" size={11} color={T.accentText} />
      </div>
      <p style={{ fontSize: "13px", fontWeight: 500, color: T.text, lineHeight: 1.4 }}>{q}</p>
    </div>

    {/* Preview */}
    <p style={{
      fontSize: "12px",
      color: T.textSecondary,
      lineHeight: 1.6,
      overflow: "hidden",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      paddingLeft: "28px",
    }}>
      {preview}
    </p>

    {/* Footer */}
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: "28px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{
          fontSize: "11px",
          fontFamily: "JetBrains Mono, monospace",
          color: T.accentText,
          background: T.accentLight,
          padding: "2px 7px",
          borderRadius: "4px",
        }}>
          {sources} source{sources > 1 ? "s" : ""}
        </span>
      </div>
      <span style={{ fontSize: "11px", color: T.textTertiary, display: "flex", alignItems: "center", gap: "4px" }}>
        <Icon name="clock" size={11} color="currentColor" />
        {time}
      </span>
    </div>
  </div>
);

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [navActive, setNavActive] = useState("home");

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg }}>
        <Sidebar active={navActive} onNavigate={setNavActive} />

        {/* Main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <TopNav onUpload={() => setNavActive("docs")} />

          {/* Scrollable content */}
          <main style={{ flex: 1, overflowY: "auto", padding: "28px 28px 48px" }}>

            {/* ── Hero ──────────────────────────────────────────────────── */}
            <div className="fadeup-0" style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{
                  fontSize: "11px",
                  fontFamily: "JetBrains Mono, monospace",
                  color: T.accentText,
                  background: T.accentLight,
                  padding: "2px 9px",
                  borderRadius: "20px",
                  border: `1px solid ${T.accentBorder}`,
                }}>
                  Wednesday, Jun 25
                </span>
                <span style={{
                  fontSize: "11px",
                  fontFamily: "JetBrains Mono, monospace",
                  color: T.success,
                  background: T.successBg,
                  padding: "2px 9px",
                  borderRadius: "20px",
                }}>
                  3 new insights since yesterday
                </span>
              </div>
              <h1 style={{
                fontSize: "clamp(22px, 3vw, 30px)",
                fontWeight: 600,
                color: T.text,
                letterSpacing: "-0.04em",
                marginBottom: "6px",
                lineHeight: 1.2,
              }}>
                {greeting()}, Jamie
              </h1>
              <p style={{ fontSize: "14px", color: T.textSecondary, lineHeight: 1.5 }}>
                Your knowledge is ready. What would you like to explore?
              </p>
            </div>

            {/* ── AI Search ─────────────────────────────────────────────── */}
            <div style={{ marginBottom: "28px" }}>
              <AISearchBox />
            </div>

            {/* ── Stats ─────────────────────────────────────────────────── */}
            <div
              className="fadeup-2"
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "28px",
                flexWrap: "wrap",
              }}
            >
              {STATS.map((s, i) => (
                <StatCard key={s.label} {...s} animClass={`fadeup-${2 + i}`} />
              ))}
            </div>

            {/* ── Documents + Conversations row ──────────────────────────── */}
            <div
              className="main-cols"
              style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
            >
              {/* Documents table — wider */}
              <div style={{ flex: "1 1 60%", minWidth: 0 }}>
                <DocumentsTable />
              </div>

              {/* Conversations — narrower */}
              <div style={{ flex: "0 0 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="fadeup-4" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}>
                  <h2 style={{ fontSize: "13px", fontWeight: 600, color: T.text }}>Recent AI conversations</h2>
                  <button style={{
                    fontSize: "12px", color: T.accent,
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px",
                  }}>
                    View all <Icon name="arrowRight" size={12} color="currentColor" />
                  </button>
                </div>
                {CONVERSATIONS.map((c, i) => (
                  <ConversationCard
                    key={i}
                    q={c.question}
                    preview={c.preview}
                    time={c.time}
                    sources={c.sources}
                    index={i}
                  />
                ))}
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}