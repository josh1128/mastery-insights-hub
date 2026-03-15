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
import { courses } from "@/data/courses";
import { contentStore } from "@/data/contentStore";
import { QuizAuthoringDialog } from "@/components/content/QuizAuthoringDialog";
import { VideoLectureDialog } from "@/components/content/VideoLectureDialog";
import { toast } from "sonner";
import { PageGlow } from "@/components/decorative/PageDecorations";
import type { Quiz, VideoLecture, Resource } from "@/data/contentStore";
import { Plus, FileText, Video, Trash2, Pencil, Upload, File, ToggleLeft } from "lucide-react";

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

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleName, setEditingModuleName] = useState("");

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
    <div className="space-y-8 animate-fade-in relative">
      <PageGlow />
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Learning Content</h1>
            <p className="text-muted-foreground text-sm mt-1">Create and manage modules, quizzes, lectures, and resources</p>
            {isRetestMode && (
              <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 rounded-full">
                Retest Mode — Create a quiz that will be tagged as a retest
              </Badge>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setModuleDialogOpen(true)} className="rounded-full">
              <Plus className="h-4 w-4 mr-2" /> Add Module
            </Button>
            <Button variant="outline" onClick={() => setResourceDialogOpen(true)} className="rounded-full">
              <Upload className="h-4 w-4 mr-2" /> Upload Resource
            </Button>
            <Button variant="outline" onClick={() => { setEditingVideo(undefined); setVideoDialogOpen(true); }} className="rounded-full">
              <Video className="h-4 w-4 mr-2" /> Upload Lecture
            </Button>
            <Button onClick={() => { setEditingQuiz(undefined); setQuizDialogOpen(true); }} className="rounded-full shadow-glow">
              <Plus className="h-4 w-4 mr-2" /> Add Quiz
            </Button>
          </div>
        </div>

        {/* Course filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Course:</span>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[320px] rounded-full"><SelectValue /></SelectTrigger>
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
                        className="h-8 w-56 text-sm rounded-full" autoFocus
                        onKeyDown={e => { if (e.key === "Enter") saveModuleRename(mod.id); if (e.key === "Escape") setEditingModuleId(null); }} />
                      <Button size="sm" onClick={() => saveModuleRename(mod.id)} className="rounded-full">Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingModuleId(null)} className="rounded-full">Cancel</Button>
                    </div>
                  ) : (
                    <CardTitle className="text-base font-semibold">{mod.name}</CardTitle>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs rounded-full">
                    {moduleQuizzes.length + moduleVideos.length + moduleResources.length} items
                  </Badge>
                  {editingModuleId !== mod.id && (
                    <>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => { setEditingModuleId(mod.id); setEditingModuleName(mod.name); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive rounded-full" onClick={() => deleteModule(mod.id)}>
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
                    {moduleVideos.map(vid => (
                      <div key={vid.id} className="flex items-center justify-between py-3 px-4 rounded-2xl border border-border/30 hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Video className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{vid.title}</p>
                            <p className="text-xs text-muted-foreground">{vid.fileName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">

                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => openEditVideo(vid)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive rounded-full" onClick={() => deleteVideo(vid.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {moduleQuizzes.map(quiz => (
                      <div key={quiz.id} className="flex items-center justify-between py-3 px-4 rounded-2xl border border-border/30 hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{quiz.title}</p>
                              {quiz.isRetest && <Badge variant="outline" className="text-[9px] border-primary text-primary rounded-full">Retest</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {quiz.questions.length} questions · {quiz.captureConfidence ? "Confidence ON" : "No confidence"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => openEditQuiz(quiz)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive rounded-full" onClick={() => deleteQuiz(quiz.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {moduleResources.map(res => (
                      <div key={res.id} className="flex items-center justify-between py-3 px-4 rounded-2xl border border-border/30 hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center">
                            <File className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{res.title}</p>
                              {res.isOptional && <Badge variant="outline" className="text-[9px] rounded-full">Optional</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{res.fileName} · {res.fileType.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" title={res.isOptional ? "Mark Required" : "Mark Optional"}
                            onClick={() => toggleResourceOptional(res.id, res.isOptional)}>
                            <ToggleLeft className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive rounded-full" onClick={() => deleteResource(res.id)}>
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
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader><DialogTitle>Add Module</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <Input value={newModuleName} onChange={e => setNewModuleName(e.target.value)} placeholder="Module name" className="rounded-full"
                onKeyDown={e => { if (e.key === "Enter") addModule(); }} />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setModuleDialogOpen(false)} className="rounded-full">Cancel</Button>
              <Button onClick={addModule} className="rounded-full">Add Module</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Resource Dialog */}
        <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
          <DialogContent className="max-w-lg rounded-3xl">
            <DialogHeader><DialogTitle>Upload Resource</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Resource Title</Label>
                <Input value={resourceTitle} onChange={e => setResourceTitle(e.target.value)} placeholder="e.g. Study Guide Chapter 1" className="rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={resourceCourseId} onValueChange={v => { setResourceCourseId(v); setResourceModuleId(""); }}>
                    <SelectTrigger className="rounded-full"><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Module</Label>
                  <Select value={resourceModuleId} onValueChange={setResourceModuleId} disabled={!resourceCourseId}>
                    <SelectTrigger className="rounded-full"><SelectValue placeholder="Select module" /></SelectTrigger>
                    <SelectContent>
                      {resourceCourseModules.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>File</Label>
                <div className="border-2 border-dashed border-border/40 rounded-2xl p-6 text-center bg-indigo-50/60">
                  {resourceFileName ? (
                    <div className="flex items-center justify-center gap-2">
                      <File className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{resourceFileName}</span>
                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => { setResourceFileName(""); setResourceFileUrl(""); setResourceFileType(""); }}>Change</Button>
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
              <div className="flex items-center justify-between rounded-2xl border border-border/40 p-4 bg-indigo-50/40">
                <div>
                  <p className="text-sm font-medium">Optional Resource</p>
                  <p className="text-xs text-muted-foreground">Optional resources won't appear as required course content</p>
                </div>
                <Switch checked={resourceIsOptional} onCheckedChange={setResourceIsOptional} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setResourceDialogOpen(false)} className="rounded-full">Cancel</Button>
              <Button onClick={handleResourceSave} className="rounded-full">Upload Resource</Button>
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
    </div>
  );
}
