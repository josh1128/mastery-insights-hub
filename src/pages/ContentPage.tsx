import { useState, useReducer, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, FileText, Video, Trash2, Pencil, Play, Upload } from "lucide-react";
import { courses } from "@/data/courses";
import { contentStore } from "@/data/contentStore";
import { QuizAuthoringDialog } from "@/components/content/QuizAuthoringDialog";
import { VideoLectureDialog } from "@/components/content/VideoLectureDialog";
import { toast } from "sonner";
import type { Quiz, VideoLecture } from "@/data/contentStore";

export default function ContentPage() {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => {
    const unsub = contentStore.subscribe(forceUpdate);
    return () => { unsub(); };
  }, []);

  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || "");
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | undefined>();
  const [editingVideo, setEditingVideo] = useState<VideoLecture | undefined>();

  // Module creation
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleName, setEditingModuleName] = useState("");

  const courseModules = contentStore.getModulesByCourse(selectedCourse);
  const quizzes = contentStore.getQuizzes().filter(q => q.courseId === selectedCourse);
  const videos = contentStore.getVideoLectures().filter(v => v.courseId === selectedCourse);

  const openEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizDialogOpen(true);
  };

  const openEditVideo = (video: VideoLecture) => {
    setEditingVideo(video);
    setVideoDialogOpen(true);
  };

  const deleteQuiz = (id: string) => {
    contentStore.deleteQuiz(id);
    toast.success("Quiz deleted");
  };

  const deleteVideo = (id: string) => {
    contentStore.deleteVideoLecture(id);
    toast.success("Lecture deleted");
  };

  const addModule = () => {
    if (!newModuleName.trim()) return;
    contentStore.addModule({
      id: `mod-${Date.now()}`,
      courseId: selectedCourse,
      name: newModuleName.trim(),
      createdAt: new Date().toISOString(),
    });
    setNewModuleName("");
    setModuleDialogOpen(false);
    toast.success("Module added");
  };

  const saveModuleRename = (id: string) => {
    if (!editingModuleName.trim()) return;
    contentStore.updateModule(id, { name: editingModuleName.trim() });
    setEditingModuleId(null);
    toast.success("Module renamed");
  };

  const deleteModule = (id: string) => {
    contentStore.deleteModule(id);
    toast.success("Module and its content deleted");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Learning Content</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage modules, quizzes, and video lectures</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setModuleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Module
          </Button>
          <Button variant="outline" onClick={() => { setEditingVideo(undefined); setVideoDialogOpen(true); }}>
            <Upload className="h-4 w-4 mr-2" /> Upload Lecture
          </Button>
          <Button onClick={() => { setEditingQuiz(undefined); setQuizDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Quiz
          </Button>
        </div>
      </div>

      {/* Course filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Course:</span>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[320px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Module content grid */}
      {courseModules.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No modules yet. Click "Add Module" to get started.
        </div>
      )}

      {courseModules.map(mod => {
        const moduleQuizzes = quizzes.filter(q => q.moduleId === mod.id);
        const moduleVideos = videos.filter(v => v.moduleId === mod.id);
        const hasContent = moduleQuizzes.length > 0 || moduleVideos.length > 0;

        return (
          <Card key={mod.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                {editingModuleId === mod.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingModuleName}
                      onChange={e => setEditingModuleName(e.target.value)}
                      className="h-8 w-56 text-sm"
                      autoFocus
                      onKeyDown={e => { if (e.key === "Enter") saveModuleRename(mod.id); if (e.key === "Escape") setEditingModuleId(null); }}
                    />
                    <Button size="sm" onClick={() => saveModuleRename(mod.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingModuleId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <CardTitle className="text-base font-semibold">{mod.name}</CardTitle>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {moduleQuizzes.length + moduleVideos.length} items
                </Badge>
                {editingModuleId !== mod.id && (
                  <>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingModuleId(mod.id); setEditingModuleName(mod.name); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteModule(mod.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!hasContent && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No content yet. Use "Add Quiz" or "Upload Lecture" to add content to this module.
                </p>
              )}

              {hasContent && (
                <div className="space-y-2">
                  {moduleQuizzes.map(quiz => (
                    <div key={quiz.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{quiz.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {quiz.questions.length} questions · {quiz.captureConfidence ? "Confidence ON" : "No confidence"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link to={`/learn/quiz/${quiz.id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Preview">
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditQuiz(quiz)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteQuiz(quiz.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {moduleVideos.map(vid => (
                    <div key={vid.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Video className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{vid.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {vid.fileName} · {vid.confidenceCheckpoints.length} checkpoints
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link to={`/learn/lecture/${vid.id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Preview">
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditVideo(vid)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteVideo(vid.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Add Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              value={newModuleName}
              onChange={e => setNewModuleName(e.target.value)}
              placeholder="Module name"
              onKeyDown={e => { if (e.key === "Enter") addModule(); }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModuleDialogOpen(false)}>Cancel</Button>
            <Button onClick={addModule}>Add Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <QuizAuthoringDialog
        open={quizDialogOpen}
        onOpenChange={v => { setQuizDialogOpen(v); if (!v) setEditingQuiz(undefined); }}
        editQuiz={editingQuiz}
      />
      <VideoLectureDialog
        open={videoDialogOpen}
        onOpenChange={v => { setVideoDialogOpen(v); if (!v) setEditingVideo(undefined); }}
        editLecture={editingVideo}
      />
    </div>
  );
}
