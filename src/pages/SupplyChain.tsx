import { useState, useEffect, useRef } from "react";
import USER_NAME from "@/data/data";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Truck, GitBranch, TrendingUp, Radio,
  AlertTriangle, FileText, Users, CheckCircle2, Clock,
  Thermometer, Zap, ArrowRight, ChevronRight, MapPin,
  AlertCircle, BarChart3, Navigation, Package, Brain,
  Shield, CreditCard, Activity, Wifi, Database,
  RotateCcw,
} from "lucide-react";

type ScenarioId = "A" | "B" | "C";
type View = "dashboard" | "voting" | "agent-working" | "simulation" | "decision";

interface Customer {
  id: string; name: string; industry: string; location: string;
  gas: string; tankCapacity: number; currentLevel: number;
  dailyUsage: number; threshold: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  hoursToEmpty: number; distanceFromDepot: number;
  deliveryRequired: number;
  annualRevenue: number; // £M annual
  contractValue: number; // £M contract value
  creditRating: "AAA" | "AA" | "A" | "BBB";
  paymentDays: number; // average payment days
  contractType: "Take-or-Pay" | "Spot" | "Long-Term";
  penaltyPerHour: number; // £k penalty if SLA missed
  lastDelivery: string;
}

interface Scenario {
  id: ScenarioId; label: string; description: string;
  customers: Customer[]; truckCapacity: number;
  depotLocation: string; truckId: string;
  routeOptions: RouteOption[]; lenadecision: string;
}

interface RouteOption {
  id: string; label: string; stops: string[];
  totalKm: number; totalTime: number; fuelCost: number;
  co2kg: number; onTimeRisk: "LOW" | "MEDIUM" | "HIGH";
  recommended?: boolean;
}

// ─── Agent step type ──────────────────────────────────────────────────────────
interface AgentStep {
  agentName: string;
  icon: typeof Brain;
  color: string;
  action: string;
  detail: string;
  dataPoints: { label: string; value: string }[];
  durationMs: number;
}

// ─── Scenario Data ────────────────────────────────────────────────────────────
const SCENARIOS: Record<ScenarioId, Scenario> = {
  A: {
    id: "A", label: "Facility Shutdown — Helios Steel",
    description: "Primary production plant offline. Nitrogen supply critically low.",
    depotLocation: "Linde Depot, Scunthorpe", truckId: "LIN-T4821",
    truckCapacity: 100,
    customers: [
      {
        id: "C1", name: "Helios Steel Works", industry: "Steel Manufacturing",
        location: "Scunthorpe, North Lincolnshire", gas: "Nitrogen (N₂)",
        tankCapacity: 800, currentLevel: 10, dailyUsage: 38, threshold: 10,
        priority: "CRITICAL", hoursToEmpty: 2.1, distanceFromDepot: 12,
        deliveryRequired: 72, annualRevenue: 4.2, contractValue: 18.6,
        creditRating: "AA", paymentDays: 28, contractType: "Take-or-Pay",
        penaltyPerHour: 14.2, lastDelivery: "48 hrs ago",
      },
      {
        id: "C2", name: "BioPharm Solutions", industry: "Pharmaceutical",
        location: "Grimsby, Lincolnshire", gas: "Nitrogen (N₂)",
        tankCapacity: 400, currentLevel: 25, dailyUsage: 9, threshold: 25,
        priority: "HIGH", hoursToEmpty: 11.1, distanceFromDepot: 28,
        deliveryRequired: 60, annualRevenue: 2.8, contractValue: 9.4,
        creditRating: "AAA", paymentDays: 21, contractType: "Long-Term",
        penaltyPerHour: 8.6, lastDelivery: "3 days ago",
      },
      {
        id: "C3", name: "CryoMed Hospital Trust", industry: "Healthcare",
        location: "Hull, East Yorkshire", gas: "Nitrogen (N₂)",
        tankCapacity: 200, currentLevel: 50, dailyUsage: 3.5, threshold: 50,
        priority: "MEDIUM", hoursToEmpty: 28.6, distanceFromDepot: 41,
        deliveryRequired: 30, annualRevenue: 1.9, contractValue: 6.1,
        creditRating: "A", paymentDays: 30, contractType: "Long-Term",
        penaltyPerHour: 22.0, lastDelivery: "5 days ago",
      },
    ],
    routeOptions: [
      { id: "R1", label: "Priority-first (LENA Optimal)", recommended: true,
        stops: ["Scunthorpe Depot", "Helios Steel", "BioPharm", "CryoMed Hospital"],
        totalKm: 98, totalTime: 4.2, fuelCost: 187, co2kg: 94, onTimeRisk: "LOW" },
      { id: "R2", label: "Geographic shortest path",
        stops: ["Scunthorpe Depot", "BioPharm", "CryoMed Hospital", "Helios Steel"],
        totalKm: 89, totalTime: 5.8, fuelCost: 171, co2kg: 86, onTimeRisk: "HIGH" },
      { id: "R3", label: "Revenue-weighted",
        stops: ["Scunthorpe Depot", "Helios Steel", "CryoMed Hospital", "BioPharm"],
        totalKm: 112, totalTime: 4.9, fuelCost: 215, co2kg: 108, onTimeRisk: "MEDIUM" },
    ],
    lenadecision: "Helios Steel at 10% with 2.1 hrs — dispatching immediately. Take-or-Pay penalty £14.2K/hr averted. BioPharm second at 11.1 hrs. CryoMed last with 28.6hr buffer.",
  },
  B: {
    id: "B", label: "Demand Spike — BioPharm Emergency",
    description: "Unexpected production surge at pharmaceutical plant. Threshold breached.",
    depotLocation: "Linde Depot, Scunthorpe", truckId: "LIN-T3306",
    truckCapacity: 100,
    customers: [
      {
        id: "C1", name: "Helios Steel Works", industry: "Steel Manufacturing",
        location: "Scunthorpe, North Lincolnshire", gas: "Nitrogen (N₂)",
        tankCapacity: 800, currentLevel: 25, dailyUsage: 38, threshold: 25,
        priority: "HIGH", hoursToEmpty: 5.3, distanceFromDepot: 12,
        deliveryRequired: 60, annualRevenue: 4.2, contractValue: 18.6,
        creditRating: "AA", paymentDays: 28, contractType: "Take-or-Pay",
        penaltyPerHour: 14.2, lastDelivery: "36 hrs ago",
      },
      {
        id: "C2", name: "BioPharm Solutions", industry: "Pharmaceutical",
        location: "Grimsby, Lincolnshire", gas: "Nitrogen (N₂)",
        tankCapacity: 400, currentLevel: 50, dailyUsage: 24, threshold: 50,
        priority: "CRITICAL", hoursToEmpty: 8.3, distanceFromDepot: 28,
        deliveryRequired: 80, annualRevenue: 2.8, contractValue: 9.4,
        creditRating: "AAA", paymentDays: 21, contractType: "Long-Term",
        penaltyPerHour: 8.6, lastDelivery: "4 days ago",
      },
      {
        id: "C3", name: "CryoMed Hospital Trust", industry: "Healthcare",
        location: "Hull, East Yorkshire", gas: "Nitrogen (N₂)",
        tankCapacity: 200, currentLevel: 10, dailyUsage: 3.5, threshold: 10,
        priority: "CRITICAL", hoursToEmpty: 5.7, distanceFromDepot: 41,
        deliveryRequired: 20, annualRevenue: 1.9, contractValue: 6.1,
        creditRating: "A", paymentDays: 30, contractType: "Long-Term",
        penaltyPerHour: 22.0, lastDelivery: "6 days ago",
      },
    ],
    routeOptions: [
      { id: "R1", label: "Dual-critical optimised (LENA Optimal)", recommended: true,
        stops: ["Scunthorpe Depot", "Helios Steel", "CryoMed Hospital", "BioPharm"],
        totalKm: 104, totalTime: 4.7, fuelCost: 199, co2kg: 101, onTimeRisk: "LOW" },
      { id: "R2", label: "Geographic shortest path",
        stops: ["Scunthorpe Depot", "BioPharm", "CryoMed Hospital", "Helios Steel"],
        totalKm: 89, totalTime: 6.1, fuelCost: 171, co2kg: 86, onTimeRisk: "HIGH" },
      { id: "R3", label: "Revenue-weighted",
        stops: ["Scunthorpe Depot", "Helios Steel", "BioPharm", "CryoMed Hospital"],
        totalKm: 118, totalTime: 5.3, fuelCost: 226, co2kg: 113, onTimeRisk: "MEDIUM" },
    ],
    lenadecision: "Two customers simultaneously critical. Helios Steel nearest with Take-or-Pay risk. CryoMed life-critical facility served second. BioPharm demand surge served last with buffer.",
  },
  C: {
    id: "C", label: "Weather Disruption — Hull Route Blocked",
    description: "Flooding closes A63 corridor. CryoMed hospital access severely limited.",
    depotLocation: "Linde Depot, Scunthorpe", truckId: "LIN-T5512",
    truckCapacity: 100,
    customers: [
      {
        id: "C1", name: "Helios Steel Works", industry: "Steel Manufacturing",
        location: "Scunthorpe, North Lincolnshire", gas: "Nitrogen (N₂)",
        tankCapacity: 800, currentLevel: 50, dailyUsage: 38, threshold: 50,
        priority: "MEDIUM", hoursToEmpty: 10.5, distanceFromDepot: 12,
        deliveryRequired: 30, annualRevenue: 4.2, contractValue: 18.6,
        creditRating: "AA", paymentDays: 28, contractType: "Take-or-Pay",
        penaltyPerHour: 14.2, lastDelivery: "24 hrs ago",
      },
      {
        id: "C2", name: "BioPharm Solutions", industry: "Pharmaceutical",
        location: "Grimsby, Lincolnshire", gas: "Nitrogen (N₂)",
        tankCapacity: 400, currentLevel: 10, dailyUsage: 9, threshold: 10,
        priority: "CRITICAL", hoursToEmpty: 4.4, distanceFromDepot: 28,
        deliveryRequired: 72, annualRevenue: 2.8, contractValue: 9.4,
        creditRating: "AAA", paymentDays: 21, contractType: "Long-Term",
        penaltyPerHour: 8.6, lastDelivery: "5 days ago",
      },
      {
        id: "C3", name: "CryoMed Hospital Trust", industry: "Healthcare",
        location: "Hull, East Yorkshire", gas: "Nitrogen (N₂)",
        tankCapacity: 200, currentLevel: 25, dailyUsage: 3.5, threshold: 25,
        priority: "HIGH", hoursToEmpty: 14.3, distanceFromDepot: 67,
        deliveryRequired: 40, annualRevenue: 1.9, contractValue: 6.1,
        creditRating: "A", paymentDays: 30, contractType: "Long-Term",
        penaltyPerHour: 22.0, lastDelivery: "7 days ago",
      },
    ],
    routeOptions: [
      { id: "R1", label: "Detour-aware safe route (LENA Optimal)", recommended: true,
        stops: ["Scunthorpe Depot", "BioPharm", "Helios Steel", "CryoMed (via M62)"],
        totalKm: 138, totalTime: 5.9, fuelCost: 264, co2kg: 132, onTimeRisk: "LOW" },
      { id: "R2", label: "Standard geographic (A63 — flooded)",
        stops: ["Scunthorpe Depot", "BioPharm", "CryoMed (A63 — blocked)", "Helios Steel"],
        totalKm: 89, totalTime: 9.1, fuelCost: 171, co2kg: 86, onTimeRisk: "HIGH" },
      { id: "R3", label: "Revenue-weighted",
        stops: ["Scunthorpe Depot", "Helios Steel", "BioPharm", "CryoMed (M62)"],
        totalKm: 149, totalTime: 6.8, fuelCost: 285, co2kg: 143, onTimeRisk: "MEDIUM" },
    ],
    lenadecision: "A63 flooding confirmed via telemetry. BioPharm at 4.4 hrs — nearest and first. CryoMed rerouted via M62 (+26 km). Helios Steel at 50% has safe buffer.",
  },
};

// ─── Agent steps generator ────────────────────────────────────────────────────
function buildAgentSteps(s: Scenario): AgentStep[] {
  const c = [...s.customers].sort((a, b) => a.hoursToEmpty - b.hoursToEmpty);
  return [
    {
      agentName: "Telemetry Agent",
      icon: Wifi, color: "text-blue-600",
      action: "Reading live IoT sensor feeds",
      detail: "Scanning 3 customer tank sensors · 847 fleet GPS pings · weather APIs",
      dataPoints: [
        { label: c[0].name, value: `${c[0].currentLevel}% · ${c[0].hoursToEmpty}h to empty` },
        { label: c[1].name, value: `${c[1].currentLevel}% · ${c[1].hoursToEmpty}h to empty` },
        { label: c[2].name, value: `${c[2].currentLevel}% · ${c[2].hoursToEmpty}h to empty` },
      ],
      durationMs: 1400,
    },
    {
      agentName: "Risk Agent",
      icon: Shield, color: "text-red-600",
      action: "Assessing SLA & contract risk",
      detail: "Cross-referencing Take-or-Pay clauses, penalty schedules, historical breach data",
      dataPoints: [
        { label: "SLA penalty exposure", value: `£${(c[0].penaltyPerHour * c[0].hoursToEmpty).toFixed(0)}K if delayed` },
        { label: "Contract at risk", value: `£${c[0].contractValue}M — ${c[0].contractType}` },
        { label: "Credit rating", value: `${c[0].creditRating} · ${c[0].paymentDays} day terms` },
      ],
      durationMs: 1600,
    },
    {
      agentName: "Demand Agent",
      icon: TrendingUp, color: "text-violet-600",
      action: "Forecasting consumption & urgency",
      detail: "Computing time-to-empty from usage rate · tank level · threshold delta",
      dataPoints: [
        { label: c[0].name, value: `${c[0].dailyUsage} m³/hr → IMMINENT` },
        { label: c[1].name, value: `${c[1].dailyUsage} m³/hr → ${c[1].hoursToEmpty < 10 ? "URGENT" : "STABLE"}` },
        { label: c[2].name, value: `${c[2].dailyUsage} m³/hr → STABLE` },
      ],
      durationMs: 1500,
    },
    {
      agentName: "Pipeline Agent",
      icon: Database, color: "text-amber-600",
      action: "Checking fleet availability & load",
      detail: "Querying depot manifest · checking truck certification for N₂ · computing fill time",
      dataPoints: [
        { label: "Assigned truck", value: s.truckId },
        { label: "Truck capacity", value: `${s.truckCapacity} m³ liquid N₂` },
        { label: "Depot ready time", value: "T+00:12 from now" },
      ],
      durationMs: 1300,
    },
    {
      agentName: "Routing Agent",
      icon: Navigation, color: "text-emerald-600",
      action: "Optimising multi-stop delivery route",
      detail: "Running constrained shortest-path with priority weights · 3 route options evaluated",
      dataPoints: [
        { label: "Routes evaluated", value: "3 options" },
        { label: "Optimal route", value: `${s.routeOptions[0].totalKm} km · ${s.routeOptions[0].totalTime} hrs` },
        { label: "All SLAs met?", value: "YES — zero breach risk" },
      ],
      durationMs: 1800,
    },
    {
      agentName: "LENA Orchestrator",
      icon: Brain, color: "text-primary",
      action: "Synthesising decision · awaiting human approval",
      detail: "All agent outputs merged · decision package ready for COO sign-off",
      dataPoints: [
        { label: "Total value protected", value: `£${(c.reduce((a, x) => a + x.annualRevenue, 0)).toFixed(1)}M annual` },
        { label: "Penalty averted", value: `£${(c[0].penaltyPerHour * 8).toFixed(0)}K estimated` },
        { label: "Decision confidence", value: "98.7% · LOW risk" },
      ],
      durationMs: 1400,
    },
  ];
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const SC_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "control-tower", label: "Control Tower", icon: Radio },
  { id: "routing", label: "Routing Agent", icon: GitBranch },
  { id: "pipeline", label: "Pipeline Agent", icon: TrendingUp },
  { id: "demand", label: "Demand Agent", icon: BarChart3 },
  { id: "telemetry", label: "Telemetry", icon: Thermometer },
  { id: "risk", label: "Risk Agent", icon: AlertTriangle },
  { id: "decision", label: "Decision Summary", icon: FileText },
];

function SupplyChainSidebar({ activeView, onNavigate, scenarioId }: {
  activeView: string; onNavigate: (v: View) => void; scenarioId?: ScenarioId | null;
}) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-4 py-3.5 border-b border-sidebar-border">
        <p className="font-heading text-sm font-bold tracking-wide text-foreground">
          Supply Chain Control Tower
        </p>
      </SidebarHeader>
      <SidebarContent className="pt-3">
        <div className="px-2">
          <SidebarGroup className="p-0 mb-1">
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40 px-3 h-7">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {SC_NAV.map(item => {
                  const isActive =
                    (item.id === "dashboard" && (activeView === "dashboard" || activeView === "voting")) ||
                    (item.id === "routing" && (activeView === "agent-working" || activeView === "simulation")) ||
                    (item.id === "decision" && activeView === "decision");
                  const isWorking = item.id === "routing" && activeView === "agent-working";
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        className={cn(
                          "relative h-9 rounded-md px-3 text-sm font-medium transition-all duration-150",
                          "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                          isActive && "text-sidebar-foreground bg-sidebar-accent border-l-4 border-primary rounded-l-none"
                        )}
                        onClick={() => {
                          if (item.id === "dashboard") onNavigate("dashboard");
                          if (item.id === "decision" && scenarioId) onNavigate("decision");
                          if (item.id === "routing" && scenarioId) onNavigate("simulation");
                        }}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0 mr-3", isActive ? "opacity-100 text-primary" : "opacity-60")} />
                        {item.label}
                        {isWorking && <span className="ml-auto h-2 w-2 rounded-full bg-orange-500 animate-pulse" />}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">{USER_NAME.charAt(0)}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium leading-tight">{USER_NAME}</span>
            <span className="text-[11px] text-muted-foreground leading-tight">Chief Operating Officer</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: Customer["priority"] }) {
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", {
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400": priority === "CRITICAL",
      "bg-orange-100 text-orange-700": priority === "HIGH",
      "bg-yellow-100 text-yellow-700": priority === "MEDIUM",
    })}>{priority}</span>
  );
}

function KpiCard({ label, value, sub, color, border, Icon }: {
  label: string; value: string; sub: string; color: string; border: string; Icon: typeof Truck;
}) {
  return (
    <Card className={cn("border-l-4 border-border bg-card rounded-l-none rounded-xs", border)}>
      <CardContent className="px-4 py-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {label}
          </p>
        </div>
        <p className={cn("font-heading text-3xl font-bold tracking-tight", color)}>{value}</p>
        <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardView({ onStartSimulation }: { onStartSimulation: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supply Chain & Logistics</h1>
          <p className="text-sm text-muted-foreground mt-1">8,000+ tanker fleet · 80,000+ customer installations · Real-time AI dispatch</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-600 font-mono font-semibold uppercase tracking-wider">All Systems Operational</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Active Deliveries" value="847" sub="+12% vs yesterday" color="text-foreground" border="border-l-primary" Icon={Truck} />
        <KpiCard label="Production Plants" value="612" sub="All online · monitored" color="text-chart-2" border="border-l-chart-2" Icon={Activity} />
        <KpiCard label="Inventory Level" value="94%" sub="Optimal across network" color="text-primary" border="border-l-primary" Icon={Package} />
        <KpiCard label="AI Decisions/Hour" value="2,456" sub="+8% efficiency gain" color="text-accent" border="border-l-accent" Icon={Brain} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" /> Fleet Status — Active Tankers
          </h2>
          <div className="space-y-3">
            {[
              { id: "LIN-T4821", route: "Scunthorpe → Helios Steel Works", status: "In Transit", eta: "14 min" },
              { id: "LIN-T3306", route: "Grimsby Depot → BioPharm Solutions", status: "Loading", eta: "Ready 09:40" },
              { id: "LIN-T5512", route: "Hull → CryoMed Hospital Trust", status: "Delivered", eta: "Complete" },
              { id: "LIN-T2291", route: "Manchester → Peel Ports LNG Terminal", status: "In Transit", eta: "1hr 22min" },
            ].map(t => (
              <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/40">
                <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold">{t.id}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase", {
                      "bg-blue-100 text-blue-700": t.status === "In Transit",
                      "bg-yellow-100 text-yellow-700": t.status === "Loading",
                      "bg-emerald-100 text-emerald-700": t.status === "Delivered",
                    })}>{t.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.route}</p>
                </div>
                <p className="text-xs font-semibold shrink-0">{t.eta}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Gas Distribution
          </h2>
          <div className="space-y-3">
            {[
              { gas: "Nitrogen (N₂)", pct: 35, color: "bg-blue-500" },
              { gas: "Oxygen (O₂)", pct: 28, color: "bg-emerald-500" },
              { gas: "Hydrogen (H₂)", pct: 20, color: "bg-violet-500" },
              { gas: "Carbon Dioxide", pct: 12, color: "bg-orange-500" },
              { gas: "Argon (Ar)", pct: 5, color: "bg-gray-400" },
            ].map(g => (
              <div key={g.gas}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{g.gas}</span>
                  <span className="font-semibold">{g.pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", g.color)} style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Regional Delivery Performance
          </h2>
          <div className="space-y-3">
            {[
              { region: "North East England", onTime: 97.2, trips: 214 },
              { region: "Yorkshire & Humber", onTime: 94.8, trips: 189 },
              { region: "North West England", onTime: 96.1, trips: 241 },
              { region: "East Midlands", onTime: 98.4, trips: 118 },
              { region: "Scotland", onTime: 93.7, trips: 85 },
            ].map(r => (
              <div key={r.region} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground truncate">{r.region}</span>
                    <span className="font-semibold ml-2 shrink-0">{r.onTime}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${r.onTime}%` }} />
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono shrink-0 w-16 text-right">{r.trips} trips</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" /> Active Risk Alerts
          </h2>
          <div className="space-y-2">
            {[
              { level: "HIGH", msg: "Helios Steel Works — Tank at threshold. Dispatch pending.", time: "2 min ago" },
              { level: "MEDIUM", msg: "M62 congestion alert — ETA +18min for 3 tankers.", time: "9 min ago" },
              { level: "LOW", msg: "BioPharm Grimsby — demand spike forecast next 4h.", time: "14 min ago" },
              { level: "LOW", msg: "Winter weather advisory — Hull Docks route. Monitor.", time: "31 min ago" },
            ].map((a, i) => (
              <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-muted/40">
                <AlertCircle className={cn("h-4 w-4 shrink-0 mt-0.5", {
                  "text-red-500": a.level === "HIGH",
                  "text-orange-500": a.level === "MEDIUM",
                  "text-yellow-500": a.level === "LOW",
                })} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs">{a.msg}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">LENA Agent — Ready</span>
          </div>
          <h3 className="font-semibold">Run Supply Chain Simulation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Audience selects a disruption scenario. LENA analyses customer telemetry, prioritises deliveries and recommends the optimal dispatch route.
          </p>
        </div>
        <Button className="ml-6 shrink-0 gap-2" size="lg" onClick={onStartSimulation}>
          Launch Simulation <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Voting View ──────────────────────────────────────────────────────────────
function VotingView({ onVote }: { onVote: (s: ScenarioId) => void }) {
  const [votes, setVotes] = useState<Record<ScenarioId, number>>({ A: 0, B: 0, C: 0 });
  const [myVote, setMyVote] = useState<ScenarioId | null>(null);
  const [locked, setLocked] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const total = votes.A + votes.B + votes.C;

  useEffect(() => {
    if (locked) return;
    const iv = setInterval(() => {
      setVotes(v => ({ A: v.A + Math.floor(Math.random() * 4), B: v.B + Math.floor(Math.random() * 3), C: v.C + Math.floor(Math.random() * 3) }));
    }, 800);
    return () => clearInterval(iv);
  }, [locked]);

  useEffect(() => {
    if (locked) return;
    if (countdown <= 0) { lockIn(); return; }
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown, locked]);

  function castVote(s: ScenarioId) { if (myVote || locked) return; setMyVote(s); setVotes(v => ({ ...v, [s]: v[s] + 1 })); }
  function lockIn() {
    setLocked(true);
    const winner = (Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0]) as ScenarioId;
    setTimeout(() => onVote(winner), 1800);
  }

  const meta: Record<ScenarioId, { label: string; icon: typeof AlertTriangle; color: string; desc: string; risk: string }> = {
    A: { label: "Facility Shutdown", icon: AlertTriangle, color: "text-red-500", desc: "Helios Steel — critical nitrogen shortage. Plant at 10%.", risk: "£29.8K/hr penalty exposure" },
    B: { label: "Demand Spike", icon: TrendingUp, color: "text-orange-500", desc: "BioPharm emergency surge — two customers simultaneously critical.", risk: "£22K/hr penalty · 2 SLAs at risk" },
    C: { label: "Weather Disruption", icon: Navigation, color: "text-blue-500", desc: "A63 flooding — Hull route blocked. Hospital rerouting required.", risk: "Road closed · +26 km detour" },
  };

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Live Audience Vote
        </div>
        <h2 className="text-2xl font-bold">Choose Today's Disruption Scenario</h2>
        <p className="text-muted-foreground mt-2 text-sm">The scenario with the most votes will be simulated live by LENA</p>
        {!locked && <div className="mt-3 text-4xl font-mono font-bold text-primary">{countdown}s</div>}
        {locked && <div className="mt-3 text-sm text-muted-foreground font-mono">Tallying… launching LENA agents</div>}
      </div>
      <div className="space-y-3">
        {(["A", "B", "C"] as ScenarioId[]).map(sid => {
          const m = meta[sid];
          const pct = total > 0 ? Math.round((votes[sid] / total) * 100) : 0;
          const isWinning = votes[sid] === Math.max(votes.A, votes.B, votes.C) && total > 0;
          return (
            <div key={sid}
              className={cn("border rounded-xl p-4 cursor-pointer transition-all",
                myVote === sid ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40",
                isWinning && locked && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => castVote(sid)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <m.icon className={cn("h-5 w-5 mt-0.5 shrink-0", m.color)} />
                  <div>
                    <span className="font-semibold text-sm">{m.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                    <p className="text-xs text-red-600 font-semibold mt-1">{m.risk}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="font-mono font-bold text-lg">{pct}%</span>
                  <p className="text-[10px] text-muted-foreground">{votes[sid]} votes</p>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-300", { "bg-red-500": sid === "A", "bg-orange-500": sid === "B", "bg-blue-500": sid === "C" })}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center">
        <Button variant="outline" onClick={lockIn} disabled={locked}>
          {locked ? "Tallying votes…" : "Lock In Results (Presenter)"}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">{total} audience votes counted</p>
      </div>
    </div>
  );
}

// ─── Agent Working View (10-second animated) ──────────────────────────────────
function AgentWorkingView({ scenario, onComplete }: { scenario: Scenario; onComplete: () => void }) {
  const steps = buildAgentSteps(scenario);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepProgress, setStepProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const logMessages: string[][] = [
    ["[Telemetry] Connecting to IoT hub…", "[Telemetry] Tank sensors online · 3/3 customers", "[Telemetry] Alert: Helios Steel at threshold"],
    ["[Risk] Loading contract database…", "[Risk] Take-or-Pay clause: Helios Steel — £14.2K/hr", "[Risk] Credit check: AA rating · 28-day terms"],
    ["[Demand] Computing usage curves…", "[Demand] Helios: 38 m³/hr → 2.1h to empty", "[Demand] BioPharm: 9 m³/hr → stable"],
    ["[Pipeline] Checking depot manifest…", `[Pipeline] ${scenario.truckId} certified N₂ · 100m³`, "[Pipeline] ETA depot departure: T+12min"],
    ["[Routing] Evaluating 3 route options…", "[Routing] Priority-first optimal · 98 km", "[Routing] All SLAs met · LOW risk"],
    ["[LENA] Synthesising agent outputs…", "[LENA] Decision package ready", "[LENA] Awaiting COO approval"],
  ];

  useEffect(() => {
    let elapsed = 0;
    steps.forEach((step, idx) => {
      setTimeout(() => {
        setCurrentStep(idx);
        setStepProgress(0);
        logMessages[idx].forEach((msg, mi) => {
          setTimeout(() => {
            setLogs(l => [...l, msg]);
            if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
          }, mi * (step.durationMs / 3));
        });
      }, elapsed);
      elapsed += step.durationMs;
      setTimeout(() => setCompletedSteps(c => [...c, idx]), elapsed - 100);
    });
    setTimeout(() => { setDone(true); setTimeout(onComplete, 1200); }, elapsed);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setStepProgress(p => Math.min(p + 3, 100)), 40);
    return () => clearInterval(iv);
  }, [currentStep]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("rounded-xl border-2 p-5", {
        "border-red-400 bg-red-50/50 dark:bg-red-950/20": scenario.id === "A",
        "border-orange-400 bg-orange-50/50 dark:bg-orange-950/20": scenario.id === "B",
        "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20": scenario.id === "C",
      })}>
        <div className="flex items-center justify-between">
          <div>
            <span className={cn("text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded", {
              "bg-red-100 text-red-700": scenario.id === "A",
              "bg-orange-100 text-orange-700": scenario.id === "B",
              "bg-blue-100 text-blue-700": scenario.id === "C",
            })}>Scenario {scenario.id} — Audience Selected</span>
            <h2 className="text-xl font-bold mt-1">{scenario.label}</h2>
            <p className="text-sm text-muted-foreground">{scenario.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Depot</p>
            <p className="font-semibold text-sm">{scenario.depotLocation}</p>
            <p className="text-xs text-muted-foreground mt-1">Truck: <span className="font-mono font-bold">{scenario.truckId}</span></p>
          </div>
        </div>
      </div>

      {/* Main animated area */}
      <div className="grid grid-cols-2 gap-4">
        {/* Agent pipeline */}
        <div className="bg-card rounded-xl border p-5 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary animate-pulse" /> LENA Agent Pipeline
          </h3>
          {steps.map((step, idx) => {
            const isActive = currentStep === idx && !completedSteps.includes(idx);
            const isDone = completedSteps.includes(idx);
            const isPending = idx > currentStep;
            return (
              <div key={idx} className={cn("rounded-lg border p-3 transition-all duration-300", {
                "border-primary bg-primary/5": isActive,
                "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20": isDone,
                "border-border opacity-40": isPending,
              })}>
                <div className="flex items-center gap-3 mb-1">
                  {isDone
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    : isActive
                      ? <step.icon className={cn("h-4 w-4 shrink-0 animate-pulse", step.color)} />
                      : <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />}
                  <span className={cn("text-xs font-semibold", isDone ? "text-emerald-700" : isActive ? step.color : "text-muted-foreground")}>
                    {step.agentName}
                  </span>
                  {isActive && <span className="ml-auto text-[10px] text-muted-foreground font-mono animate-pulse">Processing…</span>}
                  {isDone && <span className="ml-auto text-[10px] text-emerald-600 font-mono">✓ Done</span>}
                </div>
                {isActive && (
                  <>
                    <p className="text-[11px] text-muted-foreground mb-2 ml-7">{step.action}</p>
                    <div className="h-1 bg-muted rounded-full overflow-hidden ml-7">
                      <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${stepProgress}%` }} />
                    </div>
                    <div className="mt-2 space-y-1 ml-7">
                      {step.dataPoints.map((dp, di) => (
                        <div key={di} className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">{dp.label}</span>
                          <span className="font-mono font-semibold text-foreground">{dp.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {isDone && (
                  <div className="flex gap-3 mt-1 ml-7">
                    {step.dataPoints.slice(0, 2).map((dp, di) => (
                      <div key={di} className="text-[10px]">
                        <span className="text-emerald-600 font-semibold">{dp.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: logs + live data */}
        <div className="space-y-4">
          {/* Live log */}
          <div className="bg-card rounded-xl border p-4">
            <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Terminal className="h-3 w-3" /> Agent Log
            </h3>
            <div ref={logRef} className="h-44 overflow-y-auto space-y-1 font-mono text-[11px]">
              {logs.map((l, i) => (
                <div key={i} className={cn("flex gap-2", {
                  "text-red-600": l.includes("Alert") || l.includes("threshold"),
                  "text-emerald-600": l.includes("certified") || l.includes("optimal") || l.includes("ready"),
                  "text-blue-600": l.includes("[Telemetry]"),
                  "text-violet-600": l.includes("[Demand]"),
                  "text-amber-600": l.includes("[Pipeline]"),
                  "text-emerald-700": l.includes("[Routing]"),
                  "text-primary": l.includes("[LENA]"),
                  "text-muted-foreground": !l.includes("Alert") && !l.includes("threshold") && !l.includes("certified"),
                })}>
                  <span className="opacity-50 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span>{l}</span>
                </div>
              ))}
              {!done && <div className="flex gap-2 text-muted-foreground/50"><span className="animate-pulse">▌</span></div>}
            </div>
          </div>

          {/* Live metrics */}
          <div className="bg-card rounded-xl border p-4">
            <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="h-3 w-3" /> Critical Metrics Being Evaluated
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {scenario.customers.map((c) => (
                <div key={c.id} className={cn("p-2.5 rounded-lg text-[11px]", {
                  "bg-red-50 border border-red-200": c.priority === "CRITICAL",
                  "bg-orange-50 border border-orange-200": c.priority === "HIGH",
                  "bg-muted/40 border": c.priority === "MEDIUM",
                })}>
                  <p className="font-semibold truncate">{c.name.split(" ")[0]}</p>
                  <p className={cn("font-mono font-bold", {
                    "text-red-600": c.hoursToEmpty < 4,
                    "text-orange-500": c.hoursToEmpty >= 4 && c.hoursToEmpty < 12,
                    "text-emerald-600": c.hoursToEmpty >= 12,
                  })}>{c.hoursToEmpty}h</p>
                  <p className="text-muted-foreground">{c.currentLevel}% · {c.threshold}% threshold</p>
                </div>
              ))}
              <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-[11px]">
                <p className="text-primary font-semibold">Total at risk</p>
                <p className="font-mono font-bold text-primary">
                  £{scenario.customers.reduce((a, c) => a + c.annualRevenue, 0).toFixed(1)}M/yr
                </p>
                <p className="text-muted-foreground">annual revenue</p>
              </div>
            </div>
          </div>

          {/* Overall progress */}
          <div className="bg-card rounded-xl border p-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="font-semibold">{done ? "Analysis complete" : "LENA analysing…"}</span>
              <span className="font-mono text-muted-foreground">{completedSteps.length}/{steps.length} agents</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-500", done ? "bg-emerald-500" : "bg-primary")}
                style={{ width: `${(completedSteps.length / steps.length) * 100}%` }} />
            </div>
            {done && (
              <p className="text-xs text-emerald-600 font-semibold mt-2 text-center animate-pulse">
                ✓ Route optimised · Proceeding to simulation…
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Need Terminal icon - add it
function Terminal({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;
}

// ─── Customer Card ────────────────────────────────────────────────────────────
function CustomerCard({ c, rank }: { c: Customer; rank: number }) {
  const urgency = c.hoursToEmpty < 4 ? "IMMINENT" : c.hoursToEmpty < 12 ? "URGENT" : "STABLE";
  const deliveryPct = Math.round((c.deliveryRequired / 100) * 100);
  return (
    <div className={cn("rounded-xl border p-5 space-y-4", {
      "border-red-300 bg-red-50/50 dark:bg-red-950/20": c.priority === "CRITICAL",
      "border-orange-300 bg-orange-50/50": c.priority === "HIGH",
      "border-border": c.priority === "MEDIUM",
    })}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-muted-foreground">STOP #{rank}</span>
            <PriorityBadge priority={c.priority} />
          </div>
          <h3 className="font-semibold">{c.name}</h3>
          <p className="text-xs text-muted-foreground">{c.industry} · {c.location}</p>
        </div>
        <div className="text-right">
          <div className={cn("text-2xl font-bold font-mono", { "text-red-600": urgency === "IMMINENT", "text-orange-500": urgency === "URGENT", "text-emerald-600": urgency === "STABLE" })}>
            {c.hoursToEmpty.toFixed(1)}h
          </div>
          <div className="text-[10px] text-muted-foreground">to empty</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        <div><span className="text-muted-foreground">Usage rate</span><p className="font-semibold">{c.dailyUsage} m³/hr</p></div>
        <div><span className="text-muted-foreground">Tank level</span><p className={cn("font-semibold", { "text-red-600": c.currentLevel <= c.threshold })}>{c.currentLevel}% <span className="text-muted-foreground font-normal">(threshold {c.threshold}%)</span></p></div>
        <div><span className="text-muted-foreground">Annual revenue</span><p className="font-semibold">£{c.annualRevenue}M</p></div>
        <div><span className="text-muted-foreground">Contract value</span><p className="font-semibold">£{c.contractValue}M</p></div>
        <div><span className="text-muted-foreground">Contract type</span><p className="font-semibold">{c.contractType}</p></div>
        <div><span className="text-muted-foreground">SLA penalty</span><p className="font-semibold text-red-600">£{c.penaltyPerHour}K/hr</p></div>
        <div><span className="text-muted-foreground">Credit rating</span><p className="font-semibold">{c.creditRating}</p></div>
        <div><span className="text-muted-foreground">Last delivery</span><p className="font-semibold">{c.lastDelivery}</p></div>
      </div>
      <div className="pt-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Tank level</span>
          <span className="font-mono font-semibold">{c.currentLevel}%</span>
        </div>
        <div className="relative h-2 bg-muted rounded-full overflow-visible">
          <div className={cn("h-full rounded-full", { "bg-red-500": c.currentLevel <= c.threshold, "bg-orange-400": c.currentLevel > c.threshold && c.currentLevel <= c.threshold * 1.5, "bg-emerald-500": c.currentLevel > c.threshold * 1.5 })} style={{ width: `${c.currentLevel}%` }} />
          <div className="absolute top-0 h-2 w-0.5 bg-red-500" style={{ left: `${c.threshold}%` }} title={`Threshold: ${c.threshold}%`} />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
          <span>0%</span><span className="text-red-500">▲ {c.threshold}% threshold</span><span>100%</span>
        </div>
      </div>
      <div className="pt-2 border-t">
        <span className="text-xs text-muted-foreground">Delivery allocation</span>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden flex-1">
            <div className="h-full bg-primary rounded-full" style={{ width: `${deliveryPct}%` }} />
          </div>
          <span className="font-mono font-bold text-sm text-primary">{c.deliveryRequired} m³</span>
        </div>
        {urgency === "IMMINENT" && (
          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-2 inline-block animate-pulse">⚠ Imminent runout</span>
        )}
      </div>
    </div>
  );
}

// ─── Simulation View ──────────────────────────────────────────────────────────
function SimulationView({ scenario, onDecision }: { scenario: Scenario; onDecision: () => void }) {
  const customers = [...scenario.customers].sort((a, b) => a.hoursToEmpty - b.hoursToEmpty);
  const totalDelivery = scenario.customers.reduce((s, c) => s + c.deliveryRequired, 0);

  return (
    <div className="space-y-6">
      <div className={cn("rounded-xl border-2 p-5", {
        "border-red-400 bg-red-50/50": scenario.id === "A",
        "border-orange-400 bg-orange-50/50": scenario.id === "B",
        "border-blue-400 bg-blue-50/50": scenario.id === "C",
      })}>
        <div className="flex items-center justify-between">
          <div>
            <span className={cn("text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded", {
              "bg-red-100 text-red-700": scenario.id === "A",
              "bg-orange-100 text-orange-700": scenario.id === "B",
              "bg-blue-100 text-blue-700": scenario.id === "C",
            })}>Scenario {scenario.id} — Audience Selected</span>
            <h2 className="text-xl font-bold mt-1">{scenario.label}</h2>
            <p className="text-sm text-muted-foreground">{scenario.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Assigned truck</p>
            <p className="font-mono font-bold text-lg">{scenario.truckId}</p>
            <p className="text-xs text-muted-foreground">{scenario.depotLocation}</p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-emerald-700 text-sm">LENA — Analysis complete. Route optimised.</span>
          <p className="text-sm text-emerald-700 mt-1">{scenario.lenadecision}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-5">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" /> {scenario.truckId} — {scenario.truckCapacity} m³ Allocation
        </h3>
        <div className="flex h-7 rounded-lg overflow-hidden gap-px mb-3">
          {customers.map((c, i) => {
            const pct = Math.round((c.deliveryRequired / scenario.truckCapacity) * 100);
            return (
              <div key={c.id} className={cn("flex items-center justify-center text-[10px] font-bold text-white", {
                "bg-red-500": i === 0, "bg-orange-400": i === 1, "bg-blue-500": i === 2,
              })} style={{ width: `${pct}%` }}>{pct}%</div>
            );
          })}
        </div>
        <div className="flex gap-6 text-xs flex-wrap">
          {customers.map((c, i) => (
            <div key={c.id} className="flex items-center gap-1.5">
              <div className={cn("h-2 w-2 rounded-full", { "bg-red-500": i === 0, "bg-orange-400": i === 1, "bg-blue-500": i === 2 })} />
              <span className="text-muted-foreground">{c.name.split(" ")[0]}: <span className="font-semibold">{c.deliveryRequired} m³</span></span>
            </div>
          ))}
          <div className="ml-auto text-muted-foreground">Total: <span className={cn("font-semibold", totalDelivery > scenario.truckCapacity ? "text-red-500" : "text-foreground")}>{totalDelivery} m³</span>
            {totalDelivery > scenario.truckCapacity && <span className="text-red-500 ml-1">⚠ Overload</span>}</div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-primary" /> Customer Telemetry — Priority by Time-to-Empty
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {customers.map((c, i) => <CustomerCard key={c.id} c={c} rank={i + 1} />)}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Navigation className="h-4 w-4 text-primary" /> Route Options Evaluated
        </h3>
        <div className="space-y-3">
          {scenario.routeOptions.map(r => (
            <div key={r.id} className={cn("rounded-xl border p-4 flex items-start gap-4", r.recommended && "border-primary bg-primary/5")}>
              <div className="shrink-0 mt-0.5">
                {r.recommended ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-sm">{r.label}</span>
                  {r.recommended && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">LENA Recommended</span>}
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto", {
                    "bg-emerald-100 text-emerald-700": r.onTimeRisk === "LOW",
                    "bg-orange-100 text-orange-700": r.onTimeRisk === "MEDIUM",
                    "bg-red-100 text-red-700": r.onTimeRisk === "HIGH",
                  })}>{r.onTimeRisk} risk</span>
                </div>
                <div className="flex gap-1 flex-wrap mb-2">
                  {r.stops.map((stop, si) => (
                    <div key={si} className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{stop}</span>
                      {si < r.stops.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Distance</span><p className="font-semibold font-mono">{r.totalKm} km</p></div>
                  <div><span className="text-muted-foreground">Duration</span><p className="font-semibold font-mono">{r.totalTime} hrs</p></div>
                  <div><span className="text-muted-foreground">Fuel cost</span><p className="font-semibold font-mono">£{r.fuelCost}</p></div>
                  <div><span className="text-muted-foreground">CO₂</span><p className="font-semibold font-mono">{r.co2kg} kg</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" className="gap-2" onClick={onDecision}>
          View Decision Summary <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Decision Summary ─────────────────────────────────────────────────────────
function DecisionView({ scenario, onModify }: {
  scenario: Scenario; onModify: () => void;
}) {
  const [approved, setApproved] = useState(false);
  const recommended = scenario.routeOptions.find(r => r.recommended)!;
  const baseline = scenario.routeOptions[1];
  const customers = [...scenario.customers].sort((a, b) => a.hoursToEmpty - b.hoursToEmpty);
  const totalRevenue = customers.reduce((s, c) => s + c.annualRevenue, 0);
  const totalContract = customers.reduce((s, c) => s + c.contractValue, 0);
  const penaltyAvertedMax = customers[0].penaltyPerHour * 8;

  function handleApprove() { setApproved(true); }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">Decision Summary</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Scenario {scenario.id} · {scenario.label} · Truck {scenario.truckId} · Generated by LENA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Situation */}
      <div className="bg-card rounded-xl border p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Situation</h3>
        <p className="text-sm">{scenario.description}</p>
        <div className="mt-4 grid grid-cols-4 gap-4 text-xs">
          <div><span className="text-muted-foreground">Customers affected</span><p className="font-bold text-2xl">{customers.length}</p></div>
          <div><span className="text-muted-foreground">Most critical</span><p className="font-semibold mt-1">{customers[0].name}</p></div>
          <div><span className="text-muted-foreground">Time-to-empty</span><p className="font-bold text-2xl text-red-600 font-mono">{customers[0].hoursToEmpty.toFixed(1)}h</p></div>
          <div><span className="text-muted-foreground">Total revenue at risk</span><p className="font-bold text-2xl text-primary">£{totalRevenue.toFixed(1)}M</p></div>
        </div>
      </div>

      {/* Financial impact */}
      <div className="bg-card rounded-xl border p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Financial Impact Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs text-red-700 font-semibold">Penalty Exposure (if delayed)</p>
              <p className="font-bold text-xl text-red-600 font-mono mt-1">£{penaltyAvertedMax.toFixed(0)}K</p>
              <p className="text-xs text-red-600">£{customers[0].penaltyPerHour}K/hr × 8 hrs est. delay</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-700 font-semibold">Penalty Averted (LENA action)</p>
              <p className="font-bold text-xl text-emerald-600 font-mono mt-1">£{penaltyAvertedMax.toFixed(0)}K</p>
              <p className="text-xs text-emerald-600">All SLAs met · {recommended.onTimeRisk} risk</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-semibold">Total Annual Revenue Protected</p>
              <p className="font-bold text-xl font-mono mt-1">£{totalRevenue.toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Across {customers.length} long-term accounts</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-semibold">Total Contract Value Protected</p>
              <p className="font-bold text-xl font-mono mt-1">£{totalContract.toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Weighted contract portfolio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Factors considered incl. credit risk */}
      <div className="bg-card rounded-xl border p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Factors Considered by LENA</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Telemetry time-to-empty", value: `${customers[0].hoursToEmpty}h critical · ${customers[1].hoursToEmpty}h high`, icon: Thermometer },
            { label: "Contract type & penalties", value: `Take-or-Pay £${customers[0].penaltyPerHour}K/hr · Long-Term SLAs`, icon: FileText },
            { label: "Annual revenue weighting", value: `£${customers.map(c => c.annualRevenue + "M").join(" · ")}`, icon: BarChart3 },
            { label: "Credit risk assessment", value: `${customers.map(c => c.name.split(" ")[0] + ": " + c.creditRating).join(" · ")}`, icon: CreditCard },
            { label: "Payment terms", value: `${customers.map(c => c.paymentDays + "-day terms").join(" · ")}`, icon: Clock },
            { label: "Route & fuel cost", value: `${recommended.totalKm} km · £${recommended.fuelCost} fuel`, icon: Navigation },
            { label: "Carbon emissions", value: `${recommended.co2kg} kg CO₂ · ${((recommended.co2kg / baseline.co2kg - 1) * 100).toFixed(0)}% vs baseline`, icon: Zap },
            { label: "Road & weather conditions", value: scenario.id === "C" ? "A63 flooding — M62 reroute active" : "Normal — no disruptions", icon: AlertTriangle },
          ].map(f => (
            <div key={f.label} className="flex gap-3 p-3 rounded-lg bg-muted/40">
              <f.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit risk table */}
      <div className="bg-card rounded-xl border p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Customer Credit Risk Profile</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Customer</th>
                <th className="text-left py-2 pr-3 font-medium">Credit Rating</th>
                <th className="text-left py-2 pr-3 font-medium">Payment Terms</th>
                <th className="text-left py-2 pr-3 font-medium">Contract Value</th>
                <th className="text-left py-2 pr-3 font-medium">Annual Revenue</th>
                <th className="text-left py-2 font-medium">SLA Penalty/hr</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map(c => (
                <tr key={c.id}>
                  <td className="py-2.5 pr-3 font-semibold">{c.name}</td>
                  <td className="py-2.5 pr-3">
                    <span className={cn("font-bold px-1.5 py-0.5 rounded text-[10px]", {
                      "bg-emerald-100 text-emerald-700": c.creditRating === "AAA" || c.creditRating === "AA",
                      "bg-blue-100 text-blue-700": c.creditRating === "A",
                      "bg-yellow-100 text-yellow-700": c.creditRating === "BBB",
                    })}>{c.creditRating}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{c.paymentDays} days</td>
                  <td className="py-2.5 pr-3 font-semibold">£{c.contractValue}M</td>
                  <td className="py-2.5 pr-3 font-semibold">£{c.annualRevenue}M</td>
                  <td className="py-2.5 text-red-600 font-semibold">£{c.penaltyPerHour}K</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Route comparison */}
      <div className="bg-card rounded-xl border p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Route Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="text-left py-2 pr-4 font-medium">Metric</th>
                <th className="text-left py-2 pr-4 font-medium">Geographic (baseline)</th>
                <th className="text-left py-2 font-medium text-primary">LENA Optimal</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {[
                ["Truck ID", scenario.truckId, scenario.truckId],
                ["Stop order", baseline.stops.join(" → "), recommended.stops.join(" → ")],
                ["Distance", baseline.totalKm + " km", recommended.totalKm + " km"],
                ["Est. duration", baseline.totalTime + " hrs", recommended.totalTime + " hrs"],
                ["Fuel cost", "£" + baseline.fuelCost, "£" + recommended.fuelCost],
                ["CO₂ emissions", baseline.co2kg + " kg", recommended.co2kg + " kg"],
                ["On-time risk", baseline.onTimeRisk, recommended.onTimeRisk],
                ["SLA penalty exposure", "£" + (customers[0].penaltyPerHour * 8).toFixed(0) + "K — breach likely", "£0 — all SLAs met"],
                ["Critical SLA met?", "NO — " + customers[0].name.split(" ")[0] + " runs out in " + customers[0].hoursToEmpty + "h", "YES — all 3 customers covered"],
              ].map(([metric, base, optimal]) => (
                <tr key={metric as string}>
                  <td className="py-2.5 pr-4 text-muted-foreground font-medium">{metric}</td>
                  <td className="py-2.5 pr-4 text-foreground">{base}</td>
                  <td className={cn("py-2.5 font-semibold", (optimal as string).includes("YES") || (optimal as string) === scenario.truckId ? "text-primary" : (optimal as string).includes("£0") ? "text-emerald-600" : "text-primary")}>{optimal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision impact */}
      <div className="bg-card rounded-xl border p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Impact of This Decision</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Immediate: Penalty averted", value: `£${penaltyAvertedMax.toFixed(0)}K`, sub: "No SLA breach for any customer", icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Short-term: Revenue protected", value: `£${totalRevenue.toFixed(1)}M/yr`, sub: "All 3 accounts retained", icon: TrendingUp, color: "text-primary" },
            { label: "Long-term: Relationship value", value: `£${totalContract.toFixed(1)}M`, sub: "Contract portfolio preserved", icon: Users, color: "text-violet-600" },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-lg bg-muted/40 border">
              <item.icon className={cn("h-5 w-5 mb-2", item.color)} />
              <p className="text-xs text-muted-foreground font-semibold">{item.label}</p>
              <p className={cn("font-bold text-xl font-mono mt-1", item.color)}>{item.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery sequence */}
      <div className="bg-card rounded-xl border p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Recommended Delivery Sequence — {scenario.truckId}
        </h3>
        <div className="space-y-3">
          {customers.map((c, i) => (
            <div key={c.id} className="flex gap-4 items-start">
              <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0", {
                "bg-red-500": i === 0, "bg-orange-400": i === 1, "bg-blue-500": i === 2,
              })}>{i + 1}</div>
              <div className="flex-1 p-3 rounded-lg bg-muted/40">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{c.name}</span>
                  <PriorityBadge priority={c.priority} />
                </div>
                <div className="flex flex-wrap gap-4 mt-1.5 text-xs text-muted-foreground">
                  <span>Deliver: <span className="font-mono font-semibold text-foreground">{c.deliveryRequired} m³ N₂</span></span>
                  <span>Buffer: <span className="font-semibold text-foreground">{c.hoursToEmpty.toFixed(1)} hrs left</span></span>
                  <span>Revenue: <span className="font-semibold text-foreground">£{c.annualRevenue}M/yr</span></span>
                  <span>Credit: <span className="font-semibold text-foreground">{c.creditRating}</span></span>
                  <span>Penalty: <span className="font-semibold text-red-600">£{c.penaltyPerHour}K/hr if missed</span></span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {i === 0 && "Critical — deliver first. Threshold breached. Take-or-Pay clause active."}
                  {i === 1 && "High priority — deliver second. Sufficient buffer for travel time. SLA protected."}
                  {i === 2 && "Stable — deliver last. Tank level within safe window. No breach risk."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Human approval */}
      {!approved ? (
        <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Users className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold">Human-in-the-Loop Approval Required</h3>
              <p className="text-sm text-muted-foreground mt-1">
                LENA has generated this dispatch plan for truck <span className="font-mono font-semibold">{scenario.truckId}</span>.
                As COO, your approval is required before the tanker departs from {scenario.depotLocation}.
                You may modify the delivery sequence or allocation before approving.
              </p>
              <div className="mt-4 flex gap-3">
                <Button className="gap-2" onClick={handleApprove}>
                  <CheckCircle2 className="h-4 w-4" /> Approve & Dispatch {scenario.truckId}
                </Button>
                <Button variant="outline" className="gap-2" onClick={onModify}>
                  <RotateCcw className="h-4 w-4" /> Modify Decision
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
                Dispatch Approved — {scenario.truckId} Departing
              </h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-500">
                Truck {scenario.truckId} dispatched from {scenario.depotLocation}. ETA completion: {recommended.totalTime} hours.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-emerald-100 rounded-lg p-3">
              <p className="text-emerald-700 font-semibold">Penalty averted</p>
              <p className="font-bold text-emerald-600 text-lg font-mono">£{penaltyAvertedMax.toFixed(0)}K</p>
            </div>
            <div className="bg-emerald-100 rounded-lg p-3">
              <p className="text-emerald-700 font-semibold">Revenue protected</p>
              <p className="font-bold text-emerald-600 text-lg font-mono">£{totalRevenue.toFixed(1)}M/yr</p>
            </div>
            <div className="bg-emerald-100 rounded-lg p-3">
              <p className="text-emerald-700 font-semibold">Customers served</p>
              <p className="font-bold text-emerald-600 text-lg font-mono">{customers.length} sites</p>
            </div>
          </div>
          <p className="text-xs text-emerald-600">Returning to dashboard…</p>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SupplyChain() {
  const [view, setView] = useState<View>("dashboard");
  const [scenario, setScenario] = useState<Scenario | null>(null);

  function handleVoteResult(sid: ScenarioId) {
    setScenario(SCENARIOS[sid]);
    setView("agent-working");
  }

  return (
    <SidebarProvider>
      <div className="flex h-full w-full overflow-hidden bg-background">
        <SupplyChainSidebar
          activeView={view}
          scenarioId={scenario?.id}
          onNavigate={(v) => {
            if (v === "dashboard") setView("dashboard");
            else if (v === "decision" && scenario) setView("decision");
            else if (v === "simulation" && scenario) setView("simulation");
          }}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <div className="h-4 flex items-center px-4 gap-3 shrink-0 bg-background">
            <SidebarTrigger className="h-8 w-8" />
            <div className="h-4 w-px bg-border" />
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Core</span>
              <ChevronRight className="h-3 w-3" />
              <span>Supply Chain</span>
              {(view === "agent-working") && <><ChevronRight className="h-3 w-3" /><span className="text-foreground">LENA Agents Working</span></>}
              {(view === "simulation") && <><ChevronRight className="h-3 w-3" /><span className="text-foreground">Simulation</span></>}
              {(view === "voting") && <><ChevronRight className="h-3 w-3" /><span className="text-foreground">Audience Vote</span></>}
              {(view === "decision") && <><ChevronRight className="h-3 w-3" /><span className="text-foreground">Decision Summary</span></>}
            </nav>
            {scenario && view !== "dashboard" && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Scenario {scenario.id}</span>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", {
                  "bg-red-100 text-red-700": scenario.id === "A",
                  "bg-orange-100 text-orange-700": scenario.id === "B",
                  "bg-blue-100 text-blue-700": scenario.id === "C",
                })}>Active</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-6 py-6">
              {view === "dashboard" && <DashboardView onStartSimulation={() => setView("voting")} />}
              {view === "voting" && <VotingView onVote={handleVoteResult} />}
              {view === "agent-working" && scenario && (
                <AgentWorkingView scenario={scenario} onComplete={() => setView("simulation")} />
              )}
              {view === "simulation" && scenario && (
                <SimulationView scenario={scenario} onDecision={() => setView("decision")} />
              )}
              {view === "decision" && scenario && (
                <DecisionView
                  scenario={scenario}
                  onModify={() => setView("simulation")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
