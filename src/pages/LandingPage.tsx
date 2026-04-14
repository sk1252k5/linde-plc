import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Linde Official Brand Colors ───────────────────────────────────────────
// Primary: #005591 (Linde Blue)
// Accent:  #007AB9 (Linde Blue)
// White:   #FFFFFF
// Light theme: clean professional Linde palette

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [launched, setLaunched] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const taglines = ["LENA Connects.", "LENA Thinks.", "LENA Grows."];

  // Stagger entry
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Cycle taglines
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % taglines.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Canvas: animated particle network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const particles: {
      x: number; y: number; vx: number; vy: number;
      r: number; opacity: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Spawn particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 163, 224, ${(1 - dist / 130) * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 163, 224, ${p.opacity})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleLaunch = () => {
    setLaunched(true);
    setTimeout(() => navigate("/home"), 800);
  };

  return (
    <div style={styles.root}>
      {/* ── Canvas particle network ── */}
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* ── Grid overlay ── */}
      <div style={styles.grid} />

      {/* ── Left edge accent bar ── */}
      <div style={styles.leftBar} />

      {/* ── Top accent line ── */}
      <div style={styles.topLine} />

      {/* ── Corner brackets ── */}
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      {/* ── Scan line ── */}
      <div style={styles.scanLine} />

      {/* ── Radial glow behind logo ── */}
      <div style={styles.glowOrb} />

      {/* ── Main content ── */}
      <main
        style={{
          ...styles.main,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.9s ease, transform 0.9s ease",
        }}
      >
        {/* Status pill */}
        <div style={styles.statusPill}>
          <span style={styles.statusDot} />
          <span style={styles.statusText}>ALL SYSTEMS OPERATIONAL · EOS v2.0</span>
        </div>

        {/* Linde wordmark */}
        <div style={styles.lindeWordmark}>
          <LindeLogoSVG />
        </div>

        {/* LENA wordmark */}
        <h1 style={styles.lenaWordmark}>LENA</h1>

        {/* Full name */}
        <p style={styles.fullName}>
          Linde&rsquo;s Enterprise Neural Agent
        </p>

        {/* Animated taglines */}
        <div style={styles.taglineWrap}>
          {taglines.map((t, i) => (
            <span
              key={t}
              style={{
                ...styles.taglineItem,
                color: i === taglineIndex ? "#007AB9" : "rgba(0,47,90,0.35)",
                transform: i === taglineIndex ? "scale(1)" : "scale(0.96)",
                transition: "color 0.5s ease, transform 0.5s ease",
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Tagline description */}
        <p style={styles.description}>
          Orchestrating{" "}
          <strong style={styles.highlight}>47+ autonomous agents</strong> across{" "}
          <strong style={styles.highlight}>600+ facilities</strong> and an{" "}
          <strong style={styles.highlight}>8,000-vehicle fleet</strong> —
          <br />
          real-time decisions, enterprise-grade control.
        </p>

        {/* CTA button */}
        <button
          style={{
            ...styles.ctaBtn,
            background: launched
              ? "#007AB9"
              : "linear-gradient(135deg, #005AB9 0%, #007AB9 100%)",
            transform: launched ? "scale(0.97)" : "scale(1)",
          }}
          onClick={handleLaunch}
          onMouseEnter={(e) => {
            if (!launched)
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 40px rgba(0,122,185,0.45), 0 8px 32px rgba(0,47,90,0.35)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 4px 24px rgba(0,85,145,0.35)";
          }}
        >
          {launched ? "✓  Initialising..." : "Initialise Platform"}
          {!launched && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ marginLeft: 10 }}
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Stats row */}
        <div style={styles.statsRow}>
          {[
            { val: "1,200+", label: "Decisions / hr" },
            { val: "47", label: "Active Agents" },
            { val: "99.4%", label: "System Uptime" },
            { val: "600+", label: "Facilities" },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <div style={styles.statItem}>
                <span style={styles.statVal}>{s.val}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div style={styles.statDivider} />}
            </div>
          ))}
        </div>
      </main>

      {/* ── Bottom classification bar ── */}
      <footer style={styles.footer}>
        <span>LINDE EOS · LENA v2.0</span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <span>CLASSIFICATION: INTERNAL</span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <span>AUTHORISED ACCESS ONLY</span>
      </footer>
    </div>
  );
}

// ─── Corner Bracket Component ───────────────────────────────────────────────
function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const size = 52;
  const thickness = 1.5;
  const color = "rgba(0, 163, 224, 0.35)";
  const base: React.CSSProperties = {
    position: "fixed",
    width: size,
    height: size,
    pointerEvents: "none",
    zIndex: 5,
  };
  const positions: Record<string, React.CSSProperties> = {
    tl: { top: 20, left: 20, borderTop: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` },
    tr: { top: 20, right: 20, borderTop: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` },
    bl: { bottom: 20, left: 20, borderBottom: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` },
    br: { bottom: 20, right: 20, borderBottom: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` },
  };
  return <div style={{ ...base, ...positions[pos] }} />;
}

// ─── Linde Logo SVG ─────────────────────────────────────────────────────────
function LindeLogoSVG() {
  return (
    <svg width="120" height="36" viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stylised "Linde" text-style wordmark bars */}
      <rect x="0" y="0" width="6" height="36" rx="1" fill="#005591" />
      <rect x="0" y="30" width="36" height="6" rx="1" fill="#005591" />
      <rect x="14" y="0" width="6" height="24" rx="1" fill="#007AB9" />
      <rect x="28" y="0" width="6" height="36" rx="1" fill="#005591" />
      {/* "LINDE" label */}
      <text x="46" y="24" fontFamily="'Rajdhani', sans-serif" fontWeight="700" fontSize="22" fill="#FFFFFF" letterSpacing="4">LINDE</text>
    </svg>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "fixed",
    inset: 0,
    background: "#f8fbff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    fontFamily: "'Rajdhani', sans-serif",
    color: "#002f5a",
  },
  canvas: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
  },
  grid: {
    position: "fixed",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
    backgroundImage: `
      linear-gradient(rgba(0,122,185,0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,122,185,0.08) 1px, transparent 1px)
    `,
    backgroundSize: "52px 52px",
  },
  leftBar: {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    background: "linear-gradient(180deg, transparent 0%, #007AB9 30%, rgba(0,122,185,0.8) 60%, transparent 100%)",
    zIndex: 5,
    opacity: 0.75,
  },
  topLine: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: "linear-gradient(90deg, transparent 0%, #007AB9 20%, rgba(0,122,185,0.85) 50%, #007AB9 80%, transparent 100%)",
    zIndex: 5,
    opacity: 0.85,
  },
  scanLine: {
    position: "fixed",
    left: 0,
    right: 0,
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(0,122,185,0.25), transparent)",
    pointerEvents: "none",
    zIndex: 3,
    animation: "scanAnim 9s linear infinite",
  },
  glowOrb: {
    position: "fixed",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,122,185,0.14) 0%, rgba(0,122,185,0.08) 40%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -58%)",
    pointerEvents: "none",
    zIndex: 1,
    animation: "glowPulse 5s ease-in-out infinite",
  },
  main: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "0 24px",
    gap: 0,
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(0,122,185,0.08)",
    border: "1px solid rgba(0,122,185,0.18)",
    borderRadius: 999,
    padding: "6px 18px",
    marginBottom: 28,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.14em",
    color: "#007AB9",
    textTransform: "uppercase" as const,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#007AB9",
    display: "inline-block",
    animation: "dotPulse 2s ease-in-out infinite",
  },
  statusText: {
    letterSpacing: "0.12em",
  },
  lindeWordmark: {
    marginBottom: 20,
    opacity: 0.9,
  },
  lenaWordmark: {
    fontSize: "clamp(80px, 13vw, 116px)",
    fontWeight: 700,
    letterSpacing: "0.22em",
    lineHeight: 1,
    margin: "0 0 6px",
    color: "transparent",
    background: "linear-gradient(135deg, #d7e9fb 0%, #94c4e8 35%, #007AB9 65%, #eaf4fd 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
  },
  fullName: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.28em",
    color: "rgba(0,47,90,0.45)",
    textTransform: "uppercase" as const,
    marginBottom: 32,
  },
  taglineWrap: {
    display: "flex",
    gap: 32,
    alignItems: "center",
    marginBottom: 28,
    flexWrap: "wrap" as const,
    justifyContent: "center",
  },
  taglineItem: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: "0.06em",
    fontFamily: "'Rajdhani', sans-serif",
    transition: "color 0.5s ease, transform 0.5s ease",
    display: "inline-block",
  },
  divider: {
    width: 180,
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(0,122,185,0.35), transparent)",
    margin: "0 auto 24px",
  },
  description: {
    fontSize: 15,
    fontWeight: 400,
    color: "rgba(0,47,90,0.78)",
    letterSpacing: "0.03em",
    lineHeight: 1.7,
    maxWidth: 460,
    marginBottom: 40,
    fontFamily: "'Rajdhani', sans-serif",
  },
  highlight: {
    color: "#007AB9",
    fontWeight: 700,
  },
  ctaBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px 52px",
    borderRadius: 3,
    border: "none",
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 12px 32px rgba(0,122,185,0.18)",
    transition: "box-shadow 0.2s ease, transform 0.15s ease, background 0.3s ease",
    marginBottom: 48,
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    flexWrap: "wrap" as const,
    justifyContent: "center",
  },
  statItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 4,
  },
  statVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 20,
    fontWeight: 500,
    color: "#007AB9",
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "rgba(0,47,90,0.45)",
    fontFamily: "'JetBrains Mono', monospace",
  },
  statDivider: {
    width: 1,
    height: 32,
    background: "rgba(0,47,90,0.12)",
    margin: "0 28px",
  },
  footer: {
    position: "fixed",
    bottom: 18,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: 16,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    letterSpacing: "0.12em",
    color: "rgba(0,47,90,0.3)",
    textTransform: "uppercase" as const,
    whiteSpace: "nowrap" as const,
  },
};
