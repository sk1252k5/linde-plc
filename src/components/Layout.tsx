import { Outlet } from "react-router-dom";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import AppSidebar from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutButton } from "./logout-button";

function Layout() {
  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties}>
      <AppSidebar/>
      <SidebarInset>
        <header className="flex border-b shrink-0 items-center justify-between gap-2 h-12 px-2">
          <div className="flex items-center gap-1">
            <SidebarTrigger className="-ml-1" size="icon-lg" />
            <Separator orientation="vertical" className="mr-2" />
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;