import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, 
  BarChart, Bar, ReferenceLine, PieChart, Pie, Legend 
} from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ThresholdConfig, defaultThresholds, clusterColors, clusterMeta,
  ClusterName, getLearnerDataForModule, classifyStudent,
  getMasteryBarChartData, getClusterPieChartData
} from "@/data/masteryData";
import { courses } from "@/data/courses";
import { ThresholdSettings } from "@/components/mastery/ThresholdSettings";
import { ClusterBulkActions } from "@/components/mastery/ClusterBulkActions";

// --- Custom Label Math for the Pie Chart ---
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-bold pointer-events-none"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const MasteryPage = () => {
  const [selectedCourse, setSelectedCourse] = useState(courses[0].id);
  const [selectedModule, setSelectedModule] = useState("all");
  const [thresholds, setThresholds] = useState<ThresholdConfig>(defaultThresholds);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);

  const course = courses.find(c => c.id === selectedCourse)!;
  const currentModuleName = selectedModule === "all" ? "All Modules" : course.modules.find(m => m.id === selectedModule)?.name || selectedModule;

  const classifiedData = useMemo(
    () => getLearnerDataForModule(selectedCourse, selectedModule, thresholds),
    [selectedCourse, selectedModule, thresholds]
  );

  const clusterCounts = useMemo(() => {
    const counts: Record<ClusterName, number> = { mastery: 0, overconfident: 0, underconfident: 0, struggling: 0 };
    classifiedData.forEach(d => counts[d.cluster]++);
    return counts;
  }, [classifiedData]);

  const barChartData = useMemo(() => {
    return getMasteryBarChartData(selectedCourse, selectedModule);
  }, [selectedCourse, selectedModule]);

  const pieChartData = useMemo(() => {
    return getClusterPieChartData(selectedCourse, selectedModule, thresholds);
  }, [selectedCourse, selectedModule, thresholds]);

  const toggleCluster = (cluster: string) => {
    setSelectedClusters(prev =>
      prev.includes(cluster) ? prev.filter(c => c !== cluster) : [...prev, cluster]
    );
  };

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-slate-900/5 text-xs">
          <p className="font-semibold text-slate-900">{d.name}</p>
          <p className="text-slate-500">Score: {Math.round(d.score)}%</p>
          <p className="text-slate-500">Confidence: {Math.round(d.confidence)}%</p>
          <span
            className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: `${clusterColors[d.cluster as ClusterName]}20`, color: clusterColors[d.cluster as ClusterName] }}
          >
            {thresholds.labels[d.cluster as ClusterName]}
          </span>
        </div>
      );
    }
    return null;
  };

  const MasteryBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-slate-900/5 text-xs">
          <p className="font-semibold text-slate-900 mb-1">{label}</p>
          <p className="text-violet-700 font-medium">Mastery Rate: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="space-y-8">
        
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mastery Insights</h1>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">Analyze learner understanding beyond completion</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={selectedCourse} onValueChange={(v) => { setSelectedCourse(v); setSelectedModule("all"); }}>
              <SelectTrigger className="w-[280px] rounded-full border-slate-200"><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent className="rounded-2xl">
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-[200px] rounded-full border-slate-200"><SelectValue placeholder="Select module" /></SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">All Modules</SelectItem>
                {course.modules.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <ThresholdSettings thresholds={thresholds} onSave={setThresholds} />
          </div>
        </div>

        <TooltipProvider>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.entries(clusterMeta) as [ClusterName, typeof clusterMeta[ClusterName]][]).map(([key, info]) => {
              const count = clusterCounts[key];
              const pct = classifiedData.length > 0 ? Math.round((count / classifiedData.length) * 100) : 0;
              const customLabel = thresholds.labels[key];
              const color = clusterColors[key];

              return (
                <Tooltip key={key} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div 
                      className="relative rounded-[2rem] p-[2px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default text-left"
                      style={{
                        background: `linear-gradient(135deg, ${color} 0%, ${color}15 100%)`
                      }}
                    >
                      <Card className="h-full w-full rounded-[calc(2rem-2px)] border-0 shadow-none bg-white">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-[13px] font-bold text-slate-700">{customLabel}</span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-400 mb-4">{info.desc}</p>
                          <p className="text-4xl font-black tracking-tight text-slate-900">{count}</p>
                          <p className="text-sm text-slate-500 mt-2 font-medium">{pct}% of learners</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px] p-4 space-y-1.5 rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5" sideOffset={10}>
                    <p className="font-semibold text-sm text-slate-900">{customLabel}</p>
                    <p className="text-xs text-slate-500 font-medium">{info.desc}</p>
                    <p className="text-xs mt-1 text-slate-600 leading-relaxed">{info.characteristics}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        <Card className="rounded-[2rem]">
          <CardContent className="p-6">
            <ClusterBulkActions
              learners={classifiedData}
              selectedClusters={selectedClusters}
              onToggleCluster={toggleCluster}
              courseId={selectedCourse}
              thresholds={thresholds}
            />
          </CardContent>
        </Card>

        {/* Scatter plot */}
        <Card className="overflow-hidden rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-7">
            <div>
              <CardTitle className="text-base font-bold tracking-tight text-slate-900">Confidence vs. Score Matrix</CardTitle>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{classifiedData.length} learners · {currentModuleName}</p>
            </div>
            <div className="flex gap-3 text-[11px] flex-wrap">
              {(Object.entries(clusterColors) as [ClusterName, string][]).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: v }} />
                  {thresholds.labels[k as ClusterName]}
                </span>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-7 pb-7">
            <ResponsiveContainer width="100%" height={420}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <defs>
                  {Object.entries(clusterColors).map(([key, color]) => (
                    <filter key={`glow-${key}`} id={`glow-${key}`} height="400%" width="400%" x="-150%" y="-150%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  ))}
                </defs>
                
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" strokeOpacity={0.8} />
                <ReferenceLine x={thresholds.scoreThreshold} stroke="#94a3b8" strokeDasharray="4 4" opacity={0.6} />
                <ReferenceLine y={thresholds.confidenceThreshold} stroke="#94a3b8" strokeDasharray="4 4" opacity={0.6} />

                <XAxis type="number" dataKey="score" name="Score" domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false}
                  label={{ value: "Quiz Score (%)", position: "bottom", offset: 0, style: { fontSize: 13, fill: "#64748b", fontWeight: 500 } }} />
                <YAxis type="number" dataKey="confidence" name="Confidence" domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false}
                  label={{ value: "Self-Reported Confidence (%)", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 13, fill: "#64748b", fontWeight: 500 } }} />

                <RechartsTooltip content={<CustomScatterTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }} />

                <Scatter data={classifiedData}>
                  {classifiedData.map((entry, i) => (
                    <Cell 
                      key={i} 
                      fill={clusterColors[entry.cluster as ClusterName]} 
                      className="transition-all duration-300 ease-out cursor-pointer"
                      style={{ outline: 'none' }}
                      
                      /* INTERACTION LOGIC:
                        1. On enter: Increase radius (r) from default 4 to 8 and apply filter.
                        2. On leave: Return radius to 4 and remove filter.
                      */
                      onMouseEnter={(e: any) => {
                        e.target.setAttribute('filter', `url(#glow-${entry.cluster})`);
                        e.target.setAttribute('r', '8');
                      }}
                      onMouseLeave={(e: any) => {
                        e.target.removeAttribute('filter');
                        e.target.setAttribute('r', '4');
                      }}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-[2rem]">
            <CardHeader className="px-7 pt-7 pb-2">
              <CardTitle className="text-base font-bold tracking-tight text-slate-900">
                {selectedModule === "all" ? "Mastery Rate by Module" : `Mastery Rate by Quiz (${currentModuleName})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-7 pb-7">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barChartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={1} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} domain={[0, 100]} />
                  <RechartsTooltip cursor={{ fill: "#f8fafc" }} content={<MasteryBarTooltip />} />
                  <Bar dataKey="rate" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem]">
            <CardHeader className="px-7 pt-7 pb-2">
              <CardTitle className="text-base font-bold tracking-tight text-slate-900">
                {selectedModule === "all" ? "Overall Cluster Breakdown" : `Cluster Breakdown (${currentModuleName})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-7 pb-7">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <defs>
                    {Object.entries(clusterColors).map(([key, color]) => (
                      <radialGradient key={`grad-${key}`} id={`grad-${key}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.8} />
                      </radialGradient>
                    ))}
                  </defs>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="45%"
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {pieChartData.map((entry, index) => {
                      const clusterKey = (Object.keys(thresholds.labels) as ClusterName[]).find(
                        key => thresholds.labels[key] === entry.name
                      );
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#grad-${clusterKey})`} 
                          style={{ outline: 'none' }}
                        />
                      );
                    })}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", padding: "8px 12px" }}
                    itemStyle={{ color: "#0f172a", fontSize: "13px", fontWeight: 500 }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-slate-600 text-xs font-medium ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MasteryPage;