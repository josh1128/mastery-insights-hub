import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, CheckCircle2, Lock } from "lucide-react";
import { getMemberModuleData } from "@/data/members";
import { courses } from "@/data/courses";
import { contentStore } from "@/data/contentStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const MarcusDashboard = () => {
  // Use the ID we hardcoded in members.ts
  const memberId = "member-marcus";
  const courseId = courses[0].id;
  const moduleId = "module-1";

  // Pulls the latest data (either hardcoded 0 or real results from contentStore)
  const data = getMemberModuleData(memberId, courseId, moduleId);

  const learnerModules = useMemo(
    () => contentStore.getLearnerModuleStates(memberId, courseId),
    [memberId, courseId],
  );

  const reviewItems = useMemo(() => {
    const interventions = contentStore.getInterventionsForLearner(memberId).filter(
      (i) => i.courseId === courseId,
    );

    return interventions.map((intv) => {
      if (intv.type === "retest" && intv.contentId) {
        const quiz = contentStore.getQuiz(intv.contentId);
        return quiz
          ? {
              id: intv.id,
              label: "Attempt Retest Quiz",
              description: quiz.title,
            }
          : null;
      }

      if (intv.type === "resource" && intv.contentId) {
        const res = contentStore.getResource(intv.contentId);
        return res
          ? {
              id: intv.id,
              label: "Review Resource",
              description: res.title,
            }
          : null;
      }

      if (intv.type === "message" && intv.message) {
        return {
          id: intv.id,
          label: "Instructor Note",
          description: intv.message,
        };
      }

      return null;
    }).filter(Boolean) as { id: string; label: string; description: string }[];
  }, [memberId, courseId]);

  /**
   * This function bridges the gap between the Learner and Instructor view.
   * It saves a result to the shared contentStore.
   */
  const handleSimulateMastery = () => {
    contentStore.saveQuizResult(memberId, courseId, moduleId, {
      score: 100,
      averageConfidence: 100,
      completedAt: new Date().toISOString(),
    });

    toast.success("Module Mastered! Instructor view updated.");
    
    setTimeout(() => {
        window.location.reload();
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome, Marcus Smith
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Introduction to Data Structures · Mastery-gated learning path
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Test Score Card */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">Test Score</CardTitle>
            <Target className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-slate-900">{data.score}%</div>
            <Progress value={data.score} className="h-2 mt-4 bg-slate-100" />
            <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tight">
              {data.score > 0 ? "Highest Achievement" : "Last attempt: Not completed"}
            </p>
          </CardContent>
        </Card>

        {/* Confidence Card */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">Confidence</CardTitle>
            <Brain className="h-5 w-5 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-slate-900">{data.confidence}%</div>
            <Progress value={data.confidence} className="h-2 mt-4 bg-slate-100" />
            <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tight">Self-reported level</p>
          </CardContent>
        </Card>

        {/* Status Hint / Action Card */}
        <div className="md:col-span-1 flex items-center">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-200 w-full relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-xl">Current Goal</h3>
              <p className="text-indigo-100 text-sm mt-3 leading-relaxed font-medium">
                {data.score === 0
                  ? "You are currently marked as “Struggling”. Work through your review tasks and retests to unlock the next module."
                  : data.score >= 80
                  ? "Great work! You’ve mastered this module. Your next module will unlock automatically."
                  : "You’re on your way. Lift this score above 80% to fully unlock the next topic."}
              </p>
              
              <button 
                onClick={handleSimulateMastery}
                className="mt-6 bg-white text-indigo-600 px-6 py-3 rounded-full text-xs font-black hover:bg-indigo-50 transition-all active:scale-95 shadow-md uppercase tracking-wider"
              >
                {data.score === 0 ? "Simulate 100% Mastery" : "Review Module"}
              </button>
            </div>
            
            {/* Decorative background shapes */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
          </div>
        </div>
      </div>

      {/* Mastery-gated module strip */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-[0.16em]">
            Learning Path
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">
            Score ≥ 80% unlocks the next module
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
          <AnimatePresence initial={false}>
            {learnerModules.map((mod) => {
              const isMastered = mod.status === "Mastered";
              const isLocked = !mod.unlocked;

              return (
                <motion.div
                  key={mod.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className={`min-w-[220px] rounded-2xl border px-4 py-3.5 flex items-center justify-between gap-3 shadow-sm ${
                    isLocked
                      ? "border-slate-200 bg-slate-50/60 text-slate-400"
                      : isMastered
                      ? "border-emerald-500/70 bg-emerald-50 text-emerald-800"
                      : "border-indigo-500/60 bg-indigo-50 text-indigo-900"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">
                      {isLocked
                        ? "Locked"
                        : isMastered
                        ? "Mastered"
                        : "In Progress"}
                    </p>
                    <p className="text-sm font-semibold truncate">{mod.name}</p>
                    <p className="text-[11px] opacity-80">
                      {mod.latestScore != null ? `Best score: ${mod.latestScore}%` : "Not attempted yet"}
                    </p>
                  </div>
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-white/80 shadow-sm border border-white/60">
                    {isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : isMastered ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* Review Required section when Marcus is struggling/developing */}
      {reviewItems.length > 0 && data.score < 80 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-[0.16em]">
            Review Required
          </h2>
          <Card className="border-dashed border-slate-200 bg-white/80 rounded-2xl shadow-sm">
            <CardContent className="p-5 space-y-3">
              <p className="text-xs text-slate-500">
                Your instructor has assigned the following actions to help you move from{" "}
                <span className="font-semibold text-red-500">Struggling</span> toward{" "}
                <span className="font-semibold text-emerald-600">Mastery</span>.
              </p>
              <ul className="space-y-2">
                {reviewItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-2.5"
                  >
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-800">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};

export default MarcusDashboard;