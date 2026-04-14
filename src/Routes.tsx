import { type RouteObject, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
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
import HomePage from "./HomePage";

export const Routes: RouteObject[] = [
  {
    path: "/",
    children: [
      { index: true, element: <LandingPage /> },
      { path: "home", element: <HomePage /> },
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
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];
