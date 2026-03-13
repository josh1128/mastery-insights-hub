import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import { contentStore } from "@/data/contentStore";
import { toast } from "sonner";

type ConfidenceLevel = "not-sure" | "unsure" | "confident" | null;

const confidenceColors: Record<string, string> = {
  "not-sure": "hsl(0 72% 51%)",
  "unsure": "hsl(45 93% 47%)",
  "confident": "hsl(142 71% 45%)",
};

const confidenceLabels: Record<string, string> = {
  "not-sure": "Not sure",
  "unsure": "Unsure",
  "confident": "Confident",
};

const confidenceOrder: ConfidenceLevel[] = ["not-sure", "unsure", "confident"];

export default function LearnerQuiz() {
  const { quizId } = useParams();
  const quiz = contentStore.getQuiz(quizId || "");
  const learnerId = "member-1"; // demo learner identifier used across learner views

  const relatedLectures = quiz
    ? contentStore.getVideoLecturesByModule(quiz.courseId, quiz.moduleId)
    : [];
  const hasRequiredLecture = relatedLectures.length > 0;
  const hasCompletedAnyLecture =
    hasRequiredLecture &&
    relatedLectures.some((l) => contentStore.isLectureCompleted(learnerId, l.id));

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

  const cycleConfidence = (qId: string) => {
    setConfidences(prev => {
      const current = prev[qId];
      const currentIdx = current ? confidenceOrder.indexOf(current) : -1;
      const nextIdx = (currentIdx + 1) % confidenceOrder.length;
      return { ...prev, [qId]: confidenceOrder[nextIdx] };
    });
  };

  const selectAnswer = (qId: string, value: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const total = quiz.questions.length;
    const correct = quiz.questions.filter(q => answers[q.id] === q.correctAnswer).length;
    toast.success(`Quiz submitted! Score: ${correct}/${total}`);

    const confidencesArray = Object.values(confidences).filter(Boolean) as ConfidenceLevel[];
    const averageConfidence =
      confidencesArray.length > 0
        ? Math.round(
            (confidencesArray.reduce((sum, level) => {
              if (level === "not-sure") return sum + 20;
              if (level === "unsure") return sum + 50;
              return sum + 85;
            }, 0) /
              confidencesArray.length),
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

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{quiz.title}</h1>
          {quiz.captureConfidence && (
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="text-muted-foreground">Click the button to change your confidence level.</span>
              <div className="flex items-center gap-3">
                {confidenceOrder.map(level => level && (
                  <span key={level} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: confidenceColors[level] }} />
                    {confidenceLabels[level]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {hasRequiredLecture && !hasCompletedAnyLecture && (
        <div className="rounded-3xl border border-border/50 bg-accent/10 px-6 py-4 flex items-center gap-3">
          <Lock className="h-4 w-4 text-primary" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Quiz locked</p>
            <p className="text-muted-foreground">
              Complete the associated lecture for this module before taking the quiz.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-card/80 backdrop-blur-sm border border-border/40 p-6 md:p-8 space-y-8 shadow-glass">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="space-y-4">
            <p className="text-base font-medium text-foreground">
              {q.text || `Question ${idx + 1}`}
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              {q.type === "true-false" ? (
                <>
                  {quiz.captureConfidence && (
                    <button
                      onClick={() => !submitted && cycleConfidence(q.id)}
                      className="w-8 h-8 rounded-full border-2 border-border transition-all flex-shrink-0"
                      style={{
                        backgroundColor: confidences[q.id] ? confidenceColors[confidences[q.id]!] : "hsl(var(--muted))",
                        borderColor: confidences[q.id] ? confidenceColors[confidences[q.id]!] : undefined,
                      }}
                      title={confidences[q.id] ? confidenceLabels[confidences[q.id]!] : "Click to set confidence"}
                    />
                  )}
                  {["true", "false"].map(val => (
                    <button
                      key={val}
                      onClick={() => selectAnswer(q.id, val)}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                        answers[q.id] === val
                          ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow"
                          : "bg-card border border-border/40 text-foreground hover:bg-accent/50"
                      } ${submitted && q.correctAnswer === val ? "ring-2 ring-success" : ""} ${submitted && answers[q.id] === val && q.correctAnswer !== val ? "ring-2 ring-destructive" : ""}`}
                    >
                      {val === "true" ? "True" : "False"}
                    </button>
                  ))}
                </>
              ) : (
                <div className="w-full space-y-2">
                  <div className="flex items-center gap-3 mb-2">
                    {quiz.captureConfidence && (
                      <button
                        onClick={() => !submitted && cycleConfidence(q.id)}
                        className="w-8 h-8 rounded-full border-2 border-border transition-all flex-shrink-0"
                        style={{
                          backgroundColor: confidences[q.id] ? confidenceColors[confidences[q.id]!] : "hsl(var(--muted))",
                          borderColor: confidences[q.id] ? confidenceColors[confidences[q.id]!] : undefined,
                        }}
                        title={confidences[q.id] ? confidenceLabels[confidences[q.id]!] : "Click to set confidence"}
                      />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {confidences[q.id] ? confidenceLabels[confidences[q.id]!] : "Set confidence"}
                    </span>
                  </div>
                  {(q.options || []).map(o => (
                    <button
                      key={o.id}
                      onClick={() => selectAnswer(q.id, o.id)}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                        answers[q.id] === o.id
                          ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow"
                          : "bg-card border border-border/40 text-foreground hover:bg-accent/50"
                      } ${submitted && q.correctAnswer === o.id ? "ring-2 ring-success" : ""} ${submitted && answers[q.id] === o.id && q.correctAnswer !== o.id ? "ring-2 ring-destructive" : ""}`}
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

      {!submitted && (
        <div className="flex justify-center pb-8">
          <Button
            size="lg"
            onClick={handleSubmit}
            className="px-10 rounded-full shadow-glow"
            disabled={hasRequiredLecture && !hasCompletedAnyLecture}
          >
            Submit
          </Button>
        </div>
      )}

      {submitted && (
        <div className="text-center pb-8">
          <p className="text-lg font-semibold text-foreground">
            Score: {quiz.questions.filter(q => answers[q.id] === q.correctAnswer).length} / {quiz.questions.length}
          </p>
          <Link to="/admin/content">
            <Button variant="outline" className="mt-4 rounded-full">Back to Content</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
