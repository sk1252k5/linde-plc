import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, RotateCcw, Rocket, Wifi,
  AlertTriangle, TrendingUp, Navigation, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "lena_votes";
const VOTE_URL = `${window.location.origin}/vote`;

type ScenarioId = "A" | "B" | "C";

interface VoteState {
  A: number;
  B: number;
  C: number;
  closed: boolean;
}

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
    color: "var(--primary)",
    badgeBg: "bg-[color:var(--primary)]/15",
    badgeText: "text-[color:var(--primary)]",
    avatarBg: "var(--primary)",
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
    color: "var(--accent)",
    badgeBg: "bg-[color:var(--accent)]/15",
    badgeText: "text-[color:var(--accent)]",
    avatarBg: "var(--accent)",
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
    color: "var(--destructive)",
    badgeBg: "bg-[color:var(--destructive)]/15",
    badgeText: "text-[color:var(--destructive)]",
    avatarBg: "var(--destructive)",
    Icon: Navigation,
  },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
function readVotes(): VoteState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as VoteState;
  } catch {}
  return { A: 0, B: 0, C: 0, closed: false };
}

function writeVotes(state: VoteState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetVotesStorage() {
  writeVotes({ A: 0, B: 0, C: 0, closed: false });
}

// ─── Real QR Code Generator ───────────────────────────────────────────────────
function useQRCanvas(url: string, size: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    try {
      drawQR(ctx, url, size);
    } catch {
      ctx.fillStyle = "#005591";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${size / 8}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("QR", size / 2, size / 2);
    }
  }, [url, size]);

  return canvasRef;
}

function drawQR(ctx: CanvasRenderingContext2D, text: string, size: number) {
  const matrix = generateQRMatrix(text);
  if (!matrix) throw new Error("QR generation failed");

  const cells = matrix.length;
  const cellSize = size / cells;

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#005591";
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (matrix[r][c]) {
        const x = c * cellSize;
        const y = r * cellSize;
        const radius = cellSize * 0.15;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + cellSize - radius, y);
        ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + radius);
        ctx.lineTo(x + cellSize, y + cellSize - radius);
        ctx.quadraticCurveTo(x + cellSize, y + cellSize, x + cellSize - radius, y + cellSize);
        ctx.lineTo(x + radius, y + cellSize);
        ctx.quadraticCurveTo(x, y + cellSize, x, y + cellSize - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

function generateQRMatrix(text: string): boolean[][] | null {
  try {
    return buildQR(text);
  } catch {
    return null;
  }
}

function buildQR(data: string): boolean[][] {
  const SIZE = 25;

  const bytes = new TextEncoder().encode(data);
  const dataLen = bytes.length;

  let bits: number[] = [];
  const pushBits = (val: number, n: number) => {
    for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };

  pushBits(0b0100, 4);
  pushBits(dataLen, 8);
  for (const b of bytes) pushBits(b, 8);

  for (let i = 0; i < 4 && bits.length < 128; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const DATA_CODEWORDS = 28;
  const pads = [0b11101100, 0b00010001];
  let pi = 0;
  while (bits.length < DATA_CODEWORDS * 8) {
    pushBits(pads[pi++ % 2], 8);
  }

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | (bits[i + j] || 0);
    codewords.push(v);
  }

  const ECC_CODEWORDS = 16;
  const ecc = reedSolomon(codewords.slice(0, DATA_CODEWORDS), ECC_CODEWORDS);
  const allCodewords = [...codewords.slice(0, DATA_CODEWORDS), ...ecc];

  const mod: number[][] = Array.from({ length: SIZE }, () => new Array(SIZE).fill(-1));

  const finder = (r: number, c: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const row = r + dr, col = c + dc;
        if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) continue;
        const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        if (dr === -1 || dc === -1 || dr === 7 || dc === 7) {
          mod[row][col] = 0;
        } else {
          mod[row][col] = (onBorder || inInner) ? 1 : 0;
        }
      }
    }
  };
  finder(0, 0);
  finder(0, SIZE - 7);
  finder(SIZE - 7, 0);

  for (let i = 8; i < SIZE - 8; i++) {
    mod[6][i] = mod[i][6] = i % 2 === 0 ? 1 : 0;
  }

  mod[4 * 2 + 9][8] = 1;

  const FORMAT_POSITIONS: [number, number][] = [
    [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],
    [7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],
    [SIZE-1,8],[SIZE-2,8],[SIZE-3,8],[SIZE-4,8],[SIZE-5,8],[SIZE-6,8],[SIZE-7,8],
    [8,SIZE-8],[8,SIZE-7],[8,SIZE-6],[8,SIZE-5],[8,SIZE-4],[8,SIZE-3],[8,SIZE-2],[8,SIZE-1],
  ];
  for (const [r,c] of FORMAT_POSITIONS) {
    if (mod[r]?.[c] === -1) mod[r][c] = 0;
  }

  const dataBits: number[] = [];
  for (const cw of allCodewords) pushBitsArr(dataBits, cw, 8);

  function pushBitsArr(arr: number[], val: number, n: number) {
    for (let i = n - 1; i >= 0; i--) arr.push((val >> i) & 1);
  }

  let bitIdx = 0;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < SIZE; vert++) {
      const row = (Math.floor((SIZE - 1 - right) / 2) % 2 === 0)
        ? SIZE - 1 - vert
        : vert;
      for (let delta = 0; delta <= 1; delta++) {
        const col = right - delta;
        if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) continue;
        if (mod[row][col] === -1) {
          const bit = bitIdx < dataBits.length ? dataBits[bitIdx++] : 0;
          mod[row][col] = ((row + col) % 2 === 0) ? (bit ^ 1) : bit;
        }
      }
    }
  }

  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (mod[r][c] === -1) mod[r][c] = 0;

  const FMT = [1,0,1,0,1,0,0,0,0,0,1,0,0,1,0];
  const fmtPos1: [number,number][] = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
  const fmtPos2: [number,number][] = [[SIZE-1,8],[SIZE-2,8],[SIZE-3,8],[SIZE-4,8],[SIZE-5,8],[SIZE-6,8],[SIZE-7,8],[8,SIZE-8],[8,SIZE-7],[8,SIZE-6],[8,SIZE-5],[8,SIZE-4],[8,SIZE-3],[8,SIZE-2],[8,SIZE-1]];
  for (let i = 0; i < 15; i++) {
    const [r1,c1] = fmtPos1[i];
    const [r2,c2] = fmtPos2[i];
    if (r1 < SIZE && c1 < SIZE) mod[r1][c1] = FMT[i];
    if (r2 < SIZE && c2 < SIZE) mod[r2][c2] = FMT[i];
  }

  return mod.map(row => row.map(v => v === 1));
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  const EXP = new Array(512);
  const LOG = new Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  return EXP[(LOG[a] + LOG[b]) % 255];
}

function reedSolomon(data: number[], eccCount: number): number[] {
  const GEN = [1];
  const EXP: number[] = new Array(512);
  const LOG: number[] = new Array(256);
  let v = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = v; LOG[v] = i;
    v <<= 1; if (v & 256) v ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];

  for (let i = 0; i < eccCount; i++) {
    const factor = [1, EXP[i]];
    const result = new Array(GEN.length + factor.length - 1).fill(0);
    for (let j = 0; j < GEN.length; j++)
      for (let k = 0; k < factor.length; k++)
        result[j + k] ^= gfMul(GEN[j], factor[k]);
    GEN.splice(0, GEN.length, ...result);
  }

  const msg = [...data, ...new Array(eccCount).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 1; j < GEN.length; j++) {
        msg[i + j] ^= gfMul(GEN[j], coef);
      }
    }
  }
  return msg.slice(data.length);
}

// ─── QR Canvas Component ──────────────────────────────────────────────────────
function QRCodeCanvas({ url, size = 200 }: { url: string; size?: number }) {
  const canvasRef = useQRCanvas(url, size);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: "pixelated" }}
      className="block"
    />
  );
}

// ─── Main VotingPage ──────────────────────────────────────────────────────────
export default function VotingPage() {
  const navigate = useNavigate();
  const [votes, setVotes] = useState<VoteState>(readVotes);
  const [winner, setWinner] = useState<ScenarioId | null>(null);
  const [highlightWinner, setHighlightWinner] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalVotes = votes.A + votes.B + votes.C;
  const isClosed = votes.closed;
  const isActive = !isClosed;

  const syncVotes = useCallback(() => {
    const fresh = readVotes();
    setVotes(fresh);
    if (fresh.closed) {
      const w = (["A", "B", "C"] as ScenarioId[]).reduce((a, b) =>
        fresh[a] >= fresh[b] ? a : b
      );
      setWinner(w);
      setTimeout(() => setHighlightWinner(true), 300);
    }
  }, []);

  useEffect(() => {
    syncVotes();

    try {
      const ch = new BroadcastChannel("lena_votes");
      ch.onmessage = () => syncVotes();
      channelRef.current = ch;
    } catch {}

    pollRef.current = setInterval(syncVotes, 800);

    return () => {
      channelRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [syncVotes]);

  function closeVoting() {
    const current = readVotes();
    const updated = { ...current, closed: true };
    writeVotes(updated);
    channelRef.current?.postMessage("update");
    syncVotes();
  }

  function handleReset() {
    resetVotesStorage();
    setWinner(null);
    setHighlightWinner(false);
    channelRef.current?.postMessage("update");
    syncVotes();
  }

  function handleLaunch() {
    const target = winner ?? "A";
    sessionStorage.setItem("lena_scenario", target);
    sessionStorage.setItem("lena_autostart", "true");
    navigate("/supply-chain");
  }

  function getPct(id: ScenarioId) {
    if (totalVotes === 0) return 0;
    return Math.round((votes[id] / totalVotes) * 100);
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: "var(--background)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Header ── */}
      <header
        className="w-full flex items-center justify-between px-8 py-4 shadow-sm"
        style={{ background: "var(--sidebar)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* <div
              className="h-8 w-8 rounded flex items-center justify-center font-black text-xl"
              style={{ background: "var(--accent)", color: "var(--primary-foreground)" }}
            >
              L
            </div> */}
            <span
              className="font-bold text-lg tracking-wide"
              style={{ color: "var(--sidebar-foreground)", letterSpacing: "0.05em" }}
            >
              {/* <span className="font-light opacity-70">LENA</span> */}
            </span>
          </div>
          <div className="h-5 w-px mx-2" style={{ background: "var(--sidebar-border)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--sidebar-foreground)", opacity: 0.6 }}>
            Supply Chain AI · Live
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "var(--sidebar-foreground)", opacity: 0.7 }}>
          <span
            className="h-2 w-2 rounded-full animate-pulse inline-block"
            style={{
              background: isClosed ? "var(--chart-2)" : isActive ? "var(--chart-3)" : "var(--muted-foreground)",
            }}
          />
          {/* {isClosed ? `Voting closed · ${totalVotes} votes cast` : `Live voting… ${totalVotes} cast`} */}
        </div>
      </header>

      {/* ── Title Bar ── */}
      <div className="text-center pt-8 pb-4">
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-1"
          style={{ color: "var(--accent)" }}
        >
          Audience Interaction
        </p>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--primary)" }}>
          Choose a Supply Chain Scenario
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Scan the QR code to vote · The winning scenario will be simulated live by LENA
        </p>
      </div>

      {/* ── Main Grid ── */}
      <div className="flex-1 flex items-start justify-center px-8 pb-6">
        <div
          className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-xl"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="grid grid-cols-2" style={{ borderBottom: "1px solid var(--border)" }}>

            {/* ── LEFT: QR Panel ── */}
            <div
              className="flex flex-col items-center justify-center py-10 px-10 gap-5"
              style={{
                background: "var(--muted)",
                borderRight: "1px solid var(--border)",
              }}
            >
              <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--primary)" }}>
                Scan to Vote
              </h2>

              <div
                className="relative rounded-2xl p-5 shadow-lg"
                style={{ background: "var(--card)", border: "3px solid var(--accent)" }}
              >
                {(["tl", "tr", "bl", "br"] as const).map(pos => (
                  <div
                    key={pos}
                    className="absolute h-5 w-5"
                    style={{
                      top: pos.includes("t") ? 0 : "auto",
                      bottom: pos.includes("b") ? 0 : "auto",
                      left: pos.includes("l") ? 0 : "auto",
                      right: pos.includes("r") ? 0 : "auto",
                      borderTop: pos.includes("t") ? "4px solid var(--primary)" : "none",
                      borderBottom: pos.includes("b") ? "4px solid var(--primary)" : "none",
                      borderLeft: pos.includes("l") ? "4px solid var(--primary)" : "none",
                      borderRight: pos.includes("r") ? "4px solid var(--primary)" : "none",
                    }}
                  />
                ))}
                <QRCodeCanvas url={VOTE_URL} size={180} />
              </div>

              <div className="flex flex-col items-center gap-1 w-full">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Voting URL
                </span>
                <div
                  className="rounded-lg px-4 py-2 text-sm font-mono font-medium w-full text-center break-all"
                  style={{
                    background: "var(--popover)",
                    color: "var(--primary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {VOTE_URL}
                </div>
              </div>

              <div
                className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
                style={{
                  background: isClosed ? "color-mix(in srgb, var(--chart-2) 15%, transparent)" : "color-mix(in srgb, var(--chart-3) 15%, transparent)",
                  color: isClosed ? "var(--chart-2)" : "var(--chart-3)",
                }}
              >
                <Wifi className="h-3 w-3" />
                {isClosed
                  ? `Voting closed · ${totalVotes} votes cast`
                  : `Receiving votes · ${totalVotes} cast`}
              </div>

              {/* Vote count display */}
              <div className="w-full">
                <div
                  className="flex justify-between text-[10px] font-semibold mb-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> Votes Cast
                  </span>
                  <span className="font-mono tabular-nums">{totalVotes}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: totalVotes > 0 ? "100%" : "0%",
                      background: isClosed ? "var(--chart-2)" : "var(--accent)",
                      opacity: isClosed ? 1 : 0.7,
                    }}
                  />
                </div>
              </div>

              {/* Scenario legend */}
              <div
                className="w-full space-y-2 pt-2"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                {SCENARIOS.map(s => (
                  <div key={s.id} className="flex items-start gap-2">
                    <div
                      className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5"
                      style={{
                        background: s.avatarBg,
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {s.id}
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                        {s.customerName}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        {s.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Live Results ── */}
            <div className="flex flex-col py-8 px-8 gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--primary)" }}>
                  Live Voting Results
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    Total
                  </span>
                  <span
                    className="text-2xl font-black font-mono tabular-nums"
                    style={{ color: "var(--primary)" }}
                  >
                    {totalVotes}
                  </span>
                </div>
              </div>

              {/* Scenario result cards */}
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
                        border: `2px solid ${isWinner ? s.color : "var(--border)"}`,
                        background: isWinner
                          ? `color-mix(in srgb, ${s.color} 6%, var(--card))`
                          : "var(--card)",
                        boxShadow: isWinner ? `0 0 0 3px color-mix(in srgb, ${s.color} 20%, transparent)` : "none",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-11 w-11 rounded-full flex items-center justify-center font-black text-lg shrink-0"
                          style={{
                            background: s.avatarBg,
                            color: "var(--primary-foreground)",
                          }}
                        >
                          {s.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <p
                                className="font-bold text-sm truncate"
                                style={{ color: "var(--foreground)" }}
                              >
                                {s.customerName}
                              </p>
                              {isWinner && (
                                <span
                                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 animate-pulse"
                                  style={{
                                    background: s.color,
                                    color: "var(--primary-foreground)",
                                  }}
                                >
                                  Winner
                                </span>
                              )}
                            </div>
                            <span
                              className="font-black text-2xl font-mono tabular-nums shrink-0"
                              style={{ color: s.color }}
                            >
                              {v}
                            </span>
                          </div>
                          <p className="text-[11px] mb-2" style={{ color: "var(--muted-foreground)" }}>
                            {s.location}
                          </p>
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className="text-xs font-bold font-mono"
                              style={{ color: s.color }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div
                            className="h-2.5 rounded-full overflow-hidden"
                            style={{ background: "var(--muted)" }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${pct}%`,
                                background: s.color,
                                minWidth: pct > 0 ? "8px" : "0",
                              }}
                            />
                          </div>
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
                      background: `color-mix(in srgb, ${ws.color} 10%, var(--card))`,
                      border: `1px solid color-mix(in srgb, ${ws.color} 40%, transparent)`,
                    }}
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: ws.color }} />
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                        Scenario {winner} selected — {ws.customerName}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
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
            style={{
              background: "var(--muted)",
              borderTop: "1px solid var(--border)",
            }}
          >
            {/* Close Voting */}
            <button
              onClick={closeVoting}
              disabled={isClosed || totalVotes === 0}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                background: isClosed
                  ? "color-mix(in srgb, var(--chart-2) 30%, var(--card))"
                  : "var(--chart-2)",
                color: isClosed ? "var(--foreground)" : "#ffffff",
                boxShadow: isClosed ? "none" : "0 4px 14px color-mix(in srgb, var(--chart-2) 40%, transparent)",
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isClosed ? "Voting Closed" : "Close Voting"}
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm transition-all duration-200 active:scale-[0.98] hover:opacity-90"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                boxShadow: "0 4px 14px color-mix(in srgb, var(--primary) 30%, transparent)",
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset Votes
            </button>

            {/* Launch */}
            <button
              onClick={handleLaunch}
              disabled={!isClosed}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed"
              style={{
                background: isClosed
                  ? "linear-gradient(135deg, var(--primary), var(--accent))"
                  : "var(--muted)",
                color: isClosed ? "var(--primary-foreground)" : "var(--muted-foreground)",
                boxShadow: isClosed
                  ? "0 4px 14px color-mix(in srgb, var(--primary) 35%, transparent)"
                  : "none",
                opacity: isClosed ? 1 : 0.6,
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
