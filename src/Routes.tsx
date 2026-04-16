import { type RouteObject, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import SystemLayout from "./components/SystemLayout";
import LandingPage from "./pages/LandingPage";

import AgentNetwork from "./pages/AgentNetwork";
import SupplyChain from "./pages/SupplyChain";
import Manufacturing from "./pages/Manufacturing";
import Commercial from "./pages/Commercial";
import Finance from "./pages/Finance";
import Hr from "./pages/Hr";
import ItCybersecurity from "./pages/It & cybersecurity";
import EosAssistant from "./pages/EosAssistant";
import Settings from "./pages/Settings";
import VisionPanel from "./VisionPanel";
import NuroModels from "./pages/NuroModels";
import NuroForge from "./pages/NuroForge";
import NuroStack from "./pages/NuroStack";
import Nexus from "./pages/Nexus";
import NuroVault from "./pages/NuroVault";
import ConsolidatedDashboard from "./pages/ConsolidatedDashboard";
import VotingPage from "./pages/VotingPage";
import MobileVotePage from "./pages/MobileVotePage"; // ← NEW


export const Routes: RouteObject[] = [
  {
    path: "/",
    children: [
      { index: true, element: <LandingPage /> },

      // ── Voting presenter screen (standalone, no sidebar) ───────────────────
      { path: "voting", element: <VotingPage /> },

      // ── Mobile voting page — scanned via QR code ──────────────────────────
      // Accessible at /vote on any device on the same network/domain
      { path: "vote", element: <MobileVotePage /> },

      {
        element: <SystemLayout />,
        children: [
          { path: "vision-panel", element: <VisionPanel /> },
          { path: "nurostack", element: <NuroStack /> },
          { path: "nuromodels", element: <NuroModels /> },
          { path: "nuroforge", element: <NuroForge /> },

          {path: "nexus", element: <Nexus/>},
          {path: "nurovault", element: <NuroVault/>}
        ],
      },
      {
        element: <Layout />,
        children: [
         
          { path: "agents", element: <AgentNetwork /> },
          { path: "supply-chain", element: <SupplyChain /> },
          { path: "manufacturing", element: <Manufacturing /> },
          { path: "commercial", element: <Commercial /> },
          { path: "finance", element: <Finance /> },
          { path: "hr", element: <Hr /> },
          { path: "it", element: <ItCybersecurity /> },
          { path: "assistant", element: <EosAssistant /> },
          { path: "settings", element: <Settings /> },
          { path: "consolidated-dashboard", element: <ConsolidatedDashboard /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];
