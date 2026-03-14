import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MasteryChart } from "@/components/dashboard/MasteryChart";
import { QuickStats } from "@/components/dashboard/QuickStats";

import { dashboardStats, masteryTrendData, dashboardQuickStats } from "@/data/dashboard";

const Index = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Welcome & High-level KPIs */}
      <DashboardHeader userName="Josh" stats={dashboardStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Main Visualization: Mastery Progress */}
        <MasteryChart data={masteryTrendData} /> 
        
        {/* 3. Sidebar: Quick breakdown */}
        <QuickStats items={dashboardQuickStats} />
      </div>
    </div>
  );
};

export default Index;