import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, CheckCircle2 } from "lucide-react";
import { contentStore } from "@/data/contentStore";
import { toast } from "sonner";

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
  const learnerId = "member-1";

  const relatedLectures = quiz
    ? contentStore.getVideoLecturesByModule(quiz.courseId, quiz.moduleId)
    : [];
  const allLecturesCompleted =
    relatedLectures.length === 0 ||
    relatedLectures.every((l) => contentStore.isLectureCompleted(learnerId, l.id));

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [confidences, setConfidences] = useState<Record<string, ConfidenceLevel>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link to="/admin/content" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>
        <p className="text-muted-foreground">Quiz not found.</p>
      </div>
    );
  }

  // Lock screen
  if (!allLecturesCompleted) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 py-20 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>
        <p className="text-muted-foreground">Complete all lectures in this module first</p>
        <Link to="/courses">
          <Button variant="outline" className="rounded-full">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const cycleConfidence = (qId: string) => {
    setConfidences((prev) => {
      const current = prev[qId];
      const currentIdx = current ? confidenceOrder.indexOf(current) : -1;
      const nextIdx = (currentIdx + 1) % confidenceOrder.length;
      return { ...prev, [qId]: confidenceOrder[nextIdx] };
    });
  };

  const selectAnswer = (qId: string, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: value }));
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

  const quizScore = quiz.questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const quizTotal = quiz.questions.length;
  const confidencePercent =
    Object.values(confidences).filter(Boolean).length > 0
      ? Math.round(
          (Object.values(confidences).filter(Boolean) as ConfidenceLevel[]).reduce((sum, level) => {
            if (level === "not-sure") return sum + 20;
            if (level === "unsure") return sum + 50;
            return sum + 85;
          }, 0) / Object.values(confidences).filter(Boolean).length,
        )
      : 0;

  // Get the answer button color based on confidence for selected answers
  const getAnswerStyle = (qId: string, value: string) => {
    const isSelected = answers[qId] === value;
    const confidence = confidences[qId];

    if (!isSelected) {
      return "bg-card border border-border/40 text-foreground hover:bg-accent/50";
    }

    if (submitted) {
      const isCorrect = quiz.questions.find((q) => q.id === qId)?.correctAnswer === value;
      if (isCorrect) return "bg-[hsl(142_71%_45%)] text-white";
      return "bg-destructive text-destructive-foreground";
    }

    if (confidence) {
      return `text-white border-transparent`;
    }
    return "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow";
  };

  const getAnswerInlineStyle = (qId: string, value: string) => {
    const isSelected = answers[qId] === value;
    const confidence = confidences[qId];
    if (isSelected && confidence && !submitted) {
      return { backgroundColor: confidenceColors[confidence] };
    }
    return {};
  };

  // Completion screen
  if (submitted) {
    // Get instructor recommendations from interventions
    const interventions = contentStore.getInterventionsForLearner(learnerId);
    const recommendations = interventions
      .filter((i) => i.courseId === quiz.courseId && (i.type === "resource" || i.type === "message"))
      .map((i) => {
        if (i.type === "message" && i.message) return i.message;
        if (i.type === "resource" && i.contentId) {
          const res = contentStore.getResource(i.contentId);
          return res ? `Read: ${res.title}` : null;
        }
        return null;
      })
      .filter(Boolean);

    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in py-8">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-[hsl(142_71%_45%)]/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-[hsl(142_71%_45%)]" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Good Job! You Completed {quiz.title}!
          </h1>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-6 text-center space-y-2 shadow-glass">
            <p className="text-sm font-medium text-muted-foreground">Confidence Score</p>
            <p className="text-4xl font-bold text-foreground">{confidencePercent}%</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-6 text-center space-y-2 shadow-glass">
            <p className="text-sm font-medium text-muted-foreground">Correctness Score</p>
            <p className="text-4xl font-bold text-foreground">
              {quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Here are the action items recommended by your instructor:
            </p>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Link to="/courses">
            <Button variant="outline" className="rounded-full">Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in py-4">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">{quiz.title}</h1>
        {quiz.captureConfidence && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Click the button to change your confidence level.
            </p>
            <div className="flex items-center gap-4">
              {confidenceOrder.map(
                (level) =>
                  level && (
                    <span key={level} className="flex items-center gap-1.5 text-sm">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: confidenceColors[level] }}
                      />
                      {confidenceLabels[level]}
                    </span>
                  ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-6 space-y-4 shadow-glass"
          >
            <p className="text-base font-medium text-foreground">
              {idx + 1}. {q.text || `Question ${idx + 1}`}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Confidence button */}
              {quiz.captureConfidence && (
                <button
                  onClick={() => cycleConfidence(q.id)}
                  className="w-9 h-9 rounded-full border-2 border-border transition-all flex-shrink-0"
                  style={{
                    backgroundColor: confidences[q.id]
                      ? confidenceColors[confidences[q.id]!]
                      : "hsl(var(--muted))",
                    borderColor: confidences[q.id]
                      ? confidenceColors[confidences[q.id]!]
                      : undefined,
                  }}
                  title={
                    confidences[q.id]
                      ? confidenceLabels[confidences[q.id]!]
                      : "Click to set confidence"
                  }
                />
              )}

              {q.type === "true-false" ? (
                <>
                  {["true", "false"].map((val) => (
                    <button
                      key={val}
                      onClick={() => selectAnswer(q.id, val)}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${getAnswerStyle(q.id, val)}`}
                      style={getAnswerInlineStyle(q.id, val)}
                    >
                      {val === "true" ? "True" : "False"}
                    </button>
                  ))}
                </>
              ) : (
                <div className="w-full space-y-2 mt-1">
                  {(q.options || []).map((o) => (
                    <button
                      key={o.id}
                      onClick={() => selectAnswer(q.id, o.id)}
                      className={`w-full text-left px-5 py-3 rounded-xl text-sm font-medium transition-all ${getAnswerStyle(q.id, o.id)}`}
                      style={getAnswerInlineStyle(q.id, o.id)}
                    >
                      {o.text || "Option"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-center pb-8">
        <Button
          size="lg"
          onClick={handleSubmit}
          className="px-10 rounded-full shadow-glow"
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
