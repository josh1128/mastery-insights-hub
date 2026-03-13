import { Users, BookOpen, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { members } from "@/data/members";
import { courses } from "@/data/courses";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { ArcDecoration, FloatingShapes } from "@/components/decorative/PageDecorations";

const statItems: BentoItem[] = [
  {
    title: "Total Members",
    description: "Active members enrolled across all courses on the platform.",
    icon: <Users className="h-5 w-5" />,
    meta: members.length.toString(),
    status: "Live",
    tags: ["Members", "Growth"],
    cta: "+12% this month",
  },
  {
    title: "Active Courses",
    description: "Courses currently available for learner enrollment.",
    icon: <BookOpen className="h-5 w-5" />,
    meta: `${courses.length} active`,
    status: "Active",
    tags: ["Courses"],
    cta: `${courses.length} active`,
  },
  {
    title: "Avg Mastery",
    description: "Average mastery score across all enrolled learners.",
    icon: <TrendingUp className="h-5 w-5" />,
    meta: "78%",
    status: "Tracking",
    tags: ["Insights", "AI"],
    cta: "+5% this month",
  },
  {
    title: "Certificates Issued",
    description: "Total certificates awarded to learners upon course completion.",
    icon: <Award className="h-5 w-5" />,
    meta: "342",
    status: "Updated",
    tags: ["Awards"],
    cta: "+28 this month",
  },
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
    <div className="relative rounded-3xl bg-gradient-to-br from-primary via-primary-glow to-primary p-10 shadow-glow-lg overflow-hidden">
      <ArcDecoration className="-top-20 -right-20" />
      <FloatingShapes />
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-primary-foreground">Welcome back 👋</h1>
        <p className="text-primary-foreground/70 text-base mt-2 max-w-lg">
          Here's an overview of your learning platform. Track member growth, mastery, and engagement all in one place.
        </p>
      </div>
      <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full border-2 border-primary-foreground/10" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full border border-primary-foreground/5" />
    </div>

    {/* Stat cards as bento grid */}
    <BentoGrid items={statItems} columns={4} />

    {/* Charts */}
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
                  background: "hsla(0, 0%, 100%, 0.9)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid hsl(var(--border) / 0.4)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 24px hsl(240 70% 60% / 0.1)",
                }}
              />
              <Bar dataKey="members" fill="url(#primaryGradient)" radius={[8, 8, 0, 0]} />
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
