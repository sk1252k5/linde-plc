import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "CEO" | "CFO" | "COO" | "CTO" | "CDO" | "VP Operations";
type NavItem =
  | "vision-panel"
  | "nexus"
  | "nuro-vault"
  | "nuro-forge"
  | "nuro-stack"
  | "nuro-models";

// ─── Nav Config ───────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: NavItem; label: string; icon: string; sub?: string }[] = [
  { id: "vision-panel", label: "Vision Panel",  icon: "◈", sub: "Strategic Overview"   },
  { id: "nexus",        label: "Nexus",          icon: "⬡", sub: "Agent Orchestration"  },
  { id: "nuro-vault",   label: "NuroVault",      icon: "▣", sub: "Secure Data Layer"    },
  { id: "nuro-forge",   label: "NuroForge",      icon: "⟁", sub: "Model Development"    },
  { id: "nuro-stack",   label: "NuroStack",      icon: "≡", sub: "Infra & Deployment"   },
  { id: "nuro-models",  label: "NuroModels",     icon: "◎", sub: "Model Registry"       },
];

const NAV_ROUTE_MAP: Partial<Record<NavItem, string>> = {
  "vision-panel": "/command-center",
};

const ROLES: { id: Role; icon: string; desc: string; color: string }[] = [
  { id: "CEO",          icon: "◈", desc: "Enterprise Strategy & AI Programme",      color: "#007AB9" },
  { id: "CFO",          icon: "▲", desc: "Financial Performance & ERP Governance",  color: "#1E8449" },
  { id: "COO",          icon: "⬡", desc: "Operations, Supply Chain & Fleet",        color: "#8E44AD" },
  { id: "CTO",          icon: "≡", desc: "AI Infrastructure & System Reliability",  color: "#C0392B" },
  { id: "CDO",          icon: "▣", desc: "Data Governance & AI Ethics",             color: "#E8A000" },
  { id: "VP Operations",icon: "◎", desc: "Plant Operations & Safety Compliance",    color: "#2980B9" },
];

// ─── Role Content Data ────────────────────────────────────────────────────────
const ROLE_DATA: Record<
  Role,
  {
    greeting: string;
    focus: string;
    kpis: { label: string; value: string; delta: string; up: boolean; color: string }[];
    alerts: { level: "critical" | "warning" | "info"; text: string }[];
    actions: string[];
    insight: string;
  }
> = {
  CEO: {
    greeting: "Good morning, Chief Executive",
    focus: "Enterprise Performance & Strategic AI Programme",
    kpis: [
      { label: "AI Value Delivered YTD",   value: "$142.6M",   delta: "+18.4%", up: true,  color: "#007AB9" },
      { label: "Agent Uptime",             value: "99.4%",     delta: "+0.2%",  up: true,  color: "#007AB9" },
      { label: "Pending Board Actions",    value: "3",         delta: "-2",     up: true,  color: "#E8A000" },
      { label: "Global Facilities Online", value: "597 / 600", delta: "-3",     up: false, color: "#C0392B" },
    ],
    alerts: [
      { level: "critical", text: "3 regulatory compliance approvals awaiting CEO sign-off" },
      { level: "warning",  text: "AI Phase 3 rollout 12 days behind schedule in APAC region" },
      { level: "info",     text: "Q3 AI ROI report ready for board presentation" },
    ],
    actions: [
      "Review AI Programme Board Report",
      "Approve Ethics & Compliance Policy v4",
      "Sign off APAC Phase 3 Recovery Plan",
    ],
    insight:
      "LENA agents generated $142.6M in verified value YTD — 18.4% above target. Largest contributors: supply chain re-routing (+$48M) and predictive maintenance deflection (+$31M).",
  },
  CFO: {
    greeting: "Good morning, Chief Financial Officer",
    focus: "Financial Performance, ROI Tracking & ERP Governance",
    kpis: [
      { label: "AI Cost Savings YTD",    value: "$89.3M",   delta: "+11.2%", up: true,  color: "#007AB9" },
      { label: "ERP Migration Progress", value: "67%",      delta: "+4%",    up: true,  color: "#007AB9" },
      { label: "Unreconciled Entries",   value: "14",       delta: "+3",     up: false, color: "#C0392B" },
      { label: "Financial Close Status", value: "On Track", delta: "Day 3",  up: true,  color: "#27AE60" },
    ],
    alerts: [
      { level: "warning", text: "14 intercompany reconciliation entries pending review" },
      { level: "info",    text: "SAP S/4HANA cutover scheduled for Q4 — migration at 67%" },
      { level: "info",    text: "AI pricing engine generated $12.1M in margin uplift this quarter" },
    ],
    actions: [
      "Review Intercompany Reconciliation Queue",
      "Approve Q3 AI Investment Business Case",
      "Sign off ERP Migration Stage Gate 3",
    ],
    insight:
      "Take-or-pay contract optimisation by LENA's commercial agents has recovered $8.2M in at-risk revenue this quarter. Financial close is on Day 3 of 5 with zero escalations.",
  },
  COO: {
    greeting: "Good morning, Chief Operating Officer",
    focus: "Operations, Supply Chain & Fleet Performance",
    kpis: [
      { label: "Fleet Utilisation",       value: "84.7%", delta: "+2.1%", up: true,  color: "#007AB9" },
      { label: "On-Time Deliveries",      value: "96.2%", delta: "+0.8%", up: true,  color: "#27AE60" },
      { label: "Unplanned Shutdowns",     value: "2",     delta: "-1",    up: true,  color: "#007AB9" },
      { label: "Pending Route Approvals", value: "7",     delta: "+7",    up: false, color: "#E8A000" },
    ],
    alerts: [
      { level: "critical", text: "ASU Plant ID LI-0482 unplanned shutdown — LENA dispatched maintenance crew" },
      { level: "warning",  text: "7 AI route optimisation recommendations awaiting COO approval" },
      { level: "info",     text: "Fleet predictive maintenance deflected 14 breakdowns this week" },
    ],
    actions: [
      "Approve 7 Pending Route Optimisations",
      "Review Plant LI-0482 Incident Report",
      "Sign off Quarterly OEE Improvement Plan",
    ],
    insight:
      "LENA's supply chain agents re-routed 312 tanker trips this week, reducing average delivery time by 18 minutes and saving 14,200 litres of fuel. Fleet OEE at 84.7%, highest this year.",
  },
  CTO: {
    greeting: "Good morning, Chief Technology Officer",
    focus: "AI Infrastructure, NuroStack & System Reliability",
    kpis: [
      { label: "Active AI Agents",  value: "47",       delta: "+3",   up: true,  color: "#007AB9" },
      { label: "Decisions / Hour",  value: "1,247",    delta: "+124", up: true,  color: "#007AB9" },
      { label: "Tech Debt Score",   value: "62 / 100", delta: "-4",   up: false, color: "#E8A000" },
      { label: "OT Threat Level",   value: "MEDIUM",   delta: "↑",    up: false, color: "#E8A000" },
    ],
    alerts: [
      { level: "warning", text: "OT network anomaly detected at 3 sites — threat level elevated to MEDIUM" },
      { level: "warning", text: "Tech debt score dropped 4 points — 3 legacy systems past retirement date" },
      { level: "info",    text: "NuroStack auto-scaled 2 agent clusters during peak load — no degradation" },
    ],
    actions: [
      "Review OT Threat Response Playbook",
      "Approve Legacy System Retirement Plan",
      "Sign off NuroStack v3.2 Deployment",
    ],
    insight:
      "LENA processed 1,247 agent decisions in the last hour with 99.4% uptime. NuroStack auto-scaling handled a 34% spike in manufacturing telemetry without service degradation.",
  },
  CDO: {
    greeting: "Good morning, Chief Data Officer",
    focus: "Data Governance, AI Ethics & NuroVault Integrity",
    kpis: [
      { label: "Data Assets Catalogued",   value: "18,422", delta: "+340",  up: true,  color: "#007AB9" },
      { label: "Model Bias Audits (Open)", value: "4",      delta: "+1",    up: false, color: "#E8A000" },
      { label: "Data Quality Score",       value: "94.1%",  delta: "+0.6%", up: true,  color: "#27AE60" },
      { label: "Regulatory Flags",         value: "2",      delta: "0",     up: true,  color: "#C0392B" },
    ],
    alerts: [
      { level: "critical", text: "2 GDPR data residency flags require CDO sign-off within 48 hours" },
      { level: "warning",  text: "4 AI models in production pending bias audit completion" },
      { level: "info",     text: "NuroVault ingested 340 new data assets this week — lineage auto-tagged" },
    ],
    actions: [
      "Resolve 2 GDPR Residency Flags",
      "Review 4 Open Model Bias Audits",
      "Approve AI Model Governance Policy v3",
    ],
    insight:
      "NuroVault's automated lineage engine tagged 18,422 data assets with full provenance this quarter — reducing manual cataloguing effort by 73%. Data quality score at 94.1%, up from 87% six months ago.",
  },
  "VP Operations": {
    greeting: "Good morning, VP of Operations",
    focus: "Plant Operations, Maintenance & Safety Compliance",
    kpis: [
      { label: "Plant OEE",              value: "81.3%", delta: "+1.4%", up: true,  color: "#007AB9" },
      { label: "Predictive Maint. Hits", value: "34",    delta: "+8",    up: true,  color: "#27AE60" },
      { label: "Open Safety Permits",    value: "12",    delta: "+2",    up: false, color: "#E8A000" },
      { label: "PSM Compliance Score",   value: "97.8%", delta: "+0.3%", up: true,  color: "#007AB9" },
    ],
    alerts: [
      { level: "critical", text: "ASU Plant LI-0482 unplanned shutdown — root cause analysis in progress" },
      { level: "warning",  text: "12 open PSM safety permits require VP sign-off before end of shift" },
      { level: "info",     text: "Predictive maintenance model flagged 34 components for pre-emptive service" },
    ],
    actions: [
      "Review Plant LI-0482 RCA Report",
      "Approve 12 Open Safety Permits",
      "Sign off Monthly OEE Review",
    ],
    insight:
      "LENA's predictive maintenance agents have deflected an estimated 34 unplanned shutdowns this month, protecting $6.8M in production value. PSM compliance at 97.8% — highest since programme launch.",
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<NavItem>("vision-panel");
  const [activeRole, setActiveRole] = useState<Role | null>(null); // null = show role selector
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const data = activeRole ? ROLE_DATA[activeRole] : null;
  const activeRoleConfig = ROLES.find((r) => r.id === activeRole);

  return (
    <div style={s.root}>
      {/* ── TOPBAR ── */}
      <header style={s.topbar}>
        <div style={s.topbarLeft}>
          {activeRole && (
            <button style={s.collapseBtn} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              <span style={{ fontSize: 16, color: "#007AB9" }}>☰</span>
            </button>
          )}
          <div style={s.topbarLogo}>
            <span style={s.topbarLogoLinde}>LINDE</span>
            <div style={s.topbarLogoDot} />
            <span style={s.topbarLogoLena}>LENA</span>
          </div>
        </div>

        <div style={s.topbarCenter}>
          <span style={s.topbarTitle}>Enterprise AI Operating System</span>
        </div>

        <div style={s.topbarRight}>
          <div style={s.liveIndicator}>
            <span style={s.liveDot} />
            <span style={s.liveText}>LIVE</span>
          </div>
          {/* Show active role badge + change button if a role is selected */}
          {activeRole && (
            <div style={s.activeRoleBadge}>
              <span style={{ ...s.activeRoleDot, background: activeRoleConfig?.color }} />
              <span style={s.activeRoleLabel}>{activeRole}</span>
              <button style={s.changeRoleBtn} onClick={() => setActiveRole(null)}>
                Change ↺
              </button>
            </div>
          )}
          <div style={s.userAvatar}>
            {activeRole ? activeRole.slice(0, 2) : "—"}
          </div>
        </div>
      </header>

      <div style={s.body}>
        {/* ── SIDEBAR ── */}
        {activeRole && (
          <aside
            style={{
              ...s.sidebar,
              width: sidebarCollapsed ? 60 : 224,
              transition: "width 0.25s ease",
            }}
          >
          {!sidebarCollapsed && (
            <div style={s.sidebarBrand}>
              <div style={s.sidebarBrandIcon}>L</div>
              <div>
                <div style={s.sidebarBrandName}>LENA</div>
                <div style={s.sidebarBrandSub}>AI Platform</div>
              </div>
            </div>
          )}

          <div style={s.sidebarSection}>
            {!sidebarCollapsed && (
              <div style={s.sidebarSectionLabel}>PLATFORM</div>
            )}
            {NAV_ITEMS.map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  style={{
                    ...s.navItem,
                    background: active ? "#EAF4FB" : "transparent",
                    borderLeft: active ? "3px solid #007AB9" : "3px solid transparent",
                    color: active ? "#007AB9" : "#4A6680",
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    opacity: !activeRole ? 0.45 : 1,
                    cursor: !activeRole ? "not-allowed" : "pointer",
                  }}
                  onClick={() => {
                    if (!activeRole) return;
                    setActiveNav(item.id);
                    const route = NAV_ROUTE_MAP[item.id];
                    if (route) navigate(route);
                  }}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <span style={{ ...s.navIcon, color: active ? "#007AB9" : "#7A9AB5" }}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <div style={s.navText}>
                      <span style={s.navLabel}>{item.label}</span>
                      <span style={s.navSub}>{item.sub}</span>
                    </div>
                  )}
                  {!sidebarCollapsed && active && activeRole && (
                    <span style={s.navActiveDot} />
                  )}
                </button>
              );
            })}
          </div>

          {!sidebarCollapsed && (
            <div style={s.sidebarFooter}>
              <button style={s.sidebarFooterBtn} onClick={() => navigate("/")}>
                ← Exit to Landing
              </button>
              <div style={s.sidebarVersion}>EOS v2.0 · Build 2024.12</div>
            </div>
          )}
        </aside>
        )}

        {/* ── MAIN CONTENT ── */}
        <main style={activeRole ? s.main : s.fullPageMain}>
          {!activeRole ? (
            /* ── ROLE SELECTOR LANDING ── */
            <RoleSelector onSelect={(role) => setActiveRole(role)} />
          ) : (
            /* ── ROLE DASHBOARD ── */
            <>
              {/* Role greeting header */}
              <div style={s.pageHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <button
                    style={s.backBtn}
                    onClick={() => setActiveRole(null)}
                    title="Back to role selection"
                  >
                    ←
                  </button>
                  <div>
                    <h1 style={s.pageGreeting}>{data!.greeting}</h1>
                    <p style={s.pageFocus}>{data!.focus}</p>
                  </div>
                </div>
                <div style={s.pageHeaderMeta}>
                  <span style={s.pageDateBadge}>
                    {new Date().toLocaleDateString("en-GB", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* ── KPI Row ── */}
              <div style={s.kpiRow}>
                {data!.kpis.map((kpi) => (
                  <div key={kpi.label} style={s.kpiCard}>
                    <div style={{ ...s.kpiCardAccent, background: kpi.color }} />
                    <div style={s.kpiLabel}>{kpi.label}</div>
                    <div style={{ ...s.kpiValue, color: kpi.color }}>{kpi.value}</div>
                    <div style={{ ...s.kpiDelta, color: kpi.up ? "#27AE60" : "#C0392B" }}>
                      {kpi.up ? "▲" : "▼"} {kpi.delta}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Middle row: Alerts + Actions ── */}
              <div style={s.midRow}>
                <div style={s.panel}>
                  <div style={s.panelHeader}>
                    <span style={s.panelTitle}>Active Alerts</span>
                    <span style={s.panelCount}>{data!.alerts.length}</span>
                  </div>
                  <div style={s.panelBody}>
                    {data!.alerts.map((a, i) => (
                      <div key={i} style={s.alertRow}>
                        <div
                          style={{
                            ...s.alertDot,
                            background:
                              a.level === "critical" ? "#C0392B" :
                              a.level === "warning"  ? "#E8A000" : "#007AB9",
                          }}
                        />
                        <div style={s.alertContent}>
                          <span
                            style={{
                              ...s.alertBadge,
                              background:
                                a.level === "critical" ? "#FDF0EF" :
                                a.level === "warning"  ? "#FEF9EE" : "#EAF4FB",
                              color:
                                a.level === "critical" ? "#C0392B" :
                                a.level === "warning"  ? "#B07800" : "#005A8C",
                            }}
                          >
                            {a.level.toUpperCase()}
                          </span>
                          <span style={s.alertText}>{a.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={s.panel}>
                  <div style={s.panelHeader}>
                    <span style={s.panelTitle}>Required Actions</span>
                    <span style={{ ...s.panelCount, background: "#FEF9EE", color: "#B07800" }}>
                      {data!.actions.length}
                    </span>
                  </div>
                  <div style={s.panelBody}>
                    {data!.actions.map((action, i) => (
                      <div key={i} style={s.actionRow}>
                        <div style={s.actionIndex}>{String(i + 1).padStart(2, "0")}</div>
                        <span style={s.actionText}>{action}</span>
                        <button style={s.actionBtn}>Review →</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── LENA Insight strip ── */}
              <div style={s.insightBanner}>
                <div style={s.insightIcon}>◎</div>
                <div style={s.insightBody}>
                  <div style={s.insightLabel}>LENA Intelligence · Personalised for {activeRole}</div>
                  <div style={s.insightText}>{data!.insight}</div>
                </div>
                <button style={s.insightBtn}>Ask LENA →</button>
              </div>

              {/* ── Bottom row: Nav module previews ── */}
              <div style={s.moduleRow}>
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    style={{
                      ...s.moduleCard,
                      borderTop: activeNav === item.id
                        ? "3px solid #007AB9"
                        : "3px solid #E0EBF4",
                    }}
                    onClick={() => setActiveNav(item.id)}
                  >
                    <span style={s.moduleIcon}>{item.icon}</span>
                    <span style={s.moduleName}>{item.label}</span>
                    <span style={s.moduleSub}>{item.sub}</span>
                    <span style={s.moduleArrow}>→</span>
                  </button>
                ))}
              </div>

              {/* ── Active Nav Section Content ── */}
              <NavContent activeNav={activeNav} role={activeRole} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Role Selector Landing ────────────────────────────────────────────────────
function RoleSelector({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div style={rs.wrap}>
      {/* Hero */}
      <div style={rs.hero}>
        <div style={rs.heroBadge}>LENA · Enterprise AI Operating System</div>
        <h1 style={rs.heroTitle}>Select Your Role</h1>
        <p style={rs.heroSub}>
          Choose your designation to access a personalised command centre with
          role-specific KPIs, alerts, and AI-driven insights.
        </p>
      </div>

      {/* Role cards grid */}
      <div style={rs.grid}>
        {ROLES.map((role) => (
          <button
            key={role.id}
            style={rs.card}
            onClick={() => onSelect(role.id)}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(-4px)";
              el.style.boxShadow = `0 12px 32px rgba(0,0,0,0.12)`;
              el.style.borderColor = role.color;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
              el.style.borderColor = "#D8E6F0";
            }}
          >
            <div style={{ ...rs.cardIconWrap, background: role.color + "18", border: `1.5px solid ${role.color}30` }}>
              <span style={{ ...rs.cardIcon, color: role.color }}>{role.icon}</span>
            </div>
            <div style={rs.cardRole}>{role.id}</div>
            <div style={rs.cardDesc}>{role.desc}</div>
            <div style={{ ...rs.cardEnter, color: role.color }}>
              Enter Dashboard →
            </div>
            <div style={{ ...rs.cardAccent, background: role.color }} />
          </button>
        ))}
      </div>

      {/* Footer note */}
      <div style={rs.footer}>
        <span style={rs.footerDot} />
        <span style={rs.footerText}>
          All dashboards reflect live LENA agent data as of{" "}
          {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}

const rs: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0 60px", minHeight: "100%" },
  hero: { textAlign: "center", marginBottom: 40, maxWidth: 560 },
  heroBadge: { display: "inline-block", fontSize: 10, letterSpacing: "0.16em", color: "#005591", background: "#DDE9FF", border: "1px solid #A8CEFF", borderRadius: 999, padding: "4px 14px", marginBottom: 16, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" },
  heroTitle: { fontSize: 32, fontWeight: 800, color: "#002F5A", margin: "0 0 12px", letterSpacing: "0.01em", fontFamily: "'Rajdhani', sans-serif" },
  heroSub: { fontSize: 14, color: "#6B8AA0", lineHeight: 1.6, margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, width: "100%", maxWidth: 860, marginBottom: 32 },
  card: {
    position: "relative",
    background: "#fff",
    border: "1.5px solid #D8E6F0",
    borderRadius: 12,
    padding: "28px 24px 24px",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  cardIconWrap: { width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  cardIcon: { fontSize: 22 },
  cardRole: { fontSize: 18, fontWeight: 800, color: "#002F5A", letterSpacing: "0.04em", fontFamily: "'Rajdhani', sans-serif" },
  cardDesc: { fontSize: 12, color: "#7A9AB5", lineHeight: 1.4, flex: 1 },
  cardEnter: { fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", marginTop: 6 },
  cardAccent: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3 },
  footer: { display: "flex", alignItems: "center", gap: 8 },
  footerDot: { width: 6, height: 6, borderRadius: "50%", background: "#27AE60", flexShrink: 0, display: "inline-block" },
  footerText: { fontSize: 11, color: "#9BAEBB", fontFamily: "'JetBrains Mono', monospace" },
};

// ─── Nav Content Panels ───────────────────────────────────────────────────────
function NavContent({ activeNav, role }: { activeNav: NavItem; role: Role }) {
  const panels = {
    "vision-panel": <VisionPanel role={role} />,
    "nexus":        <NexusPanel />,
    "nuro-vault":   <NuroVaultPanel />,
    "nuro-forge":   <NuroForgePanel />,
    "nuro-stack":   <NuroStackPanel />,
    "nuro-models":  <NuroModelsPanel />,
  };
  return <div style={{ marginTop: 24 }}>{panels[activeNav]}</div>;
}

// ── Vision Panel ──────────────────────────────────────────────────────────────
function VisionPanel({ role }: { role: Role }) {
  const phases = [
    { phase: "Phase 1", name: "Foundation",      status: "complete",    pct: 100, sites: 600  },
    { phase: "Phase 2", name: "Intelligence",    status: "active",      pct: 72,  sites: 432  },
    { phase: "Phase 3", name: "Autonomy",        status: "in-progress", pct: 28,  sites: 168  },
    { phase: "Phase 4", name: "Self-Optimising", status: "planned",     pct: 0,   sites: 0    },
  ];
  return (
    <SectionWrapper title="Vision Panel" sub={`Strategic AI Transformation Roadmap · ${role}`}>
      <div style={s.vpGrid}>
        {phases.map((p) => (
          <div key={p.phase} style={s.vpCard}>
            <div style={s.vpCardTop}>
              <span style={s.vpPhase}>{p.phase}</span>
              <span style={{
                ...s.vpStatus,
                background: p.status === "complete" ? "#E8F8F1" : p.status === "active" ? "#EAF4FB" : p.status === "in-progress" ? "#FEF9EE" : "#F5F7FA",
                color: p.status === "complete" ? "#1E8449" : p.status === "active" ? "#005A8C" : p.status === "in-progress" ? "#B07800" : "#8899A8",
              }}>
                {p.status === "complete" ? "✓ Complete" : p.status === "active" ? "● Active" : p.status === "in-progress" ? "◐ In Progress" : "○ Planned"}
              </span>
            </div>
            <div style={s.vpName}>{p.name}</div>
            <div style={s.vpBarWrap}>
              <div style={{ ...s.vpBar, width: `${p.pct}%`, background: p.pct === 100 ? "#27AE60" : "#007AB9" }} />
            </div>
            <div style={s.vpMeta}>{p.pct}% · {p.sites} sites</div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ── Nexus Panel ───────────────────────────────────────────────────────────────
function NexusPanel() {
  const agents = [
    { name: "SupplyOptimiser-7", domain: "Supply Chain", status: "active",  decisions: 312, confidence: 97 },
    { name: "PredictMaint-3",    domain: "Manufacturing",status: "active",  decisions: 189, confidence: 94 },
    { name: "PricingEngine-2",   domain: "Commercial",   status: "active",  decisions: 241, confidence: 91 },
    { name: "RiskGuard-1",       domain: "Compliance",   status: "standby", decisions: 44,  confidence: 88 },
    { name: "FleetRouter-9",     domain: "Logistics",    status: "active",  decisions: 416, confidence: 96 },
  ];
  return (
    <SectionWrapper title="Nexus" sub="Agent Orchestration & Live Decision Queue">
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Agent", "Domain", "Status", "Decisions Today", "Confidence", "Action"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.name} style={s.tr}>
                <td style={{ ...s.td, fontWeight: 600, color: "#002F5A" }}>{a.name}</td>
                <td style={s.td}>{a.domain}</td>
                <td style={s.td}>
                  <span style={{
                    ...s.tableBadge,
                    background: a.status === "active" ? "#E8F8F1" : "#F5F7FA",
                    color: a.status === "active" ? "#1E8449" : "#8899A8",
                  }}>
                    {a.status === "active" ? "● Active" : "○ Standby"}
                  </span>
                </td>
                <td style={{ ...s.td, fontFamily: "monospace", color: "#007AB9", fontWeight: 600 }}>{a.decisions}</td>
                <td style={s.td}>
                  <div style={s.confRow}>
                    <div style={s.confBarWrap}>
                      <div style={{ ...s.confBar, width: `${a.confidence}%` }} />
                    </div>
                    <span style={s.confVal}>{a.confidence}%</span>
                  </div>
                </td>
                <td style={s.td}>
                  <button style={s.tableBtn}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}

// ── NuroVault ─────────────────────────────────────────────────────────────────
function NuroVaultPanel() {
  const stats = [
    { label: "Data Assets",      value: "18,422", icon: "▣" },
    { label: "Lineage Coverage", value: "94.1%",  icon: "↗" },
    { label: "Active Pipelines", value: "214",    icon: "⇌" },
    { label: "Compliance Score", value: "98.2%",  icon: "✓" },
  ];
  const sources = [
    { name: "SAP S/4HANA",     records: "4.2M",  status: "healthy" },
    { name: "SCADA / OT",      records: "18.7M", status: "healthy" },
    { name: "Fleet Telemetry", records: "6.1M",  status: "healthy" },
    { name: "Market Feeds",    records: "892K",  status: "warning" },
    { name: "HR Systems",      records: "214K",  status: "healthy" },
  ];
  return (
    <SectionWrapper title="NuroVault" sub="Secure Enterprise Data Layer & Lineage Engine">
      <div style={s.vaultGrid}>
        {stats.map((s2) => (
          <div key={s2.label} style={s.vaultStat}>
            <span style={s.vaultStatIcon}>{s2.icon}</span>
            <span style={s.vaultStatVal}>{s2.value}</span>
            <span style={s.vaultStatLabel}>{s2.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <div style={s.panelHeader}><span style={s.panelTitle}>Connected Data Sources</span></div>
        {sources.map((src) => (
          <div key={src.name} style={s.sourceRow}>
            <span style={s.sourceName}>{src.name}</span>
            <span style={s.sourceRecords}>{src.records} records</span>
            <span style={{
              ...s.tableBadge,
              background: src.status === "healthy" ? "#E8F8F1" : "#FEF9EE",
              color: src.status === "healthy" ? "#1E8449" : "#B07800",
            }}>
              {src.status === "healthy" ? "✓ Healthy" : "⚠ Warning"}
            </span>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ── NuroForge ─────────────────────────────────────────────────────────────────
function NuroForgePanel() {
  const experiments = [
    { name: "ChurnPredictor-v4",   type: "Classification", status: "training", accuracy: 91, owner: "CDO Team" },
    { name: "DemandForecast-APAC", type: "Time Series",    status: "review",   accuracy: 88, owner: "COO Team" },
    { name: "MaintenanceAlert-v2", type: "Anomaly",        status: "deployed", accuracy: 94, owner: "CTO Team" },
    { name: "PricingOptimiser-v6", type: "Reinforcement",  status: "training", accuracy: 87, owner: "CFO Team" },
  ];
  const statusColor = (st: string) =>
    st === "deployed" ? { bg: "#E8F8F1", fg: "#1E8449" } :
    st === "training" ? { bg: "#EAF4FB", fg: "#005A8C" } :
    { bg: "#FEF9EE", fg: "#B07800" };
  return (
    <SectionWrapper title="NuroForge" sub="Model Development, Experimentation & Training">
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>{["Model", "Type", "Status", "Accuracy", "Owner", "Action"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {experiments.map((e) => {
              const sc = statusColor(e.status);
              return (
                <tr key={e.name} style={s.tr}>
                  <td style={{ ...s.td, fontWeight: 600, color: "#002F5A" }}>{e.name}</td>
                  <td style={s.td}>{e.type}</td>
                  <td style={s.td}><span style={{ ...s.tableBadge, background: sc.bg, color: sc.fg }}>{e.status}</span></td>
                  <td style={{ ...s.td, fontFamily: "monospace", color: "#007AB9", fontWeight: 600 }}>{e.accuracy}%</td>
                  <td style={s.td}>{e.owner}</td>
                  <td style={s.td}><button style={s.tableBtn}>Open</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}

// ── NuroStack ─────────────────────────────────────────────────────────────────
function NuroStackPanel() {
  const services = [
    { name: "Agent Runtime",    region: "EU-West", cpu: 42, mem: 61, status: "healthy" },
    { name: "Inference Engine", region: "US-East", cpu: 78, mem: 83, status: "warning" },
    { name: "Data Ingestion",   region: "APAC",    cpu: 31, mem: 44, status: "healthy" },
    { name: "Model Serving",    region: "EU-West", cpu: 55, mem: 67, status: "healthy" },
    { name: "Telemetry Bus",    region: "Global",  cpu: 29, mem: 38, status: "healthy" },
  ];
  return (
    <SectionWrapper title="NuroStack" sub="Infrastructure, Compute & Deployment Layer">
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>{["Service", "Region", "CPU", "Memory", "Status"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {services.map((svc) => (
              <tr key={svc.name} style={s.tr}>
                <td style={{ ...s.td, fontWeight: 600, color: "#002F5A" }}>{svc.name}</td>
                <td style={s.td}>{svc.region}</td>
                <td style={s.td}>
                  <div style={s.confRow}>
                    <div style={s.confBarWrap}>
                      <div style={{ ...s.confBar, width: `${svc.cpu}%`, background: svc.cpu > 70 ? "#E8A000" : "#007AB9" }} />
                    </div>
                    <span style={s.confVal}>{svc.cpu}%</span>
                  </div>
                </td>
                <td style={s.td}>
                  <div style={s.confRow}>
                    <div style={s.confBarWrap}>
                      <div style={{ ...s.confBar, width: `${svc.mem}%`, background: svc.mem > 75 ? "#C0392B" : "#007AB9" }} />
                    </div>
                    <span style={s.confVal}>{svc.mem}%</span>
                  </div>
                </td>
                <td style={s.td}>
                  <span style={{
                    ...s.tableBadge,
                    background: svc.status === "healthy" ? "#E8F8F1" : "#FEF9EE",
                    color: svc.status === "healthy" ? "#1E8449" : "#B07800",
                  }}>
                    {svc.status === "healthy" ? "✓ Healthy" : "⚠ Warning"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}

// ── NuroModels ────────────────────────────────────────────────────────────────
function NuroModelsPanel() {
  const models = [
    { name: "SupplyOpt-7",     version: "v7.2.1", domain: "Logistics",    deployed: "12 Nov 2024", calls: "84K/day",  drift: "low" },
    { name: "PredictMaint-3",  version: "v3.0.4", domain: "Manufacturing",deployed: "4 Oct 2024",  calls: "52K/day",  drift: "low" },
    { name: "ChurnDetect-2",   version: "v2.1.0", domain: "Commercial",   deployed: "22 Sep 2024", calls: "18K/day",  drift: "med" },
    { name: "PricingEngine-6", version: "v6.0.0", domain: "Finance",      deployed: "1 Dec 2024",  calls: "31K/day",  drift: "low" },
    { name: "ThreatMonitor-1", version: "v1.4.2", domain: "Cybersecurity",deployed: "10 Nov 2024", calls: "120K/day", drift: "low" },
  ];
  const driftColor = (d: string) =>
    d === "low" ? { bg: "#E8F8F1", fg: "#1E8449" } :
    d === "med" ? { bg: "#FEF9EE", fg: "#B07800" } :
    { bg: "#FDF0EF", fg: "#C0392B" };
  return (
    <SectionWrapper title="NuroModels" sub="Production Model Registry & Performance Monitoring">
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>{["Model", "Version", "Domain", "Deployed", "Daily Calls", "Drift", "Action"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {models.map((m) => {
              const dc = driftColor(m.drift);
              return (
                <tr key={m.name} style={s.tr}>
                  <td style={{ ...s.td, fontWeight: 600, color: "#002F5A" }}>{m.name}</td>
                  <td style={{ ...s.td, fontFamily: "monospace", fontSize: 12 }}>{m.version}</td>
                  <td style={s.td}>{m.domain}</td>
                  <td style={{ ...s.td, fontSize: 12, color: "#7A9AB5" }}>{m.deployed}</td>
                  <td style={{ ...s.td, fontFamily: "monospace", color: "#007AB9", fontWeight: 600 }}>{m.calls}</td>
                  <td style={s.td}><span style={{ ...s.tableBadge, background: dc.bg, color: dc.fg }}>{m.drift}</span></td>
                  <td style={s.td}><button style={s.tableBtn}>Inspect</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function SectionWrapper({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={s.sectionCard}>
      <div style={s.sectionHeader}>
        <div>
          <div style={s.sectionTitle}>{title}</div>
          <div style={s.sectionSub}>{sub}</div>
        </div>
        <div style={s.sectionHeaderLine} />
      </div>
      {children}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", height: "100vh", background: "#EBF4FF", fontFamily: "'Rajdhani', 'Segoe UI', sans-serif", overflow: "hidden" },
  body: { display: "flex", flex: 1, overflow: "hidden" },

  // Topbar
  topbar: { height: 52, background: "#002F5A", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid #004080", flexShrink: 0, zIndex: 100 },
  topbarLeft: { display: "flex", alignItems: "center", gap: 12 },
  collapseBtn: { background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 4, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  topbarLogo: { display: "flex", alignItems: "center", gap: 8 },
  topbarLogoLinde: { fontSize: 16, fontWeight: 700, letterSpacing: "0.14em", color: "#fff" },
  topbarLogoDot: { width: 5, height: 5, borderRadius: "50%", background: "#007AB9" },
  topbarLogoLena: { fontSize: 16, fontWeight: 700, letterSpacing: "0.14em", color: "#00A3E0" },
  topbarCenter: { position: "absolute" as const, left: "50%", transform: "translateX(-50%)" },
  topbarTitle: { fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" as const, fontFamily: "'JetBrains Mono', monospace" },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  liveIndicator: { display: "flex", alignItems: "center", gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: "50%", background: "#27AE60" },
  liveText: { fontSize: 10, letterSpacing: "0.14em", color: "#27AE60", fontFamily: "'JetBrains Mono', monospace" },
  activeRoleBadge: { display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px" },
  activeRoleDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  activeRoleLabel: { fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.06em" },
  changeRoleBtn: { fontSize: 10, color: "#8EC8E8", background: "none", border: "none", cursor: "pointer", padding: 0, letterSpacing: "0.04em" },
  userAvatar: { width: 32, height: 32, borderRadius: "50%", background: "#007AB9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" },

  // Sidebar
  sidebar: { background: "#fff", borderRight: "1px solid #D8E6F0", display: "flex", flexDirection: "column" as const, overflow: "hidden", flexShrink: 0 },
  sidebarBrand: { display: "flex", alignItems: "center", gap: 10, padding: "16px 16px 12px", borderBottom: "1px solid #EAF0F6" },
  sidebarBrandIcon: { width: 32, height: 32, borderRadius: 6, background: "#002F5A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 },
  sidebarBrandName: { fontSize: 14, fontWeight: 700, color: "#002F5A", letterSpacing: "0.08em" },
  sidebarBrandSub: { fontSize: 10, color: "#7A9AB5", letterSpacing: "0.08em" },
  sidebarSection: { flex: 1, padding: "12px 0", overflowY: "auto" as const },
  sidebarSectionLabel: { fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", color: "#B0C4D4", textTransform: "uppercase" as const, padding: "0 16px 8px", fontFamily: "'JetBrains Mono', monospace" },
  navItem: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", border: "none", cursor: "pointer", transition: "all 0.15s", textAlign: "left" as const, borderRadius: 0 },
  navIcon: { fontSize: 16, width: 20, textAlign: "center" as const, flexShrink: 0 },
  navText: { display: "flex", flexDirection: "column" as const, gap: 1, flex: 1 },
  navLabel: { fontSize: 13, fontWeight: 600, lineHeight: 1.2 },
  navSub: { fontSize: 10, color: "#9BAEBB", letterSpacing: "0.04em" },
  navActiveDot: { width: 6, height: 6, borderRadius: "50%", background: "#007AB9", flexShrink: 0 },
  sidebarFooter: { padding: "12px 14px", borderTop: "1px solid #EAF0F6" },
  sidebarFooterBtn: { background: "none", border: "1px solid #D8E6F0", borderRadius: 4, padding: "6px 10px", fontSize: 11, color: "#7A9AB5", cursor: "pointer", width: "100%", marginBottom: 6 },
  sidebarVersion: { fontSize: 9, color: "#B0C4D4", textAlign: "center" as const, fontFamily: "'JetBrains Mono', monospace" },

  // Main
  main: { flex: 1, overflowY: "auto" as const, padding: "24px 28px 40px" },
  fullPageMain: { width: "100%", minHeight: "100%", padding: "52px 48px 40px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  backBtn: { background: "#EAF4FB", border: "1px solid #BDD9EE", borderRadius: 6, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "#007AB9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  pageGreeting: { fontSize: 22, fontWeight: 700, color: "#002F5A", margin: 0, letterSpacing: "0.02em" },
  pageFocus: { fontSize: 13, color: "#6B8AA0", marginTop: 4, letterSpacing: "0.02em" },
  pageHeaderMeta: { display: "flex", alignItems: "center", gap: 8 },
  pageDateBadge: { fontSize: 11, color: "#7A9AB5", background: "#EAF0F6", padding: "5px 12px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace" },

  // KPI row
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 },
  kpiCard: { background: "#fff", borderRadius: 8, border: "1px solid #D8E6F0", padding: "16px 18px", position: "relative" as const, overflow: "hidden" },
  kpiCardAccent: { position: "absolute" as const, top: 0, left: 0, right: 0, height: 3, borderRadius: "8px 8px 0 0" },
  kpiLabel: { fontSize: 11, color: "#7A9AB5", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" },
  kpiValue: { fontSize: 24, fontWeight: 700, lineHeight: 1, marginBottom: 6, letterSpacing: "0.02em" },
  kpiDelta: { fontSize: 12, fontWeight: 600 },

  // Mid row
  midRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 },
  panel: { background: "#fff", borderRadius: 8, border: "1px solid #D8E6F0", overflow: "hidden" },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #EAF0F6" },
  panelTitle: { fontSize: 13, fontWeight: 700, color: "#002F5A", letterSpacing: "0.04em" },
  panelCount: { fontSize: 11, fontWeight: 700, background: "#EAF4FB", color: "#005A8C", borderRadius: 999, padding: "2px 10px", fontFamily: "'JetBrains Mono', monospace" },
  panelBody: { padding: "10px 16px 14px" },
  alertRow: { display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: "1px solid #F5F8FA" },
  alertDot: { width: 8, height: 8, borderRadius: "50%", marginTop: 4, flexShrink: 0 },
  alertContent: { display: "flex", alignItems: "flex-start", gap: 8, flex: 1 },
  alertBadge: { fontSize: 9, fontWeight: 700, borderRadius: 3, padding: "2px 6px", letterSpacing: "0.08em", flexShrink: 0, marginTop: 1 },
  alertText: { fontSize: 12, color: "#3D5468", lineHeight: 1.4 },
  actionRow: { display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #F5F8FA" },
  actionIndex: { fontSize: 11, fontWeight: 700, color: "#B0C4D4", fontFamily: "'JetBrains Mono', monospace", width: 20 },
  actionText: { fontSize: 12, color: "#3D5468", flex: 1 },
  actionBtn: { fontSize: 11, color: "#007AB9", background: "#EAF4FB", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" as const },

  // Insight banner
  insightBanner: { background: "#002F5A", borderRadius: 8, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, marginBottom: 20 },
  insightIcon: { fontSize: 24, color: "#00A3E0", flexShrink: 0 },
  insightBody: { flex: 1 },
  insightLabel: { fontSize: 10, color: "#5A9DC0", letterSpacing: "0.12em", textTransform: "uppercase" as const, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 },
  insightText: { fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 },
  insightBtn: { background: "#007AB9", border: "none", borderRadius: 4, padding: "8px 18px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const, letterSpacing: "0.04em" },

  // Module row
  moduleRow: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 24 },
  moduleCard: { background: "#fff", border: "1px solid #D8E6F0", borderRadius: 8, padding: "14px 12px", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, transition: "all 0.15s", textAlign: "center" as const },
  moduleIcon: { fontSize: 20, color: "#007AB9" },
  moduleName: { fontSize: 12, fontWeight: 700, color: "#002F5A", letterSpacing: "0.04em" },
  moduleSub: { fontSize: 10, color: "#9BAEBB" },
  moduleArrow: { fontSize: 12, color: "#007AB9", marginTop: 2 },

  // Section card
  sectionCard: { background: "#fff", borderRadius: 8, border: "1px solid #D8E6F0", padding: "20px 22px" },
  sectionHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#002F5A", letterSpacing: "0.04em" },
  sectionSub: { fontSize: 12, color: "#7A9AB5", marginTop: 2 },
  sectionHeaderLine: { flex: 1, height: 1, background: "#EAF0F6", margin: "10px 0 0 20px" },

  // Vision panel
  vpGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  vpCard: { background: "#F5F8FA", borderRadius: 6, padding: "14px 16px", border: "1px solid #E0EBF4" },
  vpCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  vpPhase: { fontSize: 10, fontWeight: 700, color: "#7A9AB5", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" },
  vpStatus: { fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 7px" },
  vpName: { fontSize: 15, fontWeight: 700, color: "#002F5A", marginBottom: 10 },
  vpBarWrap: { height: 4, background: "#D8E6F0", borderRadius: 999, marginBottom: 6, overflow: "hidden" },
  vpBar: { height: "100%", borderRadius: 999, transition: "width 0.6s ease" },
  vpMeta: { fontSize: 11, color: "#7A9AB5", fontFamily: "'JetBrains Mono', monospace" },

  // NuroVault
  vaultGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 8 },
  vaultStat: { background: "#EAF4FB", borderRadius: 6, padding: "14px", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 },
  vaultStatIcon: { fontSize: 20, color: "#007AB9" },
  vaultStatVal: { fontSize: 20, fontWeight: 700, color: "#002F5A", fontFamily: "'JetBrains Mono', monospace" },
  vaultStatLabel: { fontSize: 10, color: "#7A9AB5", textAlign: "center" as const },
  sourceRow: { display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #F5F8FA" },
  sourceName: { fontSize: 13, fontWeight: 600, color: "#002F5A", flex: 1 },
  sourceRecords: { fontSize: 11, color: "#7A9AB5", fontFamily: "'JetBrains Mono', monospace" },

  // Table shared
  tableWrap: { overflowX: "auto" as const },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { textAlign: "left" as const, padding: "8px 12px", fontSize: 10, fontWeight: 700, color: "#7A9AB5", letterSpacing: "0.1em", textTransform: "uppercase" as const, borderBottom: "1px solid #D8E6F0", background: "#F5F8FA", fontFamily: "'JetBrains Mono', monospace" },
  tr: { borderBottom: "1px solid #F0F4F8" },
  td: { padding: "10px 12px", color: "#3D5468", verticalAlign: "middle" as const },
  tableBadge: { fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "3px 8px", letterSpacing: "0.06em" },
  tableBtn: { fontSize: 11, color: "#007AB9", background: "#EAF4FB", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontWeight: 600 },
  confRow: { display: "flex", alignItems: "center", gap: 8 },
  confBarWrap: { flex: 1, height: 4, background: "#E0EBF4", borderRadius: 999, overflow: "hidden", minWidth: 60 },
  confBar: { height: "100%", background: "#007AB9", borderRadius: 999, transition: "width 0.4s" },
  confVal: { fontSize: 11, color: "#3D5468", fontFamily: "'JetBrains Mono', monospace", minWidth: 30 },
};
