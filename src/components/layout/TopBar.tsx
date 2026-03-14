import { Search, Bell, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLearnerMode = location.pathname.startsWith("/learner") || location.pathname.startsWith("/learn/");

  const handleSwitchMode = () => {
    if (isLearnerMode) {
      navigate("/");
    } else {
      navigate("/learner");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/95 backdrop-blur-sm px-6">
      <SidebarTrigger className="mr-1 sm:mr-2 shrink-0" />
      
      {/* Search Container */}
      <div className="flex-1 min-w-0 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search anything..."
            className="w-full pl-10 bg-muted/40 border-0 h-9 sm:h-10 text-sm sm:text-base rounded-full focus:bg-card focus:shadow-sm transition-all"
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="ml-auto flex items-center gap-1 sm:gap-3 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex rounded-full text-xs font-medium"
          onClick={handleSwitchMode}
        >
          {isLearnerMode ? "Instructor view" : "Learner view"}
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-slate-100">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-muted-foreground rounded-full hover:bg-slate-100">
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        
        <div className="ml-1 sm:ml-2 h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
          JD
        </div>
      </div>
    </header>
  );
}