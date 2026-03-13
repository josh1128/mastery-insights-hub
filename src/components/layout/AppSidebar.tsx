import {
  Home, BookOpen, MessageCircle,
  Users, FileText,
  Zap, TrendingUp, Brain, Award
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  { title: "Automations", url: "/admin/automations", icon: Zap },
];

const insightItems = [
  { title: "Engagement", url: "/insights/engagement", icon: TrendingUp },
  { title: "Mastery", url: "/insights/mastery", icon: Brain },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const renderItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive(item.url)}>
            <NavLink to={item.url} end activeClassName="bg-accent text-accent-foreground font-semibold">
              <item.icon className="h-4 w-4" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-5">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-soft">
              <Brain className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">Nuvance</span>
          </div>
        )}
        {collapsed && (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto shadow-soft">
            <Brain className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="scrollbar-thin px-2">
        <SidebarGroup>
          <SidebarGroupContent>{renderItems(mainItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold">
            {!collapsed && "Admin"}
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(adminItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold">
            {!collapsed && "Insights"}
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(insightItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/certificates")}>
                  <NavLink to="/certificates" end activeClassName="bg-accent text-accent-foreground font-semibold">
                    <Award className="h-4 w-4" />
                    {!collapsed && <span>Certificates</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
