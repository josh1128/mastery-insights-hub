import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Target } from "lucide-react";
import { getMemberModuleData } from "@/data/members";
import { courses } from "@/data/courses";
import { contentStore } from "@/data/contentStore";
import { toast } from "sonner"; // Assuming you're using sonner for notifications

const MarcusDashboard = () => {
  // Use the ID we hardcoded in members.ts
  const memberId = "member-marcus";
  const courseId = courses[0].id;
  const moduleId = "module-1"; 

  // Pulls the latest data (either hardcoded 0 or real results from contentStore)
  const data = getMemberModuleData(memberId, courseId, moduleId);

  /**
   * This function bridges the gap between the Learner and Instructor view.
   * It saves a result to the shared contentStore.
   */
  const handleSimulateMastery = () => {
    contentStore.saveQuizResult(memberId, courseId, moduleId, {
      score: 100,
      averageConfidence: 100,
      answers: [],
      completedAt: new Date().toISOString(),
    });

    toast.success("Module Mastered! Instructor view updated.");
    
    // Refresh to reflect the new state from the store
    setTimeout(() => {
        window.location.reload();
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome, Marcus Smith</h1>
        <p className="text-slate-500 mt-2">Introduction to Data Structures — Module 1 Progress</p>
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

        {/* Status Hint / Interaction Card */}
        <div className="md:col-span-1 flex items-center">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-200 w-full relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-xl">Current Goal</h3>
              <p className="text-indigo-100 text-sm mt-3 leading-relaxed font-medium">
                {data.score === 0 
                  ? "You are currently marked as 'Struggling' in the instructor dashboard. Complete a module to update your status!" 
                  : "Great work! You've mastered this module. Check out the next topic."}
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
    </div>
  );
};

export default MarcusDashboard;