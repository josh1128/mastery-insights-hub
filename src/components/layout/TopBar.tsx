import { Search, Bell, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-card/70 backdrop-blur-xl px-6">
      <SidebarTrigger className="mr-2" />
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search anything..."
            className="pl-10 bg-muted/50 border-0 h-10 rounded-xl focus:bg-card focus:shadow-soft transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-xl">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-xl">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <div className="ml-2 h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-soft">
          <span className="text-primary-foreground text-xs font-bold">JD</span>
        </div>
      </div>
    </header>
  );
}
