import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, LayoutList } from "lucide-react";
import { courses } from "@/data/courses";
import { contentStore, Quiz, QuizQuestion, QuestionType } from "@/data/contentStore";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editQuiz?: Quiz;
  isRetest?: boolean;
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

export function QuizAuthoringDialog({ open, onOpenChange, editQuiz, isRetest }: Props) {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [captureConfidence, setCaptureConfidence] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  // State for the "Collapse All" feature
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setTitle(editQuiz?.title || (isRetest ? "Retest — " : ""));
      setCourseId(editQuiz?.courseId || sessionStorage.getItem("retestCourseId") || "");
      setModuleId(editQuiz?.moduleId || (isRetest ? sessionStorage.getItem("retestModuleId") || "" : ""));
      setCaptureConfidence(editQuiz?.captureConfidence ?? true);
      setQuestions(editQuiz?.questions || [newQuestion("true-false")]);
      setCollapsedIds(new Set()); // Start expanded
    }
  }, [open, editQuiz, isRetest]);

  const courseModules = courseId ? contentStore.getModulesByCourse(courseId) : [];

  const addQuestion = (type: QuestionType) => {
    const q = newQuestion(type);
    setQuestions(prev => [...prev, q]);
  };

  const removeQuestion = (qId: string) => setQuestions(prev => prev.filter(q => q.id !== qId));

  const updateQuestion = (qId: string, updates: Partial<QuizQuestion>) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...updates } : q));
  };

  // Drag and Drop Handler
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setQuestions(items);
  };

  // Collapse Helpers
  const toggleCollapse = (id: string) => {
    const next = new Set(collapsedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsedIds(next);
  };

  const collapseAll = () => setCollapsedIds(new Set(questions.map(q => q.id)));
  const expandAll = () => setCollapsedIds(new Set());

  // Option management
  const addOption = (qId: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: [...(q.options || []), { id: `o-${Date.now()}`, text: "" }] } : q));
  };
  const removeOption = (qId: string, oId: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: (q.options || []).filter(o => o.id !== oId) } : q));
  };
  const updateOption = (qId: string, oId: string, text: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: (q.options || []).map(o => o.id === oId ? { ...o, text } : o) } : q));
  };

  const handleSave = () => {
    if (!title.trim()) { toast.error("Quiz title is required"); return; }
    if (!courseId || !moduleId) { toast.error("Select a course and module"); return; }
    if (questions.length === 0) { toast.error("Add at least one question"); return; }

    const quiz: Quiz = {
      id: editQuiz?.id || `quiz-${Date.now()}`,
      title: title.trim(), courseId, moduleId, captureConfidence, questions,
      createdAt: editQuiz?.createdAt || new Date().toISOString(),
      isRetest: isRetest || editQuiz?.isRetest || false,
    };

    if (editQuiz) {
      contentStore.updateQuiz(quiz.id, quiz);
      toast.success("Quiz updated");
    } else {
      contentStore.addQuiz(quiz);
      toast.success(isRetest ? "Retest quiz created" : "Quiz created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col rounded-[2rem] border-none shadow-2xl p-0">
        <DialogHeader className="p-8 pb-0 text-left">
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {editQuiz ? "Edit Quiz" : isRetest ? "Create Retest Quiz" : "Create Quiz"}
          </DialogTitle>
          {isRetest && (
            <Badge className="w-fit bg-violet-100 text-violet-700 border-none mt-1 font-bold">Retest Mode</Badge>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8">
          {/* Settings Section */}
          <div className="grid grid-cols-1 gap-6 bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100">
            <div className="space-y-2 text-left">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Quiz Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Finance 101 Final" className="rounded-xl bg-white border-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Course</Label>
                <Select value={courseId} onValueChange={v => { setCourseId(v); setModuleId(""); }}>
                  <SelectTrigger className="rounded-xl bg-white border-slate-200"><SelectValue placeholder="Course" /></SelectTrigger>
                  <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-left">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Module</Label>
                <Select value={moduleId} onValueChange={setModuleId} disabled={!courseId}>
                  <SelectTrigger className="rounded-xl bg-white border-slate-200"><SelectValue placeholder="Module" /></SelectTrigger>
                  <SelectContent>{courseModules.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-left">
                <Label className="text-sm font-bold text-slate-900">Capture Confidence</Label>
                <p className="text-[11px] text-slate-500 font-medium">Ask learners how sure they feel about each answer</p>
              </div>
              <Switch checked={captureConfidence} onCheckedChange={setCaptureConfidence} />
            </div>
          </div>

          {/* Drag & Drop Questions Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-900">Questions</h3>
                <Badge variant="outline" className="rounded-full px-2 py-0.5 text-slate-400 border-slate-200">{questions.length}</Badge>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs font-bold text-slate-500 hover:text-slate-900"
                  onClick={collapsedIds.size === questions.length ? expandAll : collapseAll}
                >
                  <LayoutList className="h-3.5 w-3.5 mr-1.5" />
                  {collapsedIds.size === questions.length ? "Expand All" : "Collapse All"}
                </Button>
                <Button size="sm" variant="outline" className="rounded-full border-slate-200 font-bold text-xs" onClick={() => addQuestion("true-false")}>
                  <Plus className="h-3 w-3 mr-1" /> T/F
                </Button>
                <Button size="sm" variant="outline" className="rounded-full border-slate-200 font-bold text-xs" onClick={() => addQuestion("multiple-choice")}>
                  <Plus className="h-3 w-3 mr-1" /> MC
                </Button>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {questions.map((q, idx) => {
                      const isCollapsed = collapsedIds.has(q.id);
                      return (
                        <Draggable key={q.id} draggableId={q.id} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white rounded-[1.5rem] border transition-all ${
                                snapshot.isDragging ? "shadow-2xl border-violet-400 scale-[1.02] z-50" : "border-slate-200"
                              }`}
                            >
                              <div className="flex items-start p-6 gap-4">
                                {/* Drag Handle */}
                                <div {...provided.dragHandleProps} className="mt-1 text-slate-300 hover:text-slate-500 transition-colors cursor-grab active:cursor-grabbing">
                                  <GripVertical className="h-5 w-5" />
                                </div>

                                <div className="flex-1 space-y-4 text-left">
                                  {/* Question Header: Type and Actions */}
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {q.type === "true-false" ? "True / False" : "Multiple Choice"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-300" onClick={() => toggleCollapse(q.id)}>
                                        {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-300 hover:text-red-500 transition-colors" onClick={() => removeQuestion(q.id)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Prompt Input */}
                                  <Input
                                    value={q.text}
                                    onChange={e => updateQuestion(q.id, { text: e.target.value })}
                                    placeholder="Enter your question prompt here..."
                                    className={`text-base font-bold border-none p-0 focus-visible:ring-0 placeholder:text-slate-200 h-auto ${isCollapsed ? 'truncate max-w-md' : ''}`}
                                  />

                                  {/* Options (Hidden if collapsed) */}
                                  {!isCollapsed && (
                                    <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                      {q.type === "true-false" ? (
                                        <RadioGroup value={q.correctAnswer} onValueChange={v => updateQuestion(q.id, { correctAnswer: v })} className="flex gap-6">
                                          <div className="flex items-center gap-2">
                                            <RadioGroupItem value="true" id={`${q.id}-true`} />
                                            <Label htmlFor={`${q.id}-true`} className="text-sm font-medium text-slate-700">True</Label>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <RadioGroupItem value="false" id={`${q.id}-false`} />
                                            <Label htmlFor={`${q.id}-false`} className="text-sm font-medium text-slate-700">False</Label>
                                          </div>
                                        </RadioGroup>
                                      ) : (
                                        <div className="space-y-3">
                                          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Answer Options</Label>
                                          <div className="space-y-2">
                                            {(q.options || []).map(o => (
                                              <div key={o.id} className="flex items-center gap-3 group/option">
                                                <RadioGroup value={q.correctAnswer} onValueChange={v => updateQuestion(q.id, { correctAnswer: v })}>
                                                  <RadioGroupItem value={o.id} className="border-slate-300" />
                                                </RadioGroup>
                                                <Input
                                                  value={o.text}
                                                  onChange={e => updateOption(q.id, o.id, e.target.value)}
                                                  placeholder="Option text..."
                                                  className="flex-1 rounded-xl bg-slate-50/50 border-none h-10 text-sm focus:bg-white transition-colors"
                                                />
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 opacity-0 group-hover/option:opacity-100 transition-opacity" onClick={() => removeOption(q.id, o.id)}>
                                                  <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                          <Button size="sm" variant="ghost" className="text-xs font-bold text-violet-600 hover:bg-violet-50 rounded-full" onClick={() => addOption(q.id)}>
                                            <Plus className="h-3 w-3 mr-1" /> Add Option
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100 rounded-b-[2rem]">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full font-bold text-slate-500">Cancel</Button>
          <Button onClick={handleSave} className="rounded-full px-8 bg-violet-600 hover:bg-violet-700 font-bold shadow-lg h-11">
            {editQuiz ? "Save Changes" : isRetest ? "Create Retest" : "Create Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}