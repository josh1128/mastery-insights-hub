import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, GraduationCap, BookOpen } from "lucide-react";
import { courses } from "@/data/courses";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { contentStore } from "@/data/contentStore";
import { useSyncExternalStore } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const memberId = "member-marcus";

export default function MarcusDashboard() {
  const navigate = useNavigate();

  // Re-render whenever contentStore changes (quiz submissions etc.)
  useSyncExternalStore(
    (cb) => contentStore.subscribe(cb),
    () => contentStore.getQuizzes()
  );

  const enrolledCourse = courses[0];
  const allModules = enrolledCourse.modules;

  // Pull latest result per module
  const moduleResults = allModules.map((mod) => {
    const result = contentStore.getLatestQuizResultForModule(memberId, enrolledCourse.id, mod.id);
    return { mod, result };
  });

  const completedModules = moduleResults.filter((m) => m.result != null);
  const totalModules = allModules.length;

  // Averages only across completed (graded) modules
  const avgScore =
    completedModules.length > 0
      ? Math.round(completedModules.reduce((sum, m) => sum + (m.result?.score ?? 0), 0) / completedModules.length)
      : 0;

  const avgConfidence =
    completedModules.length > 0
      ? Math.round(
          completedModules.reduce((sum, m) => sum + (m.result?.averageConfidence ?? 0), 0) /
            completedModules.length
        )
      : 0;

  const completionPct = Math.round((completedModules.length / totalModules) * 100);

  // Mastery trend — one point per completed module in order
  const trendData = completedModules.map(({ mod, result }) => ({
    name: mod.name,
    score: result?.score ?? 0,
    confidence: result?.averageConfidence ?? 0,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome, Marcus Smith</h1>
          <p className="text-slate-500 mt-2">{enrolledCourse.name} — Progress Overview</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold rounded-full px-4 h-9 transition-all active:scale-95"
        >
          <GraduationCap className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">Switch to Instructor</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completion */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Completion
            </CardTitle>
            <BookOpen className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-slate-900">{completionPct}%</div>
            <Progress value={completionPct} className="h-2 mt-4 bg-slate-100" />
            <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tight">
              {completedModules.length} of {totalModules} modules graded
            </p>
          </CardContent>
        </Card>

        {/* Avg Score */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Avg Score
            </CardTitle>
            <Target className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-slate-900">{avgScore}%</div>
            <Progress value={avgScore} className="h-2 mt-4 bg-slate-100" />
            <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tight">
              {completedModules.length > 0 ? "Across graded modules" : "No quizzes submitted yet"}
            </p>
          </CardContent>
        </Card>

        {/* Avg Confidence */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Avg Confidence
            </CardTitle>
            <Brain className="h-5 w-5 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-slate-900">{avgConfidence}%</div>
            <Progress value={avgConfidence} className="h-2 mt-4 bg-slate-100" />
            <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tight">
              Self-reported across graded modules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mastery Trend */}
      <Card className="border-none shadow-sm bg-white rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Mastery Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              Complete your first quiz to start tracking your progress.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "12px" }}
                  formatter={(value: number, name: string) => [`${value}%`, name === "score" ? "Score" : "Confidence"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3, fill: "#a78bfa", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {trendData.length > 0 && (
            <div className="flex gap-4 mt-3 justify-end">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="inline-block w-4 h-0.5 bg-indigo-500 rounded" />
                Score
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="inline-block w-4 h-0.5 bg-violet-400 rounded" style={{ borderTop: "2px dashed #a78bfa", background: "none" }} />
                Confidence
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}