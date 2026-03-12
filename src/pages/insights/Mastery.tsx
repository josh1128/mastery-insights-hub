import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar } from "recharts";
import { Brain, AlertTriangle, TrendingDown, Eye, MessageSquare, PlayCircle, BookOpen, Send, Settings, RefreshCw, FileText, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

// --- Thresholds ---
interface ClusterThresholds {
  scoreThreshold: number;
  confidenceThreshold: number;
}

const defaultThresholds: ClusterThresholds = { scoreThreshold: 50, confidenceThreshold: 50 };

// --- Module-specific student data ---
interface StudentPoint {
  name: string;
  confidence: number;
  score: number;
}

const generateModuleData = (seed: number): StudentPoint[] => {
  const rng = (s: number) => { s = Math.sin(s) * 10000; return s - Math.floor(s); };
  const data: StudentPoint[] = [];
  for (let i = 0; i < 55; i++) {
    const r1 = rng(seed + i * 7);
    const r2 = rng(seed + i * 13 + 3);
    data.push({
      name: `Student ${i + 1}`,
      confidence: Math.round(r1 * 100),
      score: Math.round(r2 * 100),
    });
  }
  return data;
};

const moduleDataMap: Record<string, { label: string; data: StudentPoint[] }> = {
  all: { label: "All Modules", data: generateModuleData(42) },
  soc2: { label: "SOC 2", data: generateModuleData(101) },
  gdpr: { label: "GDPR", data: generateModuleData(202) },
  phishing: { label: "Phishing", data: generateModuleData(303) },
  dataclass: { label: "Data Classification", data: generateModuleData(404) },
  incident: { label: "Incident Response", data: generateModuleData(505) },
  final: { label: "Final Assessment", data: generateModuleData(606) },
};

// --- Cluster classification ---
type ClusterName = "mastery" | "guessing" | "misconception" | "struggling" | "developing";

const clusterColors: Record<ClusterName, string> = {
  mastery: "hsl(var(--chart-success))",
  guessing: "hsl(var(--chart-info))",
  misconception: "hsl(var(--chart-danger))",
  struggling: "hsl(var(--chart-warning))",
  developing: "hsl(var(--chart-primary))",
};

const clusterMeta: Record<ClusterName, { label: string; icon: typeof Brain; desc: string; colorClass: string }> = {
  mastery: { label: "Mastery Achieved", icon: Brain, desc: "High confidence + high score", colorClass: "text-success" },
  guessing: { label: "Possible Guessing", icon: Eye, desc: "Low confidence + high score", colorClass: "text-chart-info" },
  misconception: { label: "Misconception Risk", icon: AlertTriangle, desc: "High confidence + low score", colorClass: "text-destructive" },
  struggling: { label: "Struggling", icon: TrendingDown, desc: "Low confidence + low score", colorClass: "text-warning" },
  developing: { label: "Developing", icon: Sparkles, desc: "Near threshold (transition zone)", colorClass: "text-primary" },
};

function classifyStudent(s: StudentPoint, t: ClusterThresholds): ClusterName {
  const margin = 10; // developing zone
  const nearScore = Math.abs(s.score - t.scoreThreshold) < margin;
  const nearConf = Math.abs(s.confidence - t.confidenceThreshold) < margin;
  if (nearScore || nearConf) {
    // Check if truly in a corner or in the transition zone
    if (nearScore && nearConf) return "developing";
  }
  if (s.score >= t.scoreThreshold && s.confidence >= t.confidenceThreshold) return "mastery";
  if (s.score >= t.scoreThreshold && s.confidence < t.confidenceThreshold) return "guessing";
  if (s.score < t.scoreThreshold && s.confidence >= t.confidenceThreshold) return "misconception";
  return "struggling";
}

// --- Custom Tooltip ---
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

// ========== MAIN COMPONENT ==========
const MasteryPage = () => {
  const [selectedModule, setSelectedModule] = useState("all");
  const [thresholds, setThresholds] = useState<ClusterThresholds>(defaultThresholds);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedClusters, setSelectedClusters] = useState<Set<ClusterName>>(new Set());

  // Bulk action dialogs
  const [massMessageOpen, setMassMessageOpen] = useState(false);
  const [massMessageText, setMassMessageText] = useState("");
  const [retestOpen, setRetestOpen] = useState(false);

  // Classified data
  const classifiedData = useMemo(() => {
    const raw = moduleDataMap[selectedModule]?.data || moduleDataMap.all.data;
    return raw.map(s => ({ ...s, cluster: classifyStudent(s, thresholds) }));
  }, [selectedModule, thresholds]);

  const clusterCounts = useMemo(() => {
    const counts: Record<ClusterName, number> = { mastery: 0, guessing: 0, misconception: 0, struggling: 0, developing: 0 };
    classifiedData.forEach(s => counts[s.cluster]++);
    return counts;
  }, [classifiedData]);

  // Mastery distribution per module
  const masteryDistribution = useMemo(() => {
    return Object.entries(moduleDataMap)
      .filter(([k]) => k !== "all")
      .map(([k, v]) => {
        const classified = v.data.map(s => classifyStudent(s, thresholds));
        const masteryCount = classified.filter(c => c === "mastery").length;
        return { module: v.label, mastery: Math.round((masteryCount / v.data.length) * 100) };
      });
  }, [thresholds]);

  // Selected cluster students
  const selectedStudents = useMemo(() => {
    if (selectedClusters.size === 0) return [];
    return classifiedData.filter(s => selectedClusters.has(s.cluster));
  }, [classifiedData, selectedClusters]);

  const toggleCluster = (cluster: ClusterName) => {
    setSelectedClusters(prev => {
      const next = new Set(prev);
      next.has(cluster) ? next.delete(cluster) : next.add(cluster);
      return next;
    });
  };

  const sendMassMessage = () => {
    if (!massMessageText.trim()) return;
    toast.success(`Message sent to ${selectedStudents.length} students`);
    setMassMessageText("");
    setMassMessageOpen(false);
  };

  const createRetest = () => {
    toast.success(`Retest created and sent to ${selectedStudents.length} students`);
    setRetestOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mastery Insights</h1>
          <p className="text-muted-foreground text-sm mt-1">Analyze learner understanding beyond completion</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(moduleDataMap).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Cluster Thresholds</DialogTitle></DialogHeader>
              <div className="space-y-6 pt-2">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Score threshold</span>
                    <span className="font-medium text-foreground">{thresholds.scoreThreshold}%</span>
                  </div>
                  <Slider value={[thresholds.scoreThreshold]} min={10} max={90} step={5}
                    onValueChange={([v]) => setThresholds(prev => ({ ...prev, scoreThreshold: v }))} />
                  <p className="text-[11px] text-muted-foreground mt-1">Students scoring below this are classified as low-performing</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Confidence threshold</span>
                    <span className="font-medium text-foreground">{thresholds.confidenceThreshold}%</span>
                  </div>
                  <Slider value={[thresholds.confidenceThreshold]} min={10} max={90} step={5}
                    onValueChange={([v]) => setThresholds(prev => ({ ...prev, confidenceThreshold: v }))} />
                  <p className="text-[11px] text-muted-foreground mt-1">Students with confidence below this are classified as low-confidence</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => { setThresholds(defaultThresholds); toast.info("Thresholds reset to defaults"); }}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset to Defaults
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cluster summary cards with selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {(Object.keys(clusterMeta) as ClusterName[]).map(key => {
          const c = clusterMeta[key];
          const isSelected = selectedClusters.has(key);
          return (
            <Card key={key} className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm"}`}
              onClick={() => toggleCluster(key)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                    <c.icon className={`h-4 w-4 ${c.colorClass}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{clusterCounts[key]}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">{c.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox checked={isSelected} className="h-3.5 w-3.5" />
                  <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bulk actions bar */}
      {selectedClusters.size > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {selectedStudents.length} students selected from {selectedClusters.size} cluster{selectedClusters.size > 1 ? "s" : ""}
                </span>
                <div className="flex gap-1 ml-2">
                  {Array.from(selectedClusters).map(c => (
                    <Badge key={c} variant="secondary" className="capitalize text-[10px]">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Dialog open={massMessageOpen} onOpenChange={setMassMessageOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" /> Mass Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Send Message to {selectedStudents.length} Students</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="flex gap-1 flex-wrap">
                        {Array.from(selectedClusters).map(c => (
                          <Badge key={c} variant="secondary" className="capitalize text-xs">{clusterMeta[c].label}</Badge>
                        ))}
                      </div>
                      <Textarea placeholder="Write your message..." value={massMessageText} onChange={e => setMassMessageText(e.target.value)} className="min-h-[100px]" />
                      <Button onClick={sendMassMessage} className="w-full"><Send className="h-3.5 w-3.5 mr-1" /> Send to All</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={retestOpen} onOpenChange={setRetestOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Create Retest
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create Retest for {selectedStudents.length} Students</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <p className="text-sm text-muted-foreground">A new retest will be created for the selected module and sent to all students in the selected clusters.</p>
                      <div className="border rounded-lg p-3 space-y-1">
                        <p className="text-sm font-medium">Module: {moduleDataMap[selectedModule]?.label}</p>
                        <p className="text-xs text-muted-foreground">{selectedStudents.length} students will receive the retest link</p>
                      </div>
                      <Button onClick={createRetest} className="w-full">Create & Send Retest</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { toast.success(`Extra resources assigned to ${selectedStudents.length} students`); }}>
                  <BookOpen className="h-3.5 w-3.5" /> Assign Resources
                </Button>

                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { toast.success(`Video recommendation sent to ${selectedStudents.length} students`); }}>
                  <PlayCircle className="h-3.5 w-3.5" /> Recommend Videos
                </Button>

                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setSelectedClusters(new Set())}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scatter plot */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Confidence vs. Score</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Module: {moduleDataMap[selectedModule]?.label}</p>
          </div>
          <div className="flex gap-3 text-[11px] flex-wrap">
            {(Object.entries(clusterColors) as [ClusterName, string][]).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5 capitalize text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: v }} />
                {k}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" dataKey="score" name="Score" domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                label={{ value: "Quiz Score (%)", position: "bottom", offset: 0, style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" } }} />
              <YAxis type="number" dataKey="confidence" name="Confidence" domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                label={{ value: "Self-Reported Confidence (%)", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" } }} />
              <Tooltip content={<CustomTooltip />} />
              {/* Threshold reference lines rendered as cartesian grid overlay */}
              <Scatter data={classifiedData} fill="hsl(var(--primary))">
                {classifiedData.map((entry, i) => (
                  <Cell key={i} fill={clusterColors[entry.cluster]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
            <span>Score threshold: <strong className="text-foreground">{thresholds.scoreThreshold}%</strong></span>
            <span>Confidence threshold: <strong className="text-foreground">{thresholds.confidenceThreshold}%</strong></span>
            <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-3 w-3 mr-1" /> Adjust
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mastery distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Mastery Rate by Module</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={masteryDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="module" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={100} />
                <Tooltip />
                <Bar dataKey="mastery" radius={[0, 4, 4, 0]}>
                  {masteryDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.mastery >= 60 ? "hsl(var(--chart-success))" : entry.mastery >= 40 ? "hsl(var(--chart-warning))" : "hsl(var(--chart-danger))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Module cluster breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base">Cluster Breakdown by Module</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(moduleDataMap).filter(([k]) => k !== "all").map(([k, v]) => {
                const classified = v.data.map(s => classifyStudent(s, thresholds));
                const counts: Record<string, number> = {};
                classified.forEach(c => counts[c] = (counts[c] || 0) + 1);
                const total = classified.length;
                return (
                  <div key={k} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{v.label}</span>
                      <Button variant="ghost" size="sm" className="h-5 text-[10px] text-primary" onClick={() => setSelectedModule(k)}>View</Button>
                    </div>
                    <div className="flex h-3 rounded-full overflow-hidden bg-accent">
                      {(Object.keys(clusterColors) as ClusterName[]).map(cluster => {
                        const pct = ((counts[cluster] || 0) / total) * 100;
                        if (pct === 0) return null;
                        return <div key={cluster} style={{ width: `${pct}%`, backgroundColor: clusterColors[cluster] }} className="transition-all" />;
                      })}
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-3 text-[10px] text-muted-foreground pt-2 flex-wrap">
                {(Object.entries(clusterColors) as [ClusterName, string][]).map(([k, v]) => (
                  <span key={k} className="flex items-center gap-1 capitalize">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: v }} />{k}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasteryPage;
