import { useReducer, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, BookOpen, Award, Play, Video, FileText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCourse } from "@/data/courses";
import { members } from "@/data/members";
import { contentStore } from "@/data/contentStore";

const CourseDetail = () => {
  const { id } = useParams();
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => {
    const unsub = contentStore.subscribe(forceUpdate);
    return () => { unsub(); };
  }, []);

  const course = getCourse(id || "");
  if (!course) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
        </Link>
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  const enrolled = members.filter(m => m.enrolledCourseIds.includes(course.id)).length;
  const courseModules = contentStore.getModulesByCourse(course.id);
  const totalContent = contentStore.getCourseContentCount(course.id);

  return (
    <div className="space-y-8 animate-fade-in">
      <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
      </Link>

      <div className="h-48 bg-gradient-to-br from-primary/80 to-primary rounded-xl flex items-end p-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-foreground">{course.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">{course.category}</Badge>
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">{course.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{course.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {courseModules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No modules yet. Add content from the <Link to="/admin/content" className="text-primary underline">Content</Link> page.
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {courseModules.map(mod => {
                    const modQuizzes = contentStore.getQuizzesByModule(course.id, mod.id);
                    const modVideos = contentStore.getVideoLecturesByModule(course.id, mod.id);
                    const itemCount = modQuizzes.length + modVideos.length;

                    return (
                      <AccordionItem key={mod.id} value={mod.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline">
                          <div className="flex items-center gap-2 w-full">
                            <span>{mod.name}</span>
                            <Badge variant="secondary" className="text-[10px] ml-auto mr-2">{itemCount} items</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {itemCount === 0 ? (
                            <p className="text-xs text-muted-foreground py-2">No content in this module yet.</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {modQuizzes.map(quiz => (
                                <li key={quiz.id} className="flex items-center justify-between text-sm text-muted-foreground py-2 pl-2 pr-1 border-l-2 border-border hover:border-primary hover:text-foreground transition-colors rounded-r">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5 text-amber-500" />
                                    <span>{quiz.title}</span>
                                    <Badge variant="outline" className="text-[9px]">Quiz</Badge>
                                  </div>
                                  <Link to={`/learn/quiz/${quiz.id}`}>
                                    <Button size="icon" variant="ghost" className="h-7 w-7">
                                      <Play className="h-3 w-3" />
                                    </Button>
                                  </Link>
                                </li>
                              ))}
                              {modVideos.map(vid => (
                                <li key={vid.id} className="flex items-center justify-between text-sm text-muted-foreground py-2 pl-2 pr-1 border-l-2 border-border hover:border-primary hover:text-foreground transition-colors rounded-r">
                                  <div className="flex items-center gap-2">
                                    <Video className="h-3.5 w-3.5 text-blue-500" />
                                    <span>{vid.title}</span>
                                    <Badge variant="outline" className="text-[9px]">Video</Badge>
                                  </div>
                                  <Link to={`/learn/lecture/${vid.id}`}>
                                    <Button size="icon" variant="ghost" className="h-7 w-7">
                                      <Play className="h-3 w-3" />
                                    </Button>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
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
                  <p className="text-2xl font-bold text-foreground">{enrolled}</p>
                  <p className="text-xs text-muted-foreground">Enrolled Learners</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{courseModules.length}</p>
                  <p className="text-xs text-muted-foreground">Modules</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Award className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalContent}</p>
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
