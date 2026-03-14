import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, Award, LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
  change: string;
}

interface DashboardHeaderProps {
  userName: string;
  stats: StatItem[];
}

export const DashboardHeader = ({ userName, stats }: DashboardHeaderProps) => {
  return (
    <div className="space-y-8">
      {/* HERO SECTION */}
      <div className="relative rounded-[2rem] bg-gradient-to-r from-violet-600 to-indigo-600 p-10 overflow-hidden shadow-sm">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-indigo-100 mt-2 max-w-lg text-sm leading-relaxed font-medium">
            Here's an overview of your learning platform. Track member growth, mastery, and engagement all in one place.
          </p>
        </div>
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full border-[1.5rem] border-white/5" />
        <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full border-[1rem] border-white/5" />
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="group cursor-default">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{s.label}</p>
                  <p className="text-3xl font-bold mt-1.5 text-slate-900 tracking-tight">{s.value}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                  <s.icon className="h-6 w-6 text-violet-600" />
                </div>
              </div>
              <p className="text-xs text-emerald-600 font-bold mt-4 tracking-wide bg-emerald-50 inline-block px-2 py-1 rounded-md">
                {s.change} <span className="text-emerald-600/70 font-medium">this month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};