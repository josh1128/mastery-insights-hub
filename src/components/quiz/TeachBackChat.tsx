import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, CheckCircle2, XCircle, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeachBackResult {
  score: number;
  coveredConcepts: string[];
  missedConcepts: string[];
  feedback: string;
}

interface TeachBackChatProps {
  quizTitle: string;
  moduleName: string;
  questionTexts: string[];
  onComplete: (score: number) => void;
}

export default function TeachBackChat({ quizTitle, moduleName, questionTexts, onComplete }: TeachBackChatProps) {
  const [explanation, setExplanation] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<TeachBackResult | null>(null);
  const [started, setStarted] = useState(false);

  const handleSubmit = async () => {
    if (!explanation.trim() || explanation.trim().length < 20) {
      toast.error("Please write a more detailed explanation (at least a few sentences).");
      return;
    }

    setIsGrading(true);
    try {
      const { data, error } = await supabase.functions.invoke("teach-back", {
        body: {
          topic: quizTitle,
          moduleName,
          explanation: explanation.trim(),
          questionTexts,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data as TeachBackResult);
      onComplete(data.score);
    } catch (e: any) {
      console.error("Teach-back error:", e);
      toast.error(e.message || "Failed to grade explanation. Please try again.");
    } finally {
      setIsGrading(false);
    }
  };

  if (!started) {
    return (
      <Card className="p-8 text-center space-y-5 bg-card/80 backdrop-blur-sm border-border/40 rounded-3xl shadow-glass">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Teach it Back Challenge</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm leading-relaxed">
            Explain what you just learned about <strong>{moduleName}</strong> in your own words — 
            as if you're teaching it to someone who knows nothing about it. 
            The AI will grade your understanding and show you what you nailed and what to review.
          </p>
        </div>
        <Button onClick={() => setStarted(true)} size="lg" className="rounded-full shadow-glow px-8">
          <MessageSquare className="h-4 w-4 mr-2" />
          Start Explaining
        </Button>
      </Card>
    );
  }

  if (result) {
    return (
      <Card className="p-8 space-y-6 bg-card/80 backdrop-blur-sm border-border/40 rounded-3xl shadow-glass">
        {/* Score header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
            <span className="text-2xl font-bold text-primary-foreground">{result.score}%</span>
          </div>
          <h3 className="text-xl font-bold text-foreground">Comprehension Score</h3>
          <Badge variant={result.score >= 70 ? "default" : "secondary"} className="rounded-full px-4 py-1">
            {result.score >= 80 ? "Excellent" : result.score >= 60 ? "Good" : result.score >= 40 ? "Developing" : "Needs Review"}
          </Badge>
        </div>

        {/* Concepts covered */}
        {result.coveredConcepts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" /> Concepts You Nailed
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.coveredConcepts.map((c, i) => (
                <Badge key={i} variant="secondary" className="rounded-full bg-success/10 text-success border-success/20">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Concepts missed */}
        {result.missedConcepts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" /> Areas to Review
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.missedConcepts.map((c, i) => (
                <Badge key={i} variant="secondary" className="rounded-full bg-destructive/10 text-destructive border-destructive/20">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
          <p className="text-sm text-foreground flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            {result.feedback}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 space-y-5 bg-card/80 backdrop-blur-sm border-border/40 rounded-3xl shadow-glass">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Teach it Back</h3>
          <p className="text-xs text-muted-foreground">Explain <strong>{moduleName}</strong> in your own words</p>
        </div>
      </div>

      <Textarea
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        placeholder={`Explain what you learned about ${moduleName}. Pretend you're teaching it to a friend who has never heard of this topic. Cover the key concepts, why they matter, and how they connect...`}
        className="min-h-[180px] rounded-2xl bg-muted/30 border-border/40 resize-none text-sm"
        disabled={isGrading}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {explanation.trim().length < 20 ? "Write at least a few sentences" : `${explanation.trim().split(/\s+/).length} words`}
        </p>
        <Button
          onClick={handleSubmit}
          disabled={isGrading || explanation.trim().length < 20}
          className="rounded-full shadow-glow px-6"
        >
          {isGrading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Grading...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Explanation
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
