import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";
import { contentStore } from "@/data/contentStore";
import { CURRENT_LEARNER_ID } from "@/lib/learnerIdentity";

type ConfidenceLevel = "not-sure" | "unsure" | "confident" | null;

const confidenceColors: Record<string, string> = {
  "not-sure": "hsl(0 72% 51%)",
  unsure: "hsl(45 93% 47%)",
  confident: "hsl(142 71% 45%)",
};

const confidenceLabels: Record<string, string> = {
  "not-sure": "Not sure",
  unsure: "Unsure",
  confident: "Confident",
};

const confidenceOrder: ConfidenceLevel[] = ["not-sure", "unsure", "confident"];

export default function LearnerQuiz() {
  const { quizId } = useParams();
  const quiz = contentStore.getQuiz(quizId || "");
  const learnerId = CURRENT_LEARNER_ID;

  const relatedLectures = quiz
    ? contentStore.getVideoLecturesByModule(quiz.courseId, quiz.moduleId)
    : [];
  const allLecturesCompleted =
    relatedLectures.length === 0 ||
    relatedLectures.every((l) => contentStore.isLectureCompleted(learnerId, l.id));

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [confidences, setConfidences] = useState<Record<string, ConfidenceLevel>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz) return <div className="p-8 text-center">Quiz not found.</div>;

  // Lock screen logic
  if (!allLecturesCompleted) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 py-20 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>
        <p className="text-muted-foreground">Complete all lectures in this module first</p>
        <Link to="/learner/courses">
          <Button variant="outline" className="rounded-full">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  // Combined Selection & Cycle Logic
  const handleAnswerSelect = (qId: string, value: string) => {
    if (submitted) return;

    const isCurrentlySelected = answers[qId] === value;

    if (isCurrentlySelected) {
      // Cycle confidence level if clicking the same answer
      const currentConf = confidences[qId];
      const currentIdx = currentConf ? confidenceOrder.indexOf(currentConf) : -1;
      const nextIdx = (currentIdx + 1) % confidenceOrder.length;
      setConfidences((prev) => ({ ...prev, [qId]: confidenceOrder[nextIdx] }));
    } else {
      // Set new selection and default to 'not-sure'
      setAnswers((prev) => ({ ...prev, [qId]: value }));
      setConfidences((prev) => ({ ...prev, [qId]: "not-sure" }));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const total = quiz.questions.length;
    const correct = quiz.questions.filter((q) => answers[q.id] === q.correctAnswer).length;

    const confidencesArray = Object.values(confidences).filter(Boolean) as ConfidenceLevel[];
    const averageConfidence =
      confidencesArray.length > 0
        ? Math.round(
            confidencesArray.reduce((sum, level) => {
              if (level === "not-sure") return sum + 20;
              if (level === "unsure") return sum + 50;
              return sum + 85;
            }, 0) / confidencesArray.length,
          )
        : null;

    contentStore.recordQuizResult({
      id: `qr-${Date.now()}`,
      learnerId,
      quizId: quiz.id,
      courseId: quiz.courseId,
      moduleId: quiz.moduleId,
      score: Math.round((correct / total) * 100),
      averageConfidence,
      isRetest: !!quiz.isRetest,
      submittedAt: new Date().toISOString(),
    });
  };

  const getAnswerStyle = (qId: string, value: string) => {
    const isSelected = answers[qId] === value;
    if (!isSelected) return "bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm";
    
    if (submitted) {
      const isCorrect = quiz.questions.find((q) => q.id === qId)?.correctAnswer === value;
      return isCorrect ? "bg-emerald-500 text-white border-transparent" : "bg-red-500 text-white border-transparent";
    }

    return "text-white border-transparent scale-[1.01] shadow-md";
  };

  const getAnswerInlineStyle = (qId: string, value: string) => {
    const isSelected = answers[qId] === value;
    const confidence = confidences[qId];
    if (isSelected && confidence && !submitted) {
      return { backgroundColor: confidenceColors[confidence] };
    }
    return {};
  };

  // Completion Screen
  if (submitted) {
    const quizScore = quiz.questions.filter((q) => answers[q.id] === q.correctAnswer).length;
    const scorePercent = Math.round((quizScore / quiz.questions.length) * 100);
    const confidencePercent = Math.round(
      (Object.values(confidences).filter(Boolean) as ConfidenceLevel[]).reduce((sum, level) => {
        if (level === "not-sure") return sum + 20;
        if (level === "unsure") return sum + 50;
        return sum + 85;
      }, 0) / quiz.questions.length
    );
    // Mastery = 50% assessment + 50% confidence
    const masteryPercent = Math.round((scorePercent + confidencePercent) / 2);

    const assignedResources = contentStore.getAssignedResourcesForLearner(learnerId, quiz.courseId, quiz.moduleId);
    const assignedRetest = contentStore.getAssignedRetestForLearner(learnerId, quiz.courseId, quiz.moduleId);
    const assignedMessages = contentStore.getAssignedMessagesForLearner(learnerId, quiz.courseId);
    const hasActionItems = assignedResources.length > 0 || !!assignedRetest || assignedMessages.length > 0;

    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in py-8">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quiz Complete!</h1>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quiz score</p>
            <p className="text-4xl font-black text-slate-900">{scorePercent}%</p>
          </div>
          <div className="rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confidence score</p>
            <p className="text-4xl font-black text-slate-900">{confidencePercent}%</p>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mastery score</p>
          <p className="text-2xl font-bold text-slate-900">{masteryPercent}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            50% quiz performance + 50% confidence
          </p>
        </div>

        {hasActionItems && (
          <div className="rounded-[2rem] border border-primary/20 bg-primary/5 p-6 space-y-4">
            <p className="text-sm font-semibold text-slate-900">Action items from your instructor</p>
            <p className="text-xs text-muted-foreground">
              Your instructor has shared the following for you:
            </p>
            <div className="space-y-3">
              {assignedMessages.map((m) => (
                <div key={m.id} className="rounded-lg border border-primary/20 bg-white p-3 text-sm">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Message</p>
                  <p className="text-foreground">{m.text}</p>
                </div>
              ))}
              {assignedResources.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-primary/20 bg-white p-3">
                  <span className="text-sm font-medium">{r.title}</span>
                  <span className="text-xs text-muted-foreground">{r.fileType.toUpperCase()}</span>
                </div>
              ))}
              {assignedRetest && (
                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-white p-3">
                  <span className="text-sm font-medium">{assignedRetest.title}</span>
                  <Link to={`/learn/quiz/${assignedRetest.id}`}>
                    <Button size="sm" variant="default" className="rounded-full">Take retest</Button>
                  </Link>
                </div>
              )}
            </div>
            <Link to={`/learner/courses/${quiz.courseId}`}>
              <Button variant="default" size="sm" className="rounded-full">
                View course
              </Button>
            </Link>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <Link to={`/learner/courses/${quiz.courseId}`}>
            <Button variant="default" className="rounded-full px-8">Back to Course</Button>
          </Link>
          <Link to="/learner/courses"><Button variant="outline" className="rounded-full px-8">All Courses</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-fade-in py-8">
      {/* 1. VISUAL INSTRUCTION HEADER */}
      <div className="rounded-[2rem] border-2 border-slate-100 bg-slate-50/50 p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{quiz.title}</h1>
          <p className="text-slate-500 text-sm font-medium">Follow the click guide below to set your confidence:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100">
            <div className="h-7 w-7 rounded-full bg-red-500 flex items-center justify-center text-white font-bold shrink-0 text-xs">1</div>
            <div>
              <p className="text-xs font-bold text-slate-900">1st Click</p>
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">Not Sure</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100">
            <div className="h-7 w-7 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold shrink-0 text-xs">2</div>
            <div>
              <p className="text-xs font-bold text-slate-900">2nd Click</p>
              <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-tight">Unsure</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100">
            <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shrink-0 text-xs">3</div>
            <div>
              <p className="text-xs font-bold text-slate-900">3rd Click</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Confident</p>
            </div>
          </div>
        </div>
        
        <p className="text-[11px] text-slate-400 italic text-center">
          Click your chosen answer again to cycle through these levels.
        </p>
      </div>

      {/* 2. THE QUESTIONS */}
      <div className="space-y-12">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="space-y-4">
            <p className="text-lg font-bold text-slate-900 leading-snug">
              {idx + 1}. {q.text}
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {q.type === "true-false" ? (
                <div className="flex gap-2">
                  {["true", "false"].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleAnswerSelect(q.id, val)}
                      className={`flex-1 py-4 rounded-2xl text-sm font-medium transition-all border-2 ${getAnswerStyle(q.id, val)}`}
                      style={getAnswerInlineStyle(q.id, val)}
                    >
                      {val === "true" ? "True" : "False"}
                    </button>
                  ))}
                </div>
              ) : (
                (q.options || []).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => handleAnswerSelect(q.id, o.id)}
                    className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-medium transition-all border-2 ${getAnswerStyle(q.id, o.id)}`}
                    style={getAnswerInlineStyle(q.id, o.id)}
                  >
                    {o.text}
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. SUBMIT */}
      <div className="flex justify-center pt-8 pb-16">
        <Button 
          size="lg" 
          onClick={handleSubmit} 
          className="px-12 rounded-full h-14 text-base font-bold bg-violet-600 hover:bg-violet-700 shadow-xl transition-all hover:scale-105"
        >
          Submit Quiz
        </Button>
      </div>
    </div>
  );
}