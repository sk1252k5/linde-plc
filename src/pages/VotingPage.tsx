import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, RotateCcw, Rocket, Play, Wifi, AlertTriangle, TrendingUp, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type ScenarioId = "A" | "B" | "C";

interface ScenarioMeta {
  id: ScenarioId;
  customerName: string;
  location: string;
  industry: string;
  tag: string;
  description: string;
  risk: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  avatarBg: string;
  barColor: string;
  Icon: typeof AlertTriangle;
}

const SCENARIOS: ScenarioMeta[] = [
  {
    id: "A",
    customerName: "Helios Steel Works",
    location: "Scunthorpe, North Lincolnshire",
    industry: "Steel Manufacturing",
    tag: "Facility Shutdown",
    description: "Primary production plant offline — nitrogen critically low at 10%.",
    risk: "£29.8K/hr penalty exposure",
    color: "#005591",
    badgeBg: "bg-[#005591]/15",
    badgeText: "text-[#005591]",
    avatarBg: "#005591",
    barColor: "#005591",
    Icon: AlertTriangle,
  },
  {
    id: "B",
    customerName: "BioPharm Solutions",
    location: "Grimsby, Lincolnshire",
    industry: "Pharmaceutical",
    tag: "Demand Spike",
    description: "Unexpected production surge — threshold breached, two sites critical.",
    risk: "£22K/hr penalty · 2 SLAs at risk",
    color: "#009EB4",
    badgeBg: "bg-[#009EB4]/15",
    badgeText: "text-[#009EB4]",
    avatarBg: "#009EB4",
    barColor: "#009EB4",
    Icon: TrendingUp,
  },
  {
    id: "C",
    customerName: "CryoMed Hospital Trust",
    location: "Hull, East Yorkshire",
    industry: "Healthcare",
    tag: "Weather Disruption",
    description: "A63 flooding — Hull route blocked, hospital rerouting required.",
    risk: "Road closed · +26 km detour",
    color: "#E05A2B",
    badgeBg: "bg-[#E05A2B]/15",
    badgeText: "text-[#E05A2B]",
    avatarBg: "#E05A2B",
    barColor: "#E05A2B",
    Icon: Navigation,
  },
];

// Priority-weighted votes: A = 50%, B = 30%, C = 20%
const VOTE_WEIGHTS: Record<ScenarioId, number> = { A: 0.50, B: 0.30, C: 0.20 };
const TOTAL_DEMO_VOTES = 10;

// ─── QR Placeholder ───────────────────────────────────────────────────────────
function QRPlaceholder() {
  const size = 180;
  const cells = 21;
  const cellSize = size / cells;

  const seed = (x: number, y: number) => {
    const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };

  const isFinderCell = (x: number, y: number): boolean => {
    const inSquare = (ox: number, oy: number) =>
      x >= ox && x <= ox + 6 && y >= oy && y <= oy + 6;
    return inSquare(0, 0) || inSquare(14, 0) || inSquare(0, 14);
  };

  const getFinderColor = (x: number, y: number): boolean => {
    const check = (ox: number, oy: number): boolean | null => {
      const rx = x - ox, ry = y - oy;
      if (rx < 0 || rx > 6 || ry < 0 || ry > 6) return null;
      if (rx === 0 || rx === 6 || ry === 0 || ry === 6) return true;
      if (rx >= 2 && rx <= 4 && ry >= 2 && ry <= 4) return true;
      return false;
    };
    return check(0, 0) ?? check(14, 0) ?? check(0, 14) ?? false;
  };

  const rects: JSX.Element[] = [];
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      let filled: boolean;
      if (isFinderCell(col, row)) {
        filled = getFinderColor(col, row);
      } else {
        filled = seed(col, row) > 0.45;
      }
      if (filled) {
        rects.push(
          <rect
            key={`${row}-${col}`}
            x={col * cellSize}
            y={row * cellSize}
            width={cellSize - 0.5}
            height={cellSize - 0.5}
            fill="#005591"
            rx={0.8}
          />
        );
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      {rects}
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VotingPage() {
  const navigate = useNavigate();
  const [votes, setVotes] = useState<Record<ScenarioId, number>>({ A: 0, B: 0, C: 0 });
  const [isVoting, setIsVoting] = useState(false);
  const [votingDone, setVotingDone] = useState(false);
  const [winner, setWinner] = useState<ScenarioId | null>(null);
  const [highlightWinner, setHighlightWinner] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const voteCountRef = useRef(0);

  const totalVotes = votes.A + votes.B + votes.C;

  function getPct(id: ScenarioId) {
    if (totalVotes === 0) return 0;
    return Math.round((votes[id] / totalVotes) * 100);
  }

  function startVoting() {
    if (isVoting || votingDone) return;
    setIsVoting(true);
    voteCountRef.current = 0;

    intervalRef.current = setInterval(() => {
      if (voteCountRef.current >= TOTAL_DEMO_VOTES) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsVoting(false);
        setVotingDone(true);
        setVotes(prev => {
          const w = (Object.keys(prev) as ScenarioId[]).reduce((a, b) =>
            prev[a] >= prev[b] ? a : b
          );
          setWinner(w);
          setTimeout(() => setHighlightWinner(true), 300);
          return prev;
        });
        return;
      }
      const rand = Math.random();
      let chosen: ScenarioId;
      if (rand < VOTE_WEIGHTS.A) chosen = "A";
      else if (rand < VOTE_WEIGHTS.A + VOTE_WEIGHTS.B) chosen = "B";
      else chosen = "C";

      setVotes(prev => ({ ...prev, [chosen]: prev[chosen] + 1 }));
      voteCountRef.current++;
    }, 380);
  }

  function resetVotes() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVotes({ A: 0, B: 0, C: 0 });
    setIsVoting(false);
    setVotingDone(false);
    setWinner(null);
    setHighlightWinner(false);
    voteCountRef.current = 0;
  }

  function launchSupplyChain() {
    const target = winner ?? "A";
    sessionStorage.setItem("lena_scenario", target);
    sessionStorage.setItem("lena_autostart", "true");
    navigate("/supply-chain");
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: "linear-gradient(135deg, #f0f6fb 0%, #e8f4f8 40%, #f5f9fc 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Header ── */}
      <header
        className="w-full flex items-center justify-between px-8 py-4 shadow-sm"
        style={{ background: "#005591" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded flex items-center justify-center font-black text-white text-xl"
              style={{ background: "#009EB4" }}
            >
              L
            </div>
            <span className="text-white font-bold text-lg tracking-wide" style={{ letterSpacing: "0.05em" }}>
              Linde <span className="font-light opacity-80">LENA</span>
            </span>
          </div>
          <div className="h-5 w-px bg-white/30 mx-2" />
          <span className="text-white/70 text-sm font-medium">Supply Chain AI · Live Demo</span>
        </div>
        <div className="flex items-center gap-2 text-white/80 text-xs font-mono">
          <span
            className="h-2 w-2 rounded-full animate-pulse inline-block"
            style={{
              background: votingDone ? "#4ade80" : isVoting ? "#F4A300" : "#ffffff55",
            }}
          />
          {votingDone ? "Voting closed" : isVoting ? "Live voting…" : "Awaiting vote"}
        </div>
      </header>

      {/* ── Title Bar ── */}
      <div className="text-center pt-8 pb-4">
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-1"
          style={{ color: "#009EB4" }}
        >
          Audience Interaction
        </p>
        <h1
          className="text-3xl font-black tracking-tight"
          style={{ color: "#005591" }}
        >
          Choose a Supply Chain Scenario
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6b8fa8" }}>
          The scenario with the most votes will be simulated live by LENA
        </p>
      </div>

      {/* ── Main Grid ── */}
      <div className="flex-1 flex items-start justify-center px-8 pb-6">
        <div
          className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-xl"
          style={{ background: "#ffffff", border: "1px solid #d6e8f2" }}
        >
          <div className="grid grid-cols-2 divide-x divide-[#d6e8f2]">

            {/* ── LEFT: QR Panel ── */}
            <div
              className="flex flex-col items-center justify-center py-10 px-10 gap-5"
              style={{ background: "linear-gradient(160deg, #f0f8fc 0%, #e6f3fa 100%)" }}
            >
              <h2 className="text-2xl font-black tracking-tight" style={{ color: "#005591" }}>
                Scan to Vote
              </h2>

              <div
                className="relative rounded-2xl p-5 shadow-lg"
                style={{ background: "#ffffff", border: "3px solid #009EB4" }}
              >
                {/* Corner accents */}
                {(["tl", "tr", "bl", "br"] as const).map(pos => (
                  <div
                    key={pos}
                    className="absolute h-5 w-5"
                    style={{
                      top: pos.includes("t") ? 0 : "auto",
                      bottom: pos.includes("b") ? 0 : "auto",
                      left: pos.includes("l") ? 0 : "auto",
                      right: pos.includes("r") ? 0 : "auto",
                      borderTop: pos.includes("t") ? "4px solid #005591" : "none",
                      borderBottom: pos.includes("b") ? "4px solid #005591" : "none",
                      borderLeft: pos.includes("l") ? "4px solid #005591" : "none",
                      borderRight: pos.includes("r") ? "4px solid #005591" : "none",
                    }}
                  />
                ))}
                <QRPlaceholder />
              </div>

              <div className="flex flex-col items-center gap-1 w-full">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8aabbf" }}>
                  Voting URL
                </span>
                <div
                  className="rounded-lg px-4 py-2 text-sm font-mono font-medium w-full text-center"
                  style={{ background: "#eaf4fb", color: "#005591", border: "1px solid #c8dfe9" }}
                >
                  https://linde-vote.demo/session-2026
                </div>
              </div>

              <div
                className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
                style={{
                  background: isVoting ? "#FFF3CD" : votingDone ? "#d1fae5" : "#e8f4fb",
                  color: isVoting ? "#B45309" : votingDone ? "#065f46" : "#005591",
                }}
              >
                <Wifi className="h-3 w-3" />
                {votingDone
                  ? `Voting closed · ${totalVotes} votes cast`
                  : isVoting
                  ? `Receiving votes · ${totalVotes} so far…`
                  : "Ready to receive votes"}
              </div>

              {/* Scenario legend */}
              <div className="w-full space-y-2 pt-2 border-t border-[#d6e8f2]">
                {SCENARIOS.map(s => (
                  <div key={s.id} className="flex items-start gap-2">
                    <div
                      className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5"
                      style={{ background: s.avatarBg }}
                    >
                      {s.id}
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "#003d5c" }}>{s.customerName}</p>
                      <p className="text-[10px]" style={{ color: "#8aabbf" }}>{s.tag} · {s.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Live Results ── */}
            <div className="flex flex-col py-8 px-8 gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight" style={{ color: "#005591" }}>
                  Live Voting Results
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: "#8aabbf" }}>Total Votes</span>
                  <span className="text-2xl font-black font-mono tabular-nums" style={{ color: "#005591" }}>
                    {totalVotes}
                  </span>
                </div>
              </div>

              {/* Scenario cards */}
              <div className="flex flex-col gap-3">
                {SCENARIOS.map(s => {
                  const pct = getPct(s.id);
                  const isWinner = highlightWinner && winner === s.id;
                  const v = votes[s.id];

                  return (
                    <div
                      key={s.id}
                      className="rounded-xl p-4 transition-all duration-500"
                      style={{
                        border: `2px solid ${isWinner ? s.color : "#d6e8f2"}`,
                        background: isWinner ? `${s.color}08` : "#fafcfe",
                        boxShadow: isWinner ? `0 0 0 3px ${s.color}22` : "none",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className="h-11 w-11 rounded-full flex items-center justify-center font-black text-lg text-white shrink-0"
                          style={{ background: s.avatarBg }}
                        >
                          {s.id}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="font-bold text-sm truncate" style={{ color: "#003d5c" }}>
                                {s.customerName}
                              </p>
                              {isWinner && (
                                <span
                                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 animate-pulse"
                                  style={{ background: s.color, color: "#fff" }}
                                >
                                  Winner
                                </span>
                              )}
                            </div>
                            <span className="font-black text-2xl font-mono tabular-nums shrink-0" style={{ color: s.color }}>
                              {v}
                            </span>
                          </div>

                          <p className="text-[11px] mb-0.5 truncate" style={{ color: "#7a9eb5" }}>
                            {s.location}
                          </p>

                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <s.Icon className="h-3 w-3" style={{ color: s.color }} />
                              <span
                                className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", s.badgeBg, s.badgeText)}
                              >
                                {s.tag}
                              </span>
                            </div>
                            <span className="text-xs font-bold font-mono" style={{ color: s.color }}>
                              {pct}%
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#e8f2f8" }}>
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${pct}%`,
                                background: `linear-gradient(90deg, ${s.color}cc, ${s.color})`,
                                minWidth: pct > 0 ? "8px" : "0",
                              }}
                            />
                          </div>

                          <p className="text-[10px] mt-1.5 font-semibold" style={{ color: "#c0392b" }}>
                            {s.risk}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Winner announcement */}
              {highlightWinner && winner && (() => {
                const ws = SCENARIOS.find(s => s.id === winner)!;
                return (
                  <div
                    className="rounded-xl p-3 flex items-center gap-3"
                    style={{
                      background: `${ws.color}12`,
                      border: `1px solid ${ws.color}50`,
                    }}
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: ws.color }} />
                    <div>
                      <p className="text-xs font-bold" style={{ color: "#003d5c" }}>
                        Scenario {winner} selected — {ws.customerName}
                      </p>
                      <p className="text-[11px]" style={{ color: "#7a9eb5" }}>
                        Click "Launch Supply Chain" to start LENA simulation
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ── Footer Buttons ── */}
          <div
            className="flex items-center gap-3 px-8 py-5"
            style={{ background: "#f8fbfd", borderTop: "1px solid #d6e8f2" }}
          >
            {/* Start Voting */}
            <button
              onClick={startVoting}
              disabled={isVoting || votingDone}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                background: isVoting || votingDone ? "#cde8c8" : "#22c55e",
                color: "#ffffff",
                boxShadow: isVoting || votingDone ? "none" : "0 4px 14px #22c55e55",
              }}
            >
              <Play className="h-4 w-4" />
              {isVoting ? "Voting in Progress…" : votingDone ? "Voting Complete" : "Start Voting"}
            </button>

            {/* Reset */}
            <button
              onClick={resetVotes}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm transition-all duration-200 active:scale-[0.98] hover:opacity-90"
              style={{
                background: "#005591",
                color: "#ffffff",
                boxShadow: "0 4px 14px #00559144",
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset Votes
            </button>

            {/* Launch */}
            <button
              onClick={launchSupplyChain}
              disabled={!votingDone}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed"
              style={{
                background: votingDone
                  ? "linear-gradient(135deg, #005591, #009EB4)"
                  : "linear-gradient(135deg, #90b8cf88, #a0d0db88)",
                color: "#ffffff",
                boxShadow: votingDone ? "0 4px 14px #00559155" : "none",
                opacity: votingDone ? 1 : 0.6,
              }}
            >
              <Rocket className="h-4 w-4" />
              Launch Supply Chain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
