import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileDown, TrendingUp, Users, Eye, Clock } from "lucide-react";

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

const EngagementPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">Engagement analytics across your platform</p>
      </div>
      <div className="flex items-center gap-3">
        <Select defaultValue="30">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Previous 7 days</SelectItem>
            <SelectItem value="30">Previous 30 days</SelectItem>
            <SelectItem value="90">Previous 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <FileDown className="h-4 w-4 mr-1" /> Export as PDF
        </Button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <s.icon className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
            <p className="text-xs text-success font-medium mt-2">{s.change} vs previous period</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base">New Members</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={memberData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip />
              <Bar dataKey="members" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Engagement Trends</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="completions" stroke="hsl(var(--chart-success))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default EngagementPage;
