import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, GraduationCap } from "lucide-react";
import { getMemberModuleData } from "@/data/members";
import { courses } from "@/data/courses";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MarcusDashboard = () => {
    const navigate = useNavigate();
  const memberId = "member-marcus";
  const courseId = courses[0].id;
  const moduleId = "module-1"; 

  const data = getMemberModuleData(memberId, courseId, moduleId);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
<header className="flex items-center justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
      Welcome, Marcus Smith
    </h1>
    <p className="text-slate-500 mt-2">
      Introduction to Data Structures — Module 1 Progress
    </p>
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

      {/* Changed to 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Test Score Card */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Test Score
            </CardTitle>
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
            <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Confidence
            </CardTitle>
            <Brain className="h-5 w-5 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-slate-900">
              {data.confidence}%
            </div>
            <Progress value={data.confidence} className="h-2 mt-4 bg-slate-100" />
            <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-tight">
              Self-reported level
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default MarcusDashboard;