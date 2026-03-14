import {
  Home, BookOpen, MessageCircle,
  Users, FileText,
  TrendingUp, Brain
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Chat", url: "/chat", icon: MessageCircle },
];

const adminItems = [
  { title: "Members", url: "/admin/members", icon: Users },
  { title: "Content", url: "/admin/content", icon: FileText },
];

const insightItems = [
  { title: "Engagement", url: "/insights/engagement", icon: TrendingUp },
  { title: "Mastery", url: "/insights/mastery", icon: Brain },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const checkActive = (path: string) => location.pathname === path;

  const renderItems = (items: typeof mainItems) => (
    <SidebarMenu className="gap-0.5">
      {items.map((item) => {
        const active = checkActive(item.url);
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent">
              <NavLink
                to={item.url}
                end
                className={cn(
                  /* ALIGNMENT FIX: Set px-3 here so icons start at the exact same point as the labels */
                  "flex items-center w-full transition-all duration-150 py-2.5 px-3 rounded-lg",
                  active 
                    ? "bg-[#EEF2FF] text-[#4F46E5]" 
                    : "text-[#64748B] hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className={cn(
                  "flex items-center gap-3 w-full",
                  collapsed ? "justify-center" : "justify-start"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0",
                    active ? "text-[#4F46E5]" : "text-[#64748B]"
                  )} />
                  
                  {!collapsed && (
                    <span className="text-[15px] font-medium">
                      {item.title}
                    </span>
                  )}
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white">
      {/* Aligned Header to match the px-3 padding of the items below it */}
      <SidebarHeader className="pt-6 px-3 pb-4">
        <div className={cn(
          "flex items-center gap-3",
          collapsed ? "justify-center" : "justify-start"
        )}>
          <div className="h-10 w-10 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white shadow-sm shrink-0">
            <Brain className="h-6 w-6" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-[#1E293B] tracking-tight">
              Nuvance
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>{renderItems(mainItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          {!collapsed && (
            /* ALIGNMENT FIX: Set px-3 here to perfectly match the NavLink padding */
            <SidebarGroupLabel className="px-3 text-[11px] uppercase tracking-widest text-[#94A3B8] font-bold mb-2">
              Manage
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>{renderItems(adminItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          {!collapsed && (
            /* ALIGNMENT FIX: Set px-3 here to perfectly match the NavLink padding */
            <SidebarGroupLabel className="px-3 text-[11px] uppercase tracking-widest text-[#94A3B8] font-bold mb-2">
              Insights
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>{renderItems(insightItems)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}