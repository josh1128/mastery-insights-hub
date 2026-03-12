import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar } from "recharts";
import { Brain, AlertTriangle, TrendingDown, Eye, MessageSquare, PlayCircle, BookOpen, Send } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Generate scatter data
const generateScatter = () => {
  const data = [];
  // High confidence, high score (mastery)
  for (let i = 0; i < 25; i++) data.push({ confidence: 70 + Math.random() * 30, score: 70 + Math.random() * 30, name: `Student ${i + 1}`, cluster: "mastery" });
  // Low confidence, high score (guessing)
  for (let i = 0; i < 8; i++) data.push({ confidence: 15 + Math.random() * 30, score: 70 + Math.random() * 25, name: `Student ${i + 26}`, cluster: "guessing" });
  // High confidence, low score (misconception)
  for (let i = 0; i < 10; i++) data.push({ confidence: 65 + Math.random() * 30, score: 15 + Math.random() * 35, name: `Student ${i + 34}`, cluster: "misconception" });
  // Low confidence, low score (struggling)
  for (let i = 0; i < 12; i++) data.push({ confidence: 10 + Math.random() * 35, score: 10 + Math.random() * 35, name: `Student ${i + 44}`, cluster: "struggling" });
  return data;
};

const scatterData = generateScatter();

const clusterColors: Record<string, string> = {
  mastery: "hsl(var(--chart-success))",
  guessing: "hsl(var(--chart-info))",
  misconception: "hsl(var(--chart-danger))",
  struggling: "hsl(var(--chart-warning))",
};

const masteryDistribution = [
  { module: "SOC 2", mastery: 82 },
  { module: "GDPR", mastery: 71 },
  { module: "Phishing", mastery: 88 },
  { module: "Data Class.", mastery: 64 },
  { module: "Incident Resp.", mastery: 73 },
  { module: "Final", mastery: 59 },
];

const clusterSummary = [
  { label: "Mastery Achieved", count: 25, color: "text-success", icon: Brain, desc: "High confidence + high score" },
  { label: "Possible Guessing", count: 8, color: "text-chart-info", icon: Eye, desc: "Low confidence + high score" },
  { label: "Misconception Risk", count: 10, color: "text-destructive", icon: AlertTriangle, desc: "High confidence + low score" },
  { label: "Struggling", count: 12, color: "text-warning", icon: TrendingDown, desc: "Low confidence + low score" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-foreground">{d.name}</p>
        <p className="text-muted-foreground">Score: {Math.round(d.score)}%</p>
        <p className="text-muted-foreground">Confidence: {Math.round(d.confidence)}%</p>
        <Badge variant="secondary" className="mt-1 capitalize text-[10px]">{d.cluster}</Badge>
      </div>
    );
  }
  return null;
};

const MasteryPage = () => {
  const [selectedModule, setSelectedModule] = useState("all");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mastery Insights</h1>
          <p className="text-muted-foreground text-sm mt-1">Analyze learner understanding beyond completion</p>
        </div>
        <Select value={selectedModule} onValueChange={setSelectedModule}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            <SelectItem value="soc2">SOC 2</SelectItem>
            <SelectItem value="gdpr">GDPR</SelectItem>
            <SelectItem value="phishing">Phishing</SelectItem>
            <SelectItem value="dataclass">Data Classification</SelectItem>
            <SelectItem value="incident">Incident Response</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cluster summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {clusterSummary.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-accent flex items-center justify-center`}>
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{c.count}</p>
                  <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">{c.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main scatter plot */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Confidence vs. Score</CardTitle>
          <div className="flex gap-3 text-[11px]">
            {Object.entries(clusterColors).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5 capitalize text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: v }} />
                {k}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" dataKey="score" name="Score" domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                label={{ value: "Quiz Score (%)", position: "bottom", offset: 0, style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" } }} />
              <YAxis type="number" dataKey="confidence" name="Confidence" domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                label={{ value: "Self-Reported Confidence (%)", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" } }} />
              <Tooltip content={<CustomTooltip />} />
              {/* Quadrant lines */}
              <Scatter data={scatterData} fill="hsl(var(--primary))">
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={clusterColors[entry.cluster]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mastery distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Mastery Distribution by Module</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={masteryDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="module" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={90} />
                <Tooltip />
                <Bar dataKey="mastery" radius={[0, 4, 4, 0]}>
                  {masteryDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.mastery >= 75 ? "hsl(var(--chart-success))" : entry.mastery >= 60 ? "hsl(var(--chart-warning))" : "hsl(var(--chart-danger))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Instructor actions */}
        <Card>
          <CardHeader><CardTitle className="text-base">Instructor Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Take action on struggling learners or at-risk groups.</p>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <PlayCircle className="h-4 w-4 text-primary" />
                  Recommend Rewatching Videos
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>Recommend Content</SheetTitle></SheetHeader>
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">Select students from the misconception or struggling clusters to recommend rewatching specific module videos.</p>
                  <div className="border rounded-lg p-3 space-y-2">
                    <p className="text-sm font-medium">10 students with misconceptions</p>
                    <p className="text-xs text-muted-foreground">Modules: GDPR, Data Classification</p>
                  </div>
                  <Button className="w-full">Send Recommendation</Button>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Assign Extra Practice
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>Assign Practice</SheetTitle></SheetHeader>
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">Create practice assignments for students below the mastery threshold.</p>
                  <div className="border rounded-lg p-3 space-y-2">
                    <p className="text-sm font-medium">12 struggling students</p>
                    <p className="text-xs text-muted-foreground">Average score: 28%, Confidence: 22%</p>
                  </div>
                  <Button className="w-full">Assign Practice</Button>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" className="w-full justify-start gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Send Message to Learner
            </Button>

            <Button variant="outline" className="w-full justify-start gap-2">
              <Send className="h-4 w-4 text-primary" />
              Trigger Group Intervention
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasteryPage;
