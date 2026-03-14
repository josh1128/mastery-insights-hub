import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LearnerSidebar } from "./LearnerSidebar";
import { Outlet } from "react-router-dom";

// 1. ADD 'export' HERE
export const LearnerLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <LearnerSidebar />
        <main className="flex-1 p-8">
          <SidebarTrigger className="mb-4 lg:hidden" />
          {/* Outlet is where MarcusDashboard will appear */}
          <Outlet /> 
        </main>
      </div>
    </SidebarProvider>
  );
};