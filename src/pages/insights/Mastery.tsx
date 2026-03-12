import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar } from "recharts";
import {
  ThresholdConfig, defaultThresholds, clusterColors, clusterMeta,
  classifyStudent, moduleDataMap, ClusterName, LearnerDataPoint,
} from "@/data/masteryData";
import { ThresholdSettings } from "@/components/mastery/ThresholdSettings";
import { ClusterBulkActions } from "@/components/mastery/ClusterBulkActions";

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

const MasteryPage = () => {
  const [selectedModule, setSelectedModule] = useState("all");
  const [thresholds, setThresholds] = useState<ThresholdConfig>(defaultThresholds);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);

  // Classified data
  const classifiedData: LearnerDataPoint[] = useMemo(() => {
    const raw = moduleDataMap[selectedModule]?.data || moduleDataMap.all.data;
    return raw.map(s => ({ ...s, cluster: classifyStudent(s, thresholds) }));
  }, [selectedModule, thresholds]);

  // Mastery distribution per module
  const masteryDistribution = useMemo(() => {
    return Object.entries(moduleDataMap)
      .filter(([k]) => k !== "all")
      .map(([, v]) => {
        const classified = v.data.map(s => classifyStudent(s, thresholds));
        const masteryCount = classified.filter(c => c === "mastery").length;
        return { module: v.label, mastery: Math.round((masteryCount / v.data.length) * 100) };
      });
  }, [thresholds]);

  const toggleCluster = (cluster: string) => {
    setSelectedClusters(prev =>
      prev.includes(cluster) ? prev.filter(c => c !== cluster) : [...prev, cluster]
    );
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
          <ThresholdSettings thresholds={thresholds} onSave={setThresholds} />
        </div>
      </div>

      {/* Cluster bulk actions */}
      <Card>
        <CardContent className="p-5">
          <ClusterBulkActions
            learners={classifiedData}
            selectedClusters={selectedClusters}
            onToggleCluster={toggleCluster}
          />
        </CardContent>
      </Card>

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
                      <button className="text-[10px] text-primary hover:underline" onClick={() => setSelectedModule(k)}>View</button>
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
