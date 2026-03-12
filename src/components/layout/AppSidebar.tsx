import {
  Home, BookOpen, Calendar, MessageCircle, Shield,
  LayoutDashboard, Users, FileText, CalendarDays, Package,
  Zap, BarChart3, MessageSquare, TrendingUp, Brain, Award
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
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Chat", url: "/chat", icon: MessageCircle },
];

const adminItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Members", url: "/admin/members", icon: Users },
  { title: "Content", url: "/admin/content", icon: FileText },
  { title: "Events", url: "/admin/events", icon: CalendarDays },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Automations", url: "/admin/automations", icon: Zap },
];

const insightItems = [
  { title: "Engagement", url: "/insights/engagement", icon: TrendingUp },
  { title: "Messages", url: "/insights/messages", icon: MessageSquare },
  { title: "Products", url: "/insights/products", icon: BarChart3 },
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
            <NavLink to={item.url} end activeClassName="bg-accent text-accent-foreground font-medium">
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
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Nuvance</span>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="scrollbar-thin">
        <SidebarGroup>
          <SidebarGroupContent>{renderItems(mainItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {!collapsed && "Admin"}
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(adminItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {!collapsed && "Insights"}
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(insightItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/certificates")}>
                  <NavLink to="/certificates" end activeClassName="bg-accent text-accent-foreground font-medium">
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
