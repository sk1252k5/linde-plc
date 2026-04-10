import { Outlet, useLocation } from "react-router-dom";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import AppSidebar from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutButton } from "./logout-button";

const PAGE_META: Record<string, { title: string; section: string }> = {
  "/": { title: "Command Center", section: "Core" },
  "/agents": { title: "AI Agent Network", section: "Core" },
  "/supply-chain": { title: "Supply Chain", section: "Departments" },
  "/manufacturing": { title: "Manufacturing", section: "Departments" },
  "/commercial": { title: "Commercial & Trading", section: "Departments" },
  "/finance": { title: "Finance & ERP", section: "Departments" },
};

function Layout() {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] ?? { title: "EOS Platform", section: "" };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex border-b shrink-0 items-center justify-between gap-2 h-12 px-3">
          {/* Left */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" size="icon-lg" />
            <Separator orientation="vertical" className="mx-1" />
            <div className="flex items-center gap-2">
              {meta.section && (
                <>
                  <span className="text-xs text-muted-foreground hidden md:block">
                    {meta.section}
                  </span>
                  <span className="text-muted-foreground/40 hidden md:block text-xs">/</span>
                </>
              )}
              <span className="text-sm font-semibold text-foreground font-heading">
                {meta.title}
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Separator orientation="vertical" className="mx-1" />
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
              <span className="h-5 w-5 rounded-full bg-primary/20 inline-flex items-center justify-center text-[10px] font-bold text-primary">
                KR
              </span>
              VP Supply Chain
            </div>
            <Separator orientation="vertical" className="mx-1" />
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-5">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
