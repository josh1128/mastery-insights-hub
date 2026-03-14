import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const LearnerHome = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-[2rem] bg-gradient-to-r from-violet-600 to-indigo-600 p-10 text-white">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, learner.</h1>
        <p className="mt-2 max-w-xl text-sm text-indigo-100">
          Continue your courses, check your mastery, and review any action items your instructor has assigned.
        </p>
        <div className="mt-6">
          <Link to="/learner/courses">
            <Button size="lg" className="rounded-full bg-white text-violet-700 hover:bg-slate-100">
              <BookOpen className="mr-2 h-4 w-4" />
              Go to my courses
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Step 1
            </p>
            <p className="text-sm font-semibold text-foreground">Open a course</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Choose the course you&apos;re currently working on from your course list.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Step 2
            </p>
            <p className="text-sm font-semibold text-foreground">Take the module quiz</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Complete the quiz with your confidence levels so your instructor sees both mastery and self-belief.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Step 3
            </p>
            <p className="text-sm font-semibold text-foreground">Review action items</p>
            <p className="mt-2 text-xs text-muted-foreground">
              After submitting, review any messages, materials, or retests your instructor has assigned to you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearnerHome;

