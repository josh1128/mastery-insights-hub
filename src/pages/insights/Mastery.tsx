import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar } from "recharts";
import {
  ThresholdConfig, defaultThresholds, clusterColors, clusterMeta,
  ClusterName, getLearnerDataForModule, classifyStudent,
} from "@/data/masteryData";
import { courses } from "@/data/courses";
import { members, getMemberModuleData } from "@/data/members";
import { ThresholdSettings } from "@/components/mastery/ThresholdSettings";
import { ClusterBulkActions } from "@/components/mastery/ClusterBulkActions";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-foreground">{d.name}</p>
        <p className="text-muted-foreground">Score: {Math.round(d.score)}%</p>
        <p className="text-muted-foreground">Confidence: {Math.round(d.confidence)}%</p>
        <Badge variant="secondary" className="mt-1 text-[10px]">{clusterMeta[d.cluster as ClusterName]?.label}</Badge>
      </div>
    );
  }
  return null;
};

const MasteryBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-muted-foreground">Mastery Rate: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const MasteryPage = () => {
  const [selectedCourse, setSelectedCourse] = useState(courses[0].id);
  const [selectedModule, setSelectedModule] = useState("all");
  const [thresholds, setThresholds] = useState<ThresholdConfig>(defaultThresholds);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);

  const course = courses.find(c => c.id === selectedCourse)!;

  const classifiedData = useMemo(
    () => getLearnerDataForModule(selectedCourse, selectedModule, thresholds),
    [selectedCourse, selectedModule, thresholds]
  );

  const clusterCounts = useMemo(() => {
    const counts: Record<ClusterName, number> = { mastery: 0, guessing: 0, misconception: 0, struggling: 0, developing: 0 };
    classifiedData.forEach(d => counts[d.cluster]++);
    return counts;
  }, [classifiedData]);

  const masteryDistribution = useMemo(() => {
    return course.modules.map(mod => {
      const enrolled = members.filter(m => m.enrolledCourseIds.includes(selectedCourse));
      const masteryCount = enrolled.filter(m => {
        const data = getMemberModuleData(m.id, selectedCourse, mod.id);
        return classifyStudent(data, thresholds) === "mastery";
      }).length;
      return { module: mod.name, mastery: Math.round((masteryCount / enrolled.length) * 100) };
    });
  }, [selectedCourse, thresholds, course.modules]);

  const toggleCluster = (cluster: string) => {
    setSelectedClusters(prev =>
      prev.includes(cluster) ? prev.filter(c => c !== cluster) : [...prev, cluster]
    );
  };

  // Clearly labeled cluster descriptions
  const clusterDescriptions: Record<ClusterName, string> = {
    mastery: "High Confidence + High Score",
    guessing: "High Score + Low Confidence",
    misconception: "Low Score + High Confidence",
    struggling: "Low Score + Low Confidence",
    developing: "Near Threshold (Transition Zone)",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mastery Insights</h1>
          <p className="text-muted-foreground text-sm mt-1">Analyze learner understanding beyond completion</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedCourse} onValueChange={(v) => { setSelectedCourse(v); setSelectedModule("all"); }}>
            <SelectTrigger className="w-[280px]"><SelectValue placeholder="Select course" /></SelectTrigger>
            <SelectContent>
              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select module" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {course.modules.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <ThresholdSettings thresholds={thresholds} onSave={setThresholds} />
        </div>
      </div>

      {/* Cluster summary cards with clear labels */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {(Object.entries(clusterMeta) as [ClusterName, typeof clusterMeta[ClusterName]][]).map(([key, info]) => {
          const count = clusterCounts[key];
          const pct = classifiedData.length > 0 ? Math.round((count / classifiedData.length) * 100) : 0;
          return (
            <Card key={key} className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: clusterColors[key] }} />
                  <span className="text-xs font-medium text-muted-foreground">{info.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">{clusterDescriptions[key]}</p>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground mt-1">{pct}% of learners</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cluster bulk actions */}
      <Card>
        <CardContent className="p-6">
          <ClusterBulkActions
            learners={classifiedData}
            selectedClusters={selectedClusters}
            onToggleCluster={toggleCluster}
            courseId={selectedCourse}
          />
        </CardContent>
      </Card>

      {/* Scatter plot */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Confidence vs. Score</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{classifiedData.length} learners · {course.name}</p>
          </div>
          <div className="flex gap-3 text-[11px] flex-wrap">
            {(Object.entries(clusterColors) as [ClusterName, string][]).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: v }} />
                {clusterMeta[k].label}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
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
              <Scatter data={classifiedData} fill="hsl(var(--primary))">
                {classifiedData.map((entry, i) => (
                  <Cell key={i} fill={clusterColors[entry.cluster]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastery distribution - purple color, percentages */}
        <Card>
          <CardHeader><CardTitle className="text-base">Mastery Rate by Module (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={masteryDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                <YAxis type="category" dataKey="module" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={120} />
                <Tooltip content={<MasteryBarTooltip />} />
                <Bar dataKey="mastery" radius={[0, 4, 4, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Module cluster breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base">Cluster Breakdown by Module</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {course.modules.map(mod => {
                const enrolled = members.filter(m => m.enrolledCourseIds.includes(selectedCourse));
                const counts: Record<string, number> = {};
                enrolled.forEach(m => {
                  const data = getMemberModuleData(m.id, selectedCourse, mod.id);
                  const cluster = classifyStudent(data, thresholds);
                  counts[cluster] = (counts[cluster] || 0) + 1;
                });
                const total = enrolled.length;
                return (
                  <div key={mod.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{mod.name}</span>
                      <button className="text-[10px] text-primary hover:underline" onClick={() => setSelectedModule(mod.id)}>View</button>
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
                  <span key={k} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: v }} />{clusterMeta[k].label}
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
