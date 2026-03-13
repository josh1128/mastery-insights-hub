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
  <div className="space-y-10 animate-fade-in">
    {/* Hero section */}
    <div className="rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-primary p-8 shadow-elevated">
      <h1 className="text-3xl font-bold text-primary-foreground">Welcome back 👋</h1>
      <p className="text-primary-foreground/70 text-base mt-2 max-w-lg">
        Here's an overview of your learning platform. Track member growth, mastery, and engagement all in one place.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((s) => (
        <Card key={s.label} className="hover:shadow-elevated transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1.5">{s.value}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                <s.icon className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
            <p className="text-xs text-success font-semibold mt-3">{s.change} this month</p>
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 4px 16px hsl(240 70% 60% / 0.08)",
                }}
              />
              <Bar dataKey="members" fill="url(#primaryGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { label: "New Members Today", value: "3" },
            { label: "New This Week", value: "19" },
            { label: "New This Month", value: "42" },
            { label: "Completion Rate", value: "68%" },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-2xl font-bold text-foreground">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Index;
