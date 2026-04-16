import { type RouteObject, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import SystemLayout from "./components/SystemLayout";
import LandingPage from "./pages/LandingPage";
import CommandCenter from "./pages/CommandCenter";
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
<<<<<<< HEAD
import NuroModels from "./pages/NuroModels";
import NuroForge from "./pages/NuroForge";
=======
//import NuroForge from ".pages/NuroForge";
>>>>>>> 58d4d16096adf55877aefcc244304fbb121bdb06
import NuroStack from "./pages/NuroStack";
import ConsolidatedDashboard from "./pages/ConsolidatedDashboard";
import VotingPage from "./pages/VotingPage"; // ← NEW


export const Routes: RouteObject[] = [
  {
    path: "/",
    children: [
      { index: true, element: <LandingPage /> },

      // ── Voting page — standalone (no sidebar layout) ──────────────────────
      { path: "voting", element: <VotingPage /> }, // ← NEW

      {
        element: <SystemLayout />,
        children: [
          { path: "vision-panel", element: <VisionPanel /> },
          { path: "nurostack", element: <NuroStack /> },
<<<<<<< HEAD
          { path: "nuromodels", element: <NuroModels /> },
          { path: "nuroforge", element: <NuroForge /> },
=======
          //{ path: "nuroforge", element: <nuroforge /> },
>>>>>>> 58d4d16096adf55877aefcc244304fbb121bdb06
        ],
      },
      {
        element: <Layout />,
        children: [
          { path: "command-center", element: <CommandCenter /> },
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
