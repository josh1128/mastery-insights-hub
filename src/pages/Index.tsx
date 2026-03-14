import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { members } from "@/data/members";
import { courses } from "@/data/courses";

const stats = [
  { label: "Total Members", value: members.length.toString(), icon: Users, change: "+12%" },
  { label: "Active Courses", value: courses.length.toString(), icon: BookOpen, change: `${courses.length} active` },
  { label: "Avg Mastery", value: "78%", icon: TrendingUp, change: "+5%" },
  { label: "Certificates Issued", value: "342", icon: Award, change: "+28" },
];

const memberData = [
  { week: "Jan 6", members: 12 },
  { week: "Jan 13", members: 8 },
  { week: "Jan 20", members: 18 },
  { week: "Jan 27", members: 14 },
  { week: "Feb 3", members: 22 },
  { week: "Feb 10", members: 15 },
  { week: "Feb 17", members: 19 },
  { week: "Feb 24", members: 11 },
];

const Index = () => (
  <div className="space-y-8 animate-fade-in">
    
    {/* HERO SECTION: Clean, solid gradient banner instead of glassmorphism */}
    <div className="relative rounded-[2rem] bg-gradient-to-r from-violet-600 to-indigo-600 p-10 overflow-hidden shadow-sm">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, Josh!</h1>
        <p className="text-indigo-100 mt-2 max-w-lg text-sm leading-relaxed font-medium">
          Here's an overview of your learning platform. Track member growth, mastery, and engagement all in one place.
        </p>
      </div>
      {/* Subtle modern geometric accents */}
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full border-[1.5rem] border-white/5" />
      <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full border-[1rem] border-white/5" />
    </div>

    {/* STATS GRID: Removed 'glass-card', relies on the rounded-[2rem] from your Card.tsx */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

    {/* CHARTS & QUICK STATS */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* BAR CHART */}
      <Card className="lg:col-span-2">
        <CardHeader className="px-7 pt-7 pb-2">
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight">New Members</CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              {/* Cleaned up axes and grid to match the Mastery page */}
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              
              {/* Solid white tooltip instead of blur */}
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  color: "#0f172a",
                  fontWeight: 500,
                  fontSize: "13px"
                }}
              />
              <Bar dataKey="members" fill="url(#primaryGradient)" radius={[6, 6, 0, 0]} maxBarSize={50} />
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" /> {/* Violet-600 */}
                  <stop offset="100%" stopColor="#4f46e5" /> {/* Indigo-600 */}
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* QUICK STATS */}
      <Card>
        <CardHeader className="px-7 pt-7 pb-2">
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7 space-y-6 mt-4">
          {[
            { label: "New Members Today", value: "3" },
            { label: "New This Week", value: "19" },
            { label: "New This Month", value: "42" },
            { label: "Completion Rate", value: "68%" },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <span className="text-sm font-medium text-slate-500">{item.label}</span>
              <span className="text-xl font-bold text-slate-900">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  </div>
);

export default Index;