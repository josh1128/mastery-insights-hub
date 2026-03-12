import { Search, Bell, HelpCircle, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4">
      <SidebarTrigger className="mr-2" />
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 bg-secondary border-0 h-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bookmark className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8 ml-2">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
