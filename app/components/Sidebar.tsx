"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
  type ReactNode,
  type FC,
} from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type NavItemId =
  | "home"
  | "documents"
  | "chat"
  | "graph"
  | "notes"
  | "settings";

export interface SidebarProps {
  /** Currently active route id */
  activeId?: NavItemId;
  /** Callback when a nav item is clicked */
  onNavigate?: (id: NavItemId) => void;
  /** Default collapsed state on desktop */
  defaultCollapsed?: boolean;
  /** User data */
  user?: { name: string; email: string; plan?: string; avatarInitials?: string };
}

// ─── CONTEXT (lets child components read collapsed state) ─────────────────────

interface SidebarCtx {
  collapsed: boolean;
  mobile: boolean;
}
const SidebarContext = createContext<SidebarCtx>({ collapsed: false, mobile: false });
const useSidebar = () => useContext(SidebarContext);

// ─── NAV SCHEMA ───────────────────────────────────────────────────────────────

interface NavItem {
  id: NavItemId;
  label: string;
  shortcut?: string;
  group: "main" | "secondary";
}

const NAV_ITEMS: NavItem[] = [
  { id: "home",      label: "Home",            shortcut: "G H", group: "main" },
  { id: "documents", label: "Documents",        shortcut: "G D", group: "main" },
  { id: "chat",      label: "AI Chat",          shortcut: "G A", group: "main" },
  { id: "graph",     label: "Knowledge Graph",  shortcut: "G K", group: "main" },
  { id: "notes",     label: "Notes",            shortcut: "G N", group: "main" },
  { id: "settings",  label: "Settings",                          group: "secondary" },
];

// ─── ICON COMPONENTS (pure SVG — no Lucide import needed for the demo) ────────
// In production: `import { Home, FileText, … } from "lucide-react"`

const ICONS: Record<NavItemId | "brain" | "chevronLeft" | "chevronRight" | "menu" | "x" | "plus", FC<{ size?: number; className?: string }>> = {
  brain: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  ),
  home: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  documents: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
    </svg>
  ),
  chat: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  ),
  graph: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  notes: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" />
    </svg>
  ),
  settings: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  ),
  chevronLeft: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevronRight: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  menu: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  x: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  plus: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

// ─── TOOLTIP (shown in collapsed mode) ───────────────────────────────────────

const Tooltip: FC<{ label: string; shortcut?: string; children: ReactNode }> = ({
  label,
  shortcut,
  children,
}) => {
  const { collapsed } = useSidebar();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    if (!collapsed) return;
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.top + rect.height / 2 });
    setVisible(true);
  }, [collapsed]);

  const hide = useCallback(() => setVisible(false), []);

  return (
    <div
      ref={ref}
      style={{ position: "relative" }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && collapsed && (
        <div
          style={{
            position: "fixed",
            left: "64px",
            top: pos.top,
            transform: "translateY(-50%)",
            zIndex: 9999,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "sb-tooltip-in 0.12s ease both",
          }}
        >
          {/* Arrow */}
          <div style={{
            width: 0, height: 0,
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderRight: "5px solid rgba(15,15,18,0.95)",
          }} />
          <div style={{
            background: "rgba(15,15,18,0.95)",
            color: "#E8E8F0",
            fontSize: "12px",
            fontWeight: 500,
            padding: "6px 10px",
            borderRadius: "7px",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            letterSpacing: "-0.01em",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {label}
            {shortcut && (
              <span style={{
                fontSize: "10px",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#6B6B88",
                letterSpacing: "0.02em",
              }}>
                {shortcut}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── NAV ITEM ─────────────────────────────────────────────────────────────────

const NavItemButton: FC<{
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  const { collapsed } = useSidebar();
  const Icon = ICONS[item.id];
  const [hovered, setHovered] = useState(false);

  return (
    <Tooltip label={item.label} shortcut={item.shortcut}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : "9px",
          width: "100%",
          padding: collapsed ? "9px" : "7px 9px",
          borderRadius: "7px",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "13px",
          fontWeight: isActive ? 500 : 400,
          letterSpacing: "-0.01em",
          textAlign: "left",
          justifyContent: collapsed ? "center" : "flex-start",
          position: "relative",
          transition: [
            "background 0.12s ease",
            "color 0.12s ease",
            "padding 0.2s cubic-bezier(0.4,0,0.2,1)",
            "gap 0.2s cubic-bezier(0.4,0,0.2,1)",
          ].join(", "),
          background: isActive
            ? "rgba(99,102,241,0.10)"
            : hovered
            ? "rgba(99,102,241,0.05)"
            : "transparent",
          color: isActive
            ? "#6366F1"
            : hovered
            ? "#0F0F14"
            : "#6B6B88",
          outline: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.4)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Active indicator bar */}
        {isActive && (
          <div style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "2.5px",
            height: "16px",
            background: "#6366F1",
            borderRadius: "0 2px 2px 0",
            transition: "opacity 0.15s ease",
          }} />
        )}

        {/* Icon wrapper — slight scale on active */}
        <span style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transform: isActive ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.15s ease",
          color: "inherit",
        }}>
          <Icon size={15} />
        </span>

        {/* Label */}
        {!collapsed && (
          <span style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            flex: 1,
            color: "inherit",
          }}>
            {item.label}
          </span>
        )}

        {/* Shortcut hint (only expanded, only on hover) */}
        {!collapsed && hovered && item.shortcut && (
          <span style={{
            fontSize: "10px",
            fontFamily: "'JetBrains Mono', monospace",
            color: "#AAAAC0",
            letterSpacing: "0.02em",
            flexShrink: 0,
            animation: "sb-fade-in 0.15s ease both",
          }}>
            {item.shortcut}
          </span>
        )}
      </button>
    </Tooltip>
  );
};

// ─── USER PROFILE SECTION ─────────────────────────────────────────────────────

const UserSection: FC<{
  user: NonNullable<SidebarProps["user"]>;
}> = ({ user }) => {
  const { collapsed } = useSidebar();
  const [hovered, setHovered] = useState(false);
  const initials = user.avatarInitials ?? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : "10px",
        width: "100%",
        padding: collapsed ? "8px" : "9px 10px",
        borderRadius: "9px",
        border: "1px solid",
        borderColor: hovered ? "rgba(99,102,241,0.18)" : "rgba(0,0,0,0.06)",
        background: hovered ? "rgba(99,102,241,0.04)" : "rgba(0,0,0,0.02)",
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        justifyContent: collapsed ? "center" : "flex-start",
        transition: [
          "background 0.15s ease",
          "border-color 0.15s ease",
          "gap 0.2s cubic-bezier(0.4,0,0.2,1)",
          "padding 0.2s cubic-bezier(0.4,0,0.2,1)",
        ].join(", "),
        outline: "none",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: "26px",
        height: "26px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        fontWeight: 600,
        color: "white",
        letterSpacing: "0.02em",
        flexShrink: 0,
        userSelect: "none",
      }}>
        {initials}
      </div>

      {!collapsed && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "#0F0F14",
            letterSpacing: "-0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {user.name}
          </div>
          <div style={{
            fontSize: "11px",
            color: "#9494B0",
            letterSpacing: "0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {user.plan ?? "Free plan"}
          </div>
        </div>
      )}
    </button>
  );
};

// ─── COLLAPSE TOGGLE BUTTON ───────────────────────────────────────────────────

const CollapseToggle: FC<{ collapsed: boolean; onToggle: () => void }> = ({
  collapsed,
  onToggle,
}) => {
  const [hovered, setHovered] = useState(false);
  const ChevronIcon = collapsed ? ICONS.chevronRight : ICONS.chevronLeft;

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      style={{
        position: "absolute",
        top: "50%",
        right: "-10px",
        transform: "translateY(-50%)",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        border: "1px solid",
        borderColor: hovered ? "rgba(99,102,241,0.4)" : "rgba(0,0,0,0.10)",
        background: hovered ? "rgba(99,102,241,0.06)" : "#FFFFFF",
        color: hovered ? "#6366F1" : "#9090B0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 30,
        transition: "border-color 0.15s ease, color 0.15s ease, background 0.15s ease, opacity 0.15s ease",
        opacity: hovered ? 1 : 0,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        outline: "none",
        padding: 0,
      }}
    >
      <ChevronIcon size={11} />
    </button>
  );
};

// ─── SIDEBAR INNER CONTENT ────────────────────────────────────────────────────

const SidebarContent: FC<{
  activeId: NavItemId;
  onNavigate: (id: NavItemId) => void;
  user: NonNullable<SidebarProps["user"]>;
  onClose?: () => void;
}> = ({ activeId, onNavigate, user, onClose }) => {
  const { collapsed } = useSidebar();

  const mainItems = NAV_ITEMS.filter((i) => i.group === "main");
  const secondaryItems = NAV_ITEMS.filter((i) => i.group === "secondary");
  const BrainIcon = ICONS.brain;
  const PlusIcon = ICONS.plus;
  const XIcon = ICONS.x;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
    }}>

      {/* ── Logo row ──────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        padding: collapsed ? "16px 12px 12px" : "16px 14px 12px",
        flexShrink: 0,
        gap: "8px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : "9px",
          overflow: "hidden",
          transition: "gap 0.2s cubic-bezier(0.4,0,0.2,1)",
        }}>
          {/* Logo mark */}
          <div style={{
            width: "26px",
            height: "26px",
            background: "#6366F1",
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 0 1px rgba(99,102,241,0.3), 0 2px 8px rgba(99,102,241,0.25)",
          }}>
            <BrainIcon size={14} />
          </div>

          {/* Wordmark */}
          {!collapsed && (
            <span style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#0F0F14",
              letterSpacing: "-0.03em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              animation: "sb-fade-in 0.15s ease both",
            }}>
              Second Brain
            </span>
          )}
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              border: "1px solid rgba(0,0,0,0.07)",
              background: "transparent",
              color: "#9494B0",
              cursor: "pointer",
              flexShrink: 0,
              padding: 0,
              outline: "none",
            }}
          >
            <XIcon size={14} />
          </button>
        )}
      </div>

      {/* ── Quick action ──────────────────────────────────────────────────── */}
      {!collapsed && (
        <div style={{ padding: "0 10px 12px", flexShrink: 0 }}>
          <button
            onClick={() => onNavigate("chat")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "8px 11px",
              borderRadius: "8px",
              border: "1px solid rgba(99,102,241,0.22)",
              background: "rgba(99,102,241,0.06)",
              color: "#5558E3",
              fontSize: "12.5px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "-0.01em",
              transition: "background 0.15s ease, border-color 0.15s ease",
              outline: "none",
              animation: "sb-fade-in 0.2s ease 0.05s both",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(99,102,241,0.10)";
              e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(99,102,241,0.06)";
              e.currentTarget.style.borderColor = "rgba(99,102,241,0.22)";
            }}
          >
            <PlusIcon size={13} />
            Ask your Brain
          </button>
        </div>
      )}

      {/* Divider after logo area */}
      <div style={{
        height: "1px",
        background: "rgba(0,0,0,0.05)",
        margin: "0 0 8px",
        flexShrink: 0,
      }} />

      {/* ── Main nav ──────────────────────────────────────────────────────── */}
      <nav
        aria-label="Main navigation"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "2px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "1px",
        }}
      >
        {/* Section label — only expanded */}
        {!collapsed && (
          <div style={{
            padding: "6px 9px 4px",
            fontSize: "10px",
            fontWeight: 600,
            color: "#C0C0D4",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            userSelect: "none",
          }}>
            Workspace
          </div>
        )}

        {mainItems.map((item) => (
          <NavItemButton
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            onClick={() => {
              onNavigate(item.id);
              onClose?.();
            }}
          />
        ))}
      </nav>

      {/* ── Bottom section ────────────────────────────────────────────────── */}
      <div style={{
        padding: "8px 8px 12px",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        flexShrink: 0,
      }}>
        {secondaryItems.map((item) => (
          <NavItemButton
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            onClick={() => {
              onNavigate(item.id);
              onClose?.();
            }}
          />
        ))}

        <div style={{ height: "8px" }} />

        <UserSection user={user} />
      </div>
    </div>
  );
};

// ─── MAIN EXPORTED COMPONENT ──────────────────────────────────────────────────
/**
 * Sidebar — collapsible desktop + mobile drawer.
 *
 * Usage:
 * ```tsx
 * <Sidebar
 *   activeId="home"
 *   onNavigate={(id) => router.push(`/${id}`)}
 *   user={{ name: "Jamie Chen", email: "jamie@acme.com", plan: "Pro" }}
 * />
 * ```
 */
export const Sidebar: FC<SidebarProps> = ({
  activeId = "home",
  onNavigate = () => {},
  defaultCollapsed = false,
  user = { name: "Jamie Chen", email: "jamie@acme.com", plan: "Pro plan" },
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHoveringAside, setIsHoveringAside] = useState(false);
  const toggleCollapse = useCallback(() => setCollapsed((v) => !v), []);

  // Detect mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  // Width tokens
  const EXPANDED_W = 220;
  const COLLAPSED_W = 52;
  const currentW = isMobile ? 0 : collapsed ? COLLAPSED_W : EXPANDED_W;

  return (
    <SidebarContext.Provider value={{ collapsed: isMobile ? false : collapsed, mobile: isMobile }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes sb-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sb-tooltip-in {
          from { opacity: 0; transform: translateY(-50%) translateX(-4px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
        @keyframes sb-drawer-in {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes sb-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Show collapse toggle on aside hover */
        .sb-aside:hover .sb-collapse-toggle {
          opacity: 1 !important;
        }

        /* Scrollbar within sidebar nav */
        .sb-nav::-webkit-scrollbar { width: 0; }
        .sb-nav:hover::-webkit-scrollbar { width: 3px; }
        .sb-nav::-webkit-scrollbar-track { background: transparent; }
        .sb-nav::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.10); border-radius: 2px; }

        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      {!isMobile && (
        <aside
          className="sb-aside"
          onMouseEnter={() => setIsHoveringAside(true)}
          onMouseLeave={() => setIsHoveringAside(false)}
          style={{
            position: "relative",
            width: `${currentW}px`,
            height: "100vh",
            flexShrink: 0,
            background: "#FFFFFF",
            borderRight: "1px solid rgba(0,0,0,0.06)",
            transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
            overflow: "visible", // so toggle button bleeds out
            zIndex: 20,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {/* Inner clip wrapper so content doesn't overflow during transition */}
          <div style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            width: collapsed ? `${COLLAPSED_W}px` : `${EXPANDED_W}px`,
            transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
          }}>
            <SidebarContent
              activeId={activeId}
              onNavigate={onNavigate}
              user={user}
            />
          </div>

          {/* Collapse toggle — appears on aside hover */}
          <div
            className="sb-collapse-toggle"
            style={{ opacity: 0, transition: "opacity 0.15s ease" }}
          >
            <CollapseToggle collapsed={collapsed} onToggle={toggleCollapse} />
          </div>
        </aside>
      )}

      {/* ── Mobile hamburger trigger ─────────────────────────────────────── */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          style={{
            position: "fixed",
            top: "14px",
            left: "14px",
            zIndex: 40,
            width: "36px",
            height: "36px",
            borderRadius: "9px",
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#FFFFFF",
            color: "#4A4A6A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            outline: "none",
            padding: 0,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {React.createElement(ICONS.menu, { size: 16 })}
        </button>
      )}

      {/* ── Mobile drawer ────────────────────────────────────────────────── */}
      {isMobile && mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10,10,18,0.45)",
              zIndex: 40,
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
              animation: "sb-overlay-in 0.18s ease both",
            }}
          />

          {/* Drawer panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "260px",
              background: "#FFFFFF",
              zIndex: 50,
              boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
              animation: "sb-drawer-in 0.22s cubic-bezier(0.4,0,0.2,1) both",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              WebkitFontSmoothing: "antialiased",
            }}
          >
            <SidebarContent
              activeId={activeId}
              onNavigate={onNavigate}
              user={user}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}
    </SidebarContext.Provider>
  );
};

export default Sidebar;


// ─────────────────────────────────────────────────────────────────────────────
// DEMO SHELL  (delete this in production — used only for the preview)
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

const PAGE_LABELS: Record<NavItemId, { title: string; description: string }> = {
  home:      { title: "Home",            description: "Overview of your knowledge system" },
  documents: { title: "Documents",       description: "All uploaded files and sources" },
  chat:      { title: "AI Chat",         description: "Converse with your knowledge base" },
  graph:     { title: "Knowledge Graph", description: "Visualize connections across your notes" },
  notes:     { title: "Notes",           description: "Freeform notes and highlights" },
  settings:  { title: "Settings",        description: "Preferences, team, and billing" },
};

export function SidebarDemo() {
  const [activeId, setActiveId] = useState<NavItemId>("home");
  const page = PAGE_LABELS[activeId];

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#F4F4F6",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      <Sidebar
        activeId={activeId}
        onNavigate={setActiveId}
        user={{ name: "Jamie Chen", email: "jamie@acme.com", plan: "Pro plan" }}
      />

      {/* Main content placeholder */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Top bar */}
        <header style={{
          height: "52px",
          background: "#FFFFFF",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: "12px",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#0F0F14", letterSpacing: "-0.01em" }}>
            {page.title}
          </span>
        </header>

        {/* Body */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "8px",
          color: "#C0C0D0",
          userSelect: "none",
        }}>
          <div style={{ fontSize: "22px", fontWeight: 600, color: "#0F0F14", letterSpacing: "-0.04em" }}>
            {page.title}
          </div>
          <div style={{ fontSize: "13px", color: "#9090B0" }}>
            {page.description}
          </div>
        </div>
      </main>
    </div>
  );
}
