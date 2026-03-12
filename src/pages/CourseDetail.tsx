import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, BookOpen, Award, Plus, Pencil, Trash2, Upload, Video, FileText, GripVertical, Save } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { getCourse } from "@/data/courses";
import { members } from "@/data/members";

interface Lesson {
  id: string;
  name: string;
  type: "lesson" | "quiz" | "video" | "resource";
}

interface Module {
  id: string;
  name: string;
  lessons: Lesson[];
}

interface CourseData {
  name: string;
  category: string;
  students: number;
  status: string;
  description: string;
  modules: Module[];
}

function buildCourseData(courseId: string): CourseData {
  const course = getCourse(courseId);
  if (!course) {
    return {
      name: "Unknown Course",
      category: "—",
      students: 0,
      status: "Draft",
      description: "",
      modules: [],
    };
  }
  const enrolled = members.filter(m => m.enrolledCourseIds.includes(courseId)).length;
  return {
    name: course.name,
    category: course.category,
    students: enrolled,
    status: course.status,
    description: course.description,
    modules: course.modules.map((m, mi) => ({
      id: m.id,
      name: m.name,
      lessons: [
        { id: `${m.id}-l1`, name: `Introduction to ${m.name}`, type: "lesson" as const },
        { id: `${m.id}-l2`, name: `${m.name} Deep Dive`, type: "lesson" as const },
        { id: `${m.id}-l3`, name: `Quiz: ${m.name}`, type: "quiz" as const },
      ],
    })),
  };
}

const lessonTypeIcons: Record<string, React.ReactNode> = {
  lesson: <BookOpen className="h-3.5 w-3.5 text-primary" />,
  quiz: <FileText className="h-3.5 w-3.5 text-warning" />,
  video: <Video className="h-3.5 w-3.5 text-chart-info" />,
  resource: <Upload className="h-3.5 w-3.5 text-success" />,
};

const lessonTypeBadge: Record<string, string> = {
  lesson: "Lesson", quiz: "Quiz", video: "Video", resource: "Resource",
};

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseData>(() => buildCourseData(id || "course-1"));
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseName, setCourseName] = useState(course.name);
  const [courseDesc, setCourseDesc] = useState(course.description);

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonTargetModule, setLessonTargetModule] = useState<string>("");
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonType, setNewLessonType] = useState<Lesson["type"]>("lesson");

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTargetModule, setUploadTargetModule] = useState<string>("");

  const addModule = () => {
    if (!newModuleName.trim()) return;
    setCourse(prev => ({ ...prev, modules: [...prev.modules, { id: `m${Date.now()}`, name: newModuleName.trim(), lessons: [] }] }));
    setNewModuleName("");
    setModuleDialogOpen(false);
    toast.success("Module added");
  };

  const updateModule = (moduleId: string, name: string) => {
    setCourse(prev => ({ ...prev, modules: prev.modules.map(m => m.id === moduleId ? { ...m, name } : m) }));
    setEditingModuleId(null);
    toast.success("Module updated");
  };

  const deleteModule = (moduleId: string) => {
    setCourse(prev => ({ ...prev, modules: prev.modules.filter(m => m.id !== moduleId) }));
    toast.success("Module deleted");
  };

  const addLesson = () => {
    if (!newLessonName.trim() || !lessonTargetModule) return;
    const newLesson: Lesson = { id: `l${Date.now()}`, name: newLessonName.trim(), type: newLessonType };
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === lessonTargetModule ? { ...m, lessons: [...m.lessons, newLesson] } : m),
    }));
    setNewLessonName("");
    setNewLessonType("lesson");
    setLessonDialogOpen(false);
    toast.success(`${lessonTypeBadge[newLessonType]} added`);
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m),
    }));
    toast.success("Item removed");
  };

  const handleFileUpload = (moduleId: string) => {
    const newLesson: Lesson = { id: `l${Date.now()}`, name: `Uploaded File ${new Date().toLocaleTimeString()}`, type: "resource" };
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m),
    }));
    setUploadDialogOpen(false);
    toast.success("File uploaded successfully");
  };

  const saveCourseDetails = () => {
    setCourse(prev => ({ ...prev, name: courseName, description: courseDesc }));
    setEditingCourse(false);
    toast.success("Course details saved");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
        </Link>
        <Button variant="outline" size="sm" onClick={() => setEditingCourse(!editingCourse)}>
          <Pencil className="h-3.5 w-3.5 mr-1" />
          {editingCourse ? "Cancel" : "Edit Course"}
        </Button>
      </div>

      <div className="h-48 bg-gradient-to-br from-primary/80 to-primary rounded-xl flex items-end p-6">
        <div>
          {editingCourse ? (
            <div className="space-y-2">
              <Input value={courseName} onChange={e => setCourseName(e.target.value)}
                className="bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60 text-xl font-bold" />
              <Button size="sm" variant="secondary" onClick={saveCourseDetails}>
                <Save className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-primary-foreground">{course.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">{course.category}</Badge>
                <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">{course.status}</Badge>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
            <CardContent>
              {editingCourse ? (
                <Textarea value={courseDesc} onChange={e => setCourseDesc(e.target.value)} className="min-h-[80px]" />
              ) : (
                <p className="text-sm text-muted-foreground">{course.description}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Curriculum</CardTitle>
              <div className="flex gap-2">
                <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1" /> Module</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Module</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <Input placeholder="Module name" value={newModuleName} onChange={e => setNewModuleName(e.target.value)} />
                      <Button onClick={addModule} className="w-full">Add Module</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Lesson</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Content</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <Select value={lessonTargetModule} onValueChange={setLessonTargetModule}>
                        <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                        <SelectContent>
                          {course.modules.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Lesson name" value={newLessonName} onChange={e => setNewLessonName(e.target.value)} />
                      <Select value={newLessonType} onValueChange={v => setNewLessonType(v as Lesson["type"])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lesson">Lesson</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="resource">Resource / File</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addLesson} className="w-full">Add</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-2">
                {course.modules.map((mod) => (
                  <AccordionItem key={mod.id} value={mod.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline">
                      <div className="flex items-center gap-2 w-full">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                        {editingModuleId === mod.id ? (
                          <Input defaultValue={mod.name} className="h-7 text-sm max-w-[200px]" autoFocus
                            onBlur={e => updateModule(mod.id, e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") updateModule(mod.id, (e.target as HTMLInputElement).value); }}
                            onClick={e => e.stopPropagation()} />
                        ) : (
                          <span>{mod.name}</span>
                        )}
                        <Badge variant="secondary" className="text-[10px] ml-auto mr-2">{mod.lessons.length} items</Badge>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={e => { e.stopPropagation(); setEditingModuleId(mod.id); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={e => { e.stopPropagation(); deleteModule(mod.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1.5">
                        {mod.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center justify-between text-sm text-muted-foreground py-2 pl-2 pr-1 border-l-2 border-border hover:border-primary hover:text-foreground transition-colors rounded-r">
                            <div className="flex items-center gap-2">
                              {lessonTypeIcons[lesson.type]}
                              <span>{lesson.name}</span>
                              <Badge variant="outline" className="text-[9px] capitalize">{lessonTypeBadge[lesson.type]}</Badge>
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive/60 hover:text-destructive"
                              onClick={() => deleteLesson(mod.id, lesson.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2 mt-3 pt-2 border-t">
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => { setLessonTargetModule(mod.id); setLessonDialogOpen(true); }}>
                          <Plus className="h-3 w-3 mr-1" /> Add Content
                        </Button>
                        <Dialog open={uploadDialogOpen && uploadTargetModule === mod.id} onOpenChange={v => { setUploadDialogOpen(v); setUploadTargetModule(mod.id); }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-xs">
                              <Upload className="h-3 w-3 mr-1" /> Upload File
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Upload Resource</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Drag & drop files here, or click to browse</p>
                                <Input type="file" className="mt-3" accept=".pdf,.mp4,.pptx,.docx,.png,.jpg" />
                              </div>
                              <Button onClick={() => handleFileUpload(mod.id)} className="w-full">Upload</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {course.modules.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No modules yet. Click "Module" above to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{course.students}</p>
                  <p className="text-xs text-muted-foreground">Enrolled Learners</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{course.modules.length}</p>
                  <p className="text-xs text-muted-foreground">Modules</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Award className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{course.modules.reduce((sum, m) => sum + m.lessons.length, 0)}</p>
                  <p className="text-xs text-muted-foreground">Total Content Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
