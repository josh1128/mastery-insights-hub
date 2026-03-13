import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { AuroraBackground } from "@/components/ui/aurora-background";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <AuroraBackground className="flex-1">
            <main className="flex-1 p-8 overflow-auto relative">
              <div className="relative z-10">
                {children}
              </div>
            </main>
          </AuroraBackground>
        </div>
      </div>
    </SidebarProvider>
  );
}
