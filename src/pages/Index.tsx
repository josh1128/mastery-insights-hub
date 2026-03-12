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
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="text-muted-foreground text-sm mt-1">Welcome back. Here's an overview of your platform.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <s.icon className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
            <p className="text-xs text-success font-medium mt-3">{s.change} this month</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">New Members</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={memberData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip />
              <Bar dataKey="members" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">New Members Today</span>
            <span className="text-2xl font-bold text-foreground">3</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">New This Week</span>
            <span className="text-2xl font-bold text-foreground">19</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">New This Month</span>
            <span className="text-2xl font-bold text-foreground">42</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Completion Rate</span>
            <span className="text-2xl font-bold text-foreground">68%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Index;
