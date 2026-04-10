import { type RouteObject } from "react-router-dom";
import Layout from "./components/Layout";
import CommandCenter from "./pages/CommandCenter";
import AgentNetwork from "./pages/AgentNetwork";
import SupplyChain from "./pages/SupplyChain";
import Manufacturing from "./pages/Manufacturing";
import Commercial from "./pages/Commercial";
import Finance from "./pages/Finance";
import Hr from "./pages/hr";
import ItCybersecurity from "./pages/It & cybersecurity";
export const Routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <CommandCenter /> },
      { path: "agents", element: <AgentNetwork /> },
      { path: "supply-chain", element: <SupplyChain /> },
      { path: "manufacturing", element: <Manufacturing /> },
      { path: "commercial", element: <Commercial /> },
      { path: "finance", element: <Finance /> },
      { path: "hr", element: <Hr /> },
      { path: "it", element: <ItCybersecurity /> }
    ],
  },
];
