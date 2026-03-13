import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileDown, TrendingUp, Users, Eye, Clock } from "lucide-react";
import { PageGlow } from "@/components/decorative/PageDecorations";

const memberData = [
  { week: "Jan 6", members: 2 }, { week: "Jan 13", members: 1 }, { week: "Jan 20", members: 3 },
  { week: "Jan 27", members: 1 }, { week: "Feb 3", members: 2 }, { week: "Feb 10", members: 5 },
  { week: "Feb 17", members: 1 }, { week: "Feb 24", members: 1 },
];

const engagementData = [
  { day: "Mon", views: 45, completions: 12 }, { day: "Tue", views: 52, completions: 18 },
  { day: "Wed", views: 49, completions: 15 }, { day: "Thu", views: 63, completions: 22 },
  { day: "Fri", views: 38, completions: 10 }, { day: "Sat", views: 15, completions: 4 },
  { day: "Sun", views: 12, completions: 3 },
];

const stats = [
  { label: "Total Views", value: "3,421", icon: Eye, change: "+18%" },
  { label: "Avg. Time Spent", value: "24m", icon: Clock, change: "+5%" },
  { label: "Active Learners", value: "186", icon: Users, change: "+12" },
  { label: "Completion Rate", value: "68%", icon: TrendingUp, change: "+3%" },
];

const tooltipStyle = {
  background: "hsla(0, 0%, 100%, 0.9)",
  backdropFilter: "blur(12px)",
  border: "1px solid hsl(var(--border) / 0.4)",
  borderRadius: "16px",
  boxShadow: "0 4px 24px hsl(240 70% 60% / 0.1)",
};

const EngagementPage = () => (
  <div className="space-y-8 animate-fade-in relative">
    <PageGlow />
    <div className="relative z-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insights</h1>
          <p className="text-muted-foreground text-sm mt-1">Engagement analytics across your platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px] rounded-full">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Previous 7 days</SelectItem>
              <SelectItem value="30">Previous 30 days</SelectItem>
              <SelectItem value="90">Previous 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="rounded-full">
            <FileDown className="h-4 w-4 mr-1" /> Export as PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <Card key={s.label} className="hover:shadow-glow transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1.5">{s.value}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center group-hover:shadow-glow transition-all">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-success font-semibold mt-3">{s.change} vs previous period</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">New Members</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="members" fill="url(#engGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="engGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Engagement Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="completions" stroke="hsl(var(--chart-success))" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default EngagementPage;
