import { useState, useReducer, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, FileText, Video, Trash2, Pencil, Play, Upload, File, ToggleLeft } from "lucide-react";
import { courses } from "@/data/courses";
import { contentStore } from "@/data/contentStore";
import { QuizAuthoringDialog } from "@/components/content/QuizAuthoringDialog";
import { VideoLectureDialog } from "@/components/content/VideoLectureDialog";
import { toast } from "sonner";
import type { Quiz, VideoLecture, Resource } from "@/data/contentStore";

export default function ContentPage() {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => {
    const unsub = contentStore.subscribe(forceUpdate);
    return () => { unsub(); };
  }, []);

  const [searchParams] = useSearchParams();
  const isRetestMode = searchParams.get("action") === "retest";

  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || "");
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | undefined>();
  const [editingVideo, setEditingVideo] = useState<VideoLecture | undefined>();

  // Module creation
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleName, setEditingModuleName] = useState("");

  // Resource upload state
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceCourseId, setResourceCourseId] = useState("");
  const [resourceModuleId, setResourceModuleId] = useState("");
  const [resourceFileName, setResourceFileName] = useState("");
  const [resourceFileUrl, setResourceFileUrl] = useState("");
  const [resourceFileType, setResourceFileType] = useState("");
  const [resourceIsOptional, setResourceIsOptional] = useState(false);

  const courseModules = contentStore.getModulesByCourse(selectedCourse);
  const quizzes = contentStore.getQuizzes().filter(q => q.courseId === selectedCourse);
  const videos = contentStore.getVideoLectures().filter(v => v.courseId === selectedCourse);
  const resources = contentStore.getResources().filter(r => r.courseId === selectedCourse);

  // Auto-open quiz dialog in retest mode
  useEffect(() => {
    if (isRetestMode && !quizDialogOpen) {
      setEditingQuiz(undefined);
      setQuizDialogOpen(true);
    }
  }, [isRetestMode]);

  const openEditQuiz = (quiz: Quiz) => { setEditingQuiz(quiz); setQuizDialogOpen(true); };
  const openEditVideo = (video: VideoLecture) => { setEditingVideo(video); setVideoDialogOpen(true); };

  const deleteQuiz = (id: string) => { contentStore.deleteQuiz(id); toast.success("Quiz deleted"); };
  const deleteVideo = (id: string) => { contentStore.deleteVideoLecture(id); toast.success("Lecture deleted"); };
  const deleteResource = (id: string) => { contentStore.deleteResource(id); toast.success("Resource deleted"); };

  const toggleResourceOptional = (id: string, current: boolean) => {
    contentStore.updateResource(id, { isOptional: !current });
    toast.success(`Resource marked as ${!current ? "optional" : "required"}`);
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

  const deleteModule = (id: string) => { contentStore.deleteModule(id); toast.success("Module and its content deleted"); };

  const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResourceFileName(file.name);
      setResourceFileUrl(URL.createObjectURL(file));
      const ext = file.name.split('.').pop()?.toLowerCase() || "file";
      setResourceFileType(ext);
    }
  };

  const handleResourceSave = () => {
    if (!resourceTitle.trim()) { toast.error("Title is required"); return; }
    if (!resourceCourseId || !resourceModuleId) { toast.error("Select a course and module"); return; }
    if (!resourceFileName) { toast.error("Upload a file"); return; }

    contentStore.addResource({
      id: `res-${Date.now()}`,
      title: resourceTitle.trim(),
      courseId: resourceCourseId,
      moduleId: resourceModuleId,
      fileName: resourceFileName,
      fileUrl: resourceFileUrl,
      fileType: resourceFileType,
      isOptional: resourceIsOptional,
      createdAt: new Date().toISOString(),
    });
    toast.success("Resource uploaded");
    setResourceDialogOpen(false);
    setResourceTitle("");
    setResourceCourseId("");
    setResourceModuleId("");
    setResourceFileName("");
    setResourceFileUrl("");
    setResourceFileType("");
    setResourceIsOptional(false);
  };

  const resourceCourseModules = resourceCourseId ? contentStore.getModulesByCourse(resourceCourseId) : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Learning Content</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage modules, quizzes, lectures, and resources</p>
          {isRetestMode && (
            <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">
              Retest Mode — Create a quiz that will be tagged as a retest
            </Badge>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setModuleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Module
          </Button>
          <Button variant="outline" onClick={() => setResourceDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Upload Resource
          </Button>
          <Button variant="outline" onClick={() => { setEditingVideo(undefined); setVideoDialogOpen(true); }}>
            <Video className="h-4 w-4 mr-2" /> Upload Lecture
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
        const moduleResources = resources.filter(r => r.moduleId === mod.id);
        const hasContent = moduleQuizzes.length > 0 || moduleVideos.length > 0 || moduleResources.length > 0;

        return (
          <Card key={mod.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                {editingModuleId === mod.id ? (
                  <div className="flex items-center gap-2">
                    <Input value={editingModuleName} onChange={e => setEditingModuleName(e.target.value)}
                      className="h-8 w-56 text-sm" autoFocus
                      onKeyDown={e => { if (e.key === "Enter") saveModuleRename(mod.id); if (e.key === "Escape") setEditingModuleId(null); }} />
                    <Button size="sm" onClick={() => saveModuleRename(mod.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingModuleId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <CardTitle className="text-base font-semibold">{mod.name}</CardTitle>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {moduleQuizzes.length + moduleVideos.length + moduleResources.length} items
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
                  No content yet. Use the buttons above to add content to this module.
                </p>
              )}

              {hasContent && (
                <div className="space-y-2">
                  {/* Videos first (lectures before quizzes) */}
                  {moduleVideos.map(vid => (
                    <div key={vid.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Video className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{vid.title}</p>
                          <p className="text-xs text-muted-foreground">{vid.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link to={`/learn/lecture/${vid.id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Preview"><Play className="h-3.5 w-3.5" /></Button>
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

                  {moduleQuizzes.map(quiz => (
                    <div key={quiz.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-amber-500" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{quiz.title}</p>
                            {quiz.isRetest && <Badge variant="outline" className="text-[9px] border-primary text-primary">Retest</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {quiz.questions.length} questions · {quiz.captureConfidence ? "Confidence ON" : "No confidence"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link to={`/learn/quiz/${quiz.id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Preview"><Play className="h-3.5 w-3.5" /></Button>
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

                  {moduleResources.map(res => (
                    <div key={res.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{res.title}</p>
                            {res.isOptional && <Badge variant="outline" className="text-[9px]">Optional</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{res.fileName} · {res.fileType.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" title={res.isOptional ? "Mark Required" : "Mark Optional"}
                          onClick={() => toggleResourceOptional(res.id, res.isOptional)}>
                          <ToggleLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteResource(res.id)}>
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
          <DialogHeader><DialogTitle>Add Module</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Input value={newModuleName} onChange={e => setNewModuleName(e.target.value)} placeholder="Module name"
              onKeyDown={e => { if (e.key === "Enter") addModule(); }} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModuleDialogOpen(false)}>Cancel</Button>
            <Button onClick={addModule}>Add Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Resource Dialog */}
      <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Upload Resource</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Resource Title</Label>
              <Input value={resourceTitle} onChange={e => setResourceTitle(e.target.value)} placeholder="e.g. Study Guide Chapter 1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={resourceCourseId} onValueChange={v => { setResourceCourseId(v); setResourceModuleId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Module</Label>
                <Select value={resourceModuleId} onValueChange={setResourceModuleId} disabled={!resourceCourseId}>
                  <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                  <SelectContent>
                    {resourceCourseModules.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>File</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {resourceFileName ? (
                  <div className="flex items-center justify-center gap-2">
                    <File className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{resourceFileName}</span>
                    <Button size="sm" variant="ghost" onClick={() => { setResourceFileName(""); setResourceFileUrl(""); setResourceFileType(""); }}>Change</Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Upload PDF, Word, or other documents</p>
                    <Input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md" onChange={handleResourceFileChange} className="max-w-xs mx-auto" />
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Optional Resource</p>
                <p className="text-xs text-muted-foreground">Optional resources won't appear as required course content</p>
              </div>
              <Switch checked={resourceIsOptional} onCheckedChange={setResourceIsOptional} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResourceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleResourceSave}>Upload Resource</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <QuizAuthoringDialog
        open={quizDialogOpen}
        onOpenChange={v => { setQuizDialogOpen(v); if (!v) setEditingQuiz(undefined); }}
        editQuiz={editingQuiz}
        isRetest={isRetestMode}
      />
      <VideoLectureDialog
        open={videoDialogOpen}
        onOpenChange={v => { setVideoDialogOpen(v); if (!v) setEditingVideo(undefined); }}
        editLecture={editingVideo}
      />
    </div>
  );
}
