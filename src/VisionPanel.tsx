import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Truck,
  Factory,
  TrendingUp,
  Banknote,
  UsersRound,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type Dept = {
  id:         string;
  to:         string;
  desc:       string;
  Icon:       LucideIcon;
  borderFull: string;
  bgColor:    string;
  textColor:  string;
};

// ── Data ───────────────────────────────────────────────────────────────────────

const DEPTS: Dept[] = [
  {
    id:         "Supply Chain",
    to:         "/supply-chain",
    desc:       "Fleet logistics, tank monitoring & route optimisation",
    Icon:       Truck,
    borderFull: "border-primary",
    bgColor:    "bg-primary/10",
    textColor:  "text-primary",
  },
  {
    id:         "Manufacturing",
    to:         "/manufacturing",
    desc:       "ASU & hydrogen plant ops, OEE & predictive maintenance",
    Icon:       Factory,
    borderFull: "border-chart-2",
    bgColor:    "bg-chart-2/10",
    textColor:  "text-chart-2",
  },
  {
    id:         "Commercial & Trading",
    to:         "/commercial",
    desc:       "AI pricing engine, customer churn & contract management",
    Icon:       TrendingUp,
    borderFull: "border-chart-5",
    bgColor:    "bg-chart-5/10",
    textColor:  "text-chart-5",
  },
  {
    id:         "Finance",
    to:         "/finance",
    desc:       "Financial close, ROI tracking & SAP S/4HANA migration",
    Icon:       Banknote,
    borderFull: "border-chart-3",
    bgColor:    "bg-chart-3/10",
    textColor:  "text-chart-3",
  },
  {
    id:         "HR & Safety",
    to:         "/hr",
    desc:       "Workforce AI adoption, safety alerts & permit digitisation",
    Icon:       UsersRound,
    borderFull: "border-accent",
    bgColor:    "bg-accent/10",
    textColor:  "text-accent",
  },
  {
    id:         "IT & Cybersecurity",
    to:         "/it",
    desc:       "OT/IT threat status, patch compliance & ticket deflection",
    Icon:       Shield,
    borderFull: "border-destructive",
    bgColor:    "bg-destructive/10",
    textColor:  "text-destructive",
  },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function VisionPanel() {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex h-full flex-col items-center px-6 py-12">
      <div className="m-auto flex w-full flex-col items-center">

        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Select a Department
          </h1>
        </div>

        {/* Department cards */}
        <div className="grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-3">
          {DEPTS.map((dept) => (
            <Link key={dept.id} to={dept.to} className="group focus:outline-none">
              <Card className="relative h-full overflow-hidden border-border transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg rounded-xs">

                {/* Full border overlay on hover */}
                <div className={cn(
                  "pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                  dept.borderFull,
                )} />

                <CardContent className="flex h-full flex-col p-5">
                  {/* Icon */}
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-md", dept.bgColor)}>
                    <dept.Icon className={cn("h-4 w-4", dept.textColor)} />
                  </div>

                  {/* Text */}
                  <div className="mt-3">
                    <p className="font-heading text-base font-bold text-foreground">{dept.id}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{dept.desc}</p>
                  </div>

                  {/* CTA pinned to bottom */}
                  <p className={cn("mt-auto pt-4 text-[11px] font-semibold opacity-60 transition-opacity duration-150 group-hover:opacity-100", dept.textColor)}>
                    Open Dashboard &rarr;
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>


      </div>
    </div>
  );
}