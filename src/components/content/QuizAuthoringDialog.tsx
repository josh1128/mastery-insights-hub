import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { courses } from "@/data/courses";
import { contentStore, Quiz, QuizQuestion, QuestionType } from "@/data/contentStore";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editQuiz?: Quiz;
}

function newQuestion(type: QuestionType): QuizQuestion {
  const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  if (type === "true-false") {
    return { id, type, text: "", correctAnswer: "true" };
  }
  return {
    id, type, text: "", correctAnswer: "",
    options: [
      { id: `o-${Date.now()}-a`, text: "" },
      { id: `o-${Date.now()}-b`, text: "" },
    ],
  };
}

export function QuizAuthoringDialog({ open, onOpenChange, editQuiz }: Props) {
  const [title, setTitle] = useState(editQuiz?.title || "");
  const [courseId, setCourseId] = useState(editQuiz?.courseId || "");
  const [moduleId, setModuleId] = useState(editQuiz?.moduleId || "");
  const [captureConfidence, setCaptureConfidence] = useState(editQuiz?.captureConfidence ?? true);
  const [questions, setQuestions] = useState<QuizQuestion[]>(editQuiz?.questions || [newQuestion("true-false")]);

  const selectedCourse = courses.find(c => c.id === courseId);

  const addQuestion = (type: QuestionType) => {
    setQuestions(prev => [...prev, newQuestion(type)]);
  };

  const removeQuestion = (qId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== qId));
  };

  const updateQuestion = (qId: string, updates: Partial<QuizQuestion>) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...updates } : q));
  };

  const addOption = (qId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      const opts = q.options || [];
      return { ...q, options: [...opts, { id: `o-${Date.now()}`, text: "" }] };
    }));
  };

  const removeOption = (qId: string, oId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      return { ...q, options: (q.options || []).filter(o => o.id !== oId) };
    }));
  };

  const updateOption = (qId: string, oId: string, text: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      return { ...q, options: (q.options || []).map(o => o.id === oId ? { ...o, text } : o) };
    }));
  };

  const handleSave = () => {
    if (!title.trim()) { toast.error("Quiz title is required"); return; }
    if (!courseId || !moduleId) { toast.error("Select a course and module"); return; }
    if (questions.length === 0) { toast.error("Add at least one question"); return; }

    const quiz: Quiz = {
      id: editQuiz?.id || `quiz-${Date.now()}`,
      title: title.trim(),
      courseId,
      moduleId,
      captureConfidence,
      questions,
      createdAt: editQuiz?.createdAt || new Date().toISOString(),
    };

    if (editQuiz) {
      contentStore.updateQuiz(quiz.id, quiz);
      toast.success("Quiz updated");
    } else {
      contentStore.addQuiz(quiz);
      toast.success("Quiz created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editQuiz ? "Edit Quiz" : "Create Quiz"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Quiz Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Module 1 Assessment" />
          </div>

          {/* Course & Module */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={v => { setCourseId(v); setModuleId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={moduleId} onValueChange={setModuleId} disabled={!courseId}>
                <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                <SelectContent>
                  {selectedCourse?.modules.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Confidence toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Capture Confidence</p>
              <p className="text-xs text-muted-foreground">Ask learners how confident they are per question</p>
            </div>
            <Switch checked={captureConfidence} onCheckedChange={setCaptureConfidence} />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Questions ({questions.length})</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => addQuestion("true-false")}>
                  <Plus className="h-3 w-3 mr-1" /> True/False
                </Button>
                <Button size="sm" variant="outline" onClick={() => addQuestion("multiple-choice")}>
                  <Plus className="h-3 w-3 mr-1" /> Multiple Choice
                </Button>
              </div>
            </div>

            {questions.map((q, idx) => (
              <div key={q.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      Q{idx + 1} — {q.type === "true-false" ? "True / False" : "Multiple Choice"}
                    </span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeQuestion(q.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Input
                  value={q.text}
                  onChange={e => updateQuestion(q.id, { text: e.target.value })}
                  placeholder="Enter question text..."
                />

                {q.type === "true-false" && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Correct Answer</Label>
                    <RadioGroup value={q.correctAnswer} onValueChange={v => updateQuestion(q.id, { correctAnswer: v })} className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="true" id={`${q.id}-true`} />
                        <Label htmlFor={`${q.id}-true`} className="text-sm">True</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="false" id={`${q.id}-false`} />
                        <Label htmlFor={`${q.id}-false`} className="text-sm">False</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {q.type === "multiple-choice" && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Options (select the correct one)</Label>
                    {(q.options || []).map(o => (
                      <div key={o.id} className="flex items-center gap-2">
                        <RadioGroup value={q.correctAnswer} onValueChange={v => updateQuestion(q.id, { correctAnswer: v })}>
                          <RadioGroupItem value={o.id} />
                        </RadioGroup>
                        <Input
                          value={o.text}
                          onChange={e => updateOption(q.id, o.id, e.target.value)}
                          placeholder="Option text..."
                          className="flex-1 h-8 text-sm"
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeOption(q.id, o.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => addOption(q.id)}>
                      <Plus className="h-3 w-3 mr-1" /> Add Option
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editQuiz ? "Save Changes" : "Create Quiz"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
