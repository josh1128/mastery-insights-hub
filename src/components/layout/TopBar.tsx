import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const TopBar = () => {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="text-sm font-medium text-slate-500">Instructor Dashboard</div>

      <div className="flex items-center gap-4">
        {/* Now this will work because it's using the real Button component */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/learner/dashboard")}
          className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold rounded-full px-4 h-9 transition-all active:scale-95"
        >
          <GraduationCap className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">Switch to Learner</span>
        </Button>

        <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none">Josh</p>
            <p className="text-[10px] text-slate-400 mt-1">Instructor</p>
          </div>
          <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-100">
            <AvatarImage src="/josh-avatar.png" />
            <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">J</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};