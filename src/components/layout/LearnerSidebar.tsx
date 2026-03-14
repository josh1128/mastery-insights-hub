import { Home, BookOpen, MessageCircle, Orbit } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader
} from "@/components/ui/sidebar";

const learnerItems = [
    { title: "My Dashboard", url: "/learner/dashboard", icon: Home },
    { title: "My Courses", url: "/learner/courses", icon: BookOpen },
  { title: "Message Josh", url: "/learner/chat", icon: MessageCircle }, // Direct to instructor
];

export function LearnerSidebar() {
    return (
      <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white">
        <SidebarHeader className="pt-6 px-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Orbit className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Student Portal</span>
          </div>
        </SidebarHeader>
  
        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarMenu className="gap-0.5">
              {learnerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => cn(
                        "flex items-center w-full py-2.5 px-3 rounded-lg transition-all",
                        isActive 
                          ? "bg-indigo-50 text-indigo-600 font-bold" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-3 shrink-0" />
                      <span className="text-[15px]">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }