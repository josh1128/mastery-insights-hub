import { useReducer, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Users, BookOpen, Award, Play, Video, FileText, File, Lock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCourse } from "@/data/courses";
import { members } from "@/data/members";
import { contentStore } from "@/data/contentStore";
import { PageGlow } from "@/components/decorative/PageDecorations";
import { getClusterContentForModule } from "@/lib/clusterModuleContent";
import { clusterColors, clusterMeta, type ClusterName } from "@/data/masteryData";
import { ClusterSelector } from "@/components/course/ClusterSelector";
import { ResourcePreviewModal } from "@/components/course/ResourcePreviewModal";
import type { Resource } from "@/data/contentStore";

const CourseDetail = () => {
  const { id } = useParams();
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [selectedClusterByModule, setSelectedClusterByModule] = useState<Record<string, ClusterName>>({});
  const [resourcePreview, setResourcePreview] = useState<Resource | null>(null);

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

  const areModuleLecturesCompleted = (moduleId: string): boolean => {
    const lectures = contentStore.getVideoLecturesByModule(course.id, moduleId);
    if (lectures.length === 0) return true;
    return lectures.every(l => contentStore.isLectureCompleted("demo-learner", l.id));
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="relative z-10 space-y-8">
        <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
        </Link>

        <div className="h-48 rounded-3xl bg-indigo-50 flex items-end p-8 relative overflow-hidden border border-border">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-foreground">{course.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge className="bg-indigo-100 text-indigo-700 border-0 rounded-full">{course.category}</Badge>
              <Badge className="bg-indigo-100 text-indigo-700 border-0 rounded-full">{course.status}</Badge>
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
                      const cluster = selectedClusterByModule[mod.id] ?? "mastery";
                      const content = getClusterContentForModule(course.id, mod.id, cluster);
                      const { baseContent, clusterAdditions } = content;
                      const baseCount =
                        baseContent.videos.length +
                        baseContent.quizzes.length +
                        baseContent.resources.length;
                      const lecturesCompleted = areModuleLecturesCompleted(mod.id);

                      const setCluster = (c: ClusterName) => {
                        setSelectedClusterByModule((prev) => ({ ...prev, [mod.id]: c }));
                      };

                      const hasClusterAdditions =
                        clusterAdditions.resources.length > 0 ||
                        clusterAdditions.retestQuiz ||
                        clusterAdditions.optionalResources.length > 0;

                      return (
                        <AccordionItem key={mod.id} value={mod.id} className="border border-border/40 rounded-2xl px-4">
                          <AccordionTrigger className="text-sm font-medium hover:no-underline">
                            <div className="flex items-center gap-2 w-full">
                              <span>{mod.name}</span>
                              <Badge variant="secondary" className="text-[10px] ml-auto mr-2 rounded-full">{baseCount} items</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            {/* Cluster selector */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-border/40 mb-4">
                              <span className="text-xs text-muted-foreground">Viewing module as:</span>
                              <ClusterSelector value={cluster} onValueChange={setCluster} />
                              <Badge variant="outline" className="text-[10px] w-fit rounded-full" style={{ borderColor: clusterColors[cluster] }}>
                                {clusterMeta[cluster].label}
                              </Badge>
                            </div>

                            {/* All Content section */}
                            <div className="space-y-1">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Content</h4>
                              {baseCount === 0 ? (
                                <p className="text-xs text-muted-foreground py-2">No content in this module yet.</p>
                              ) : (
                                <ul className="space-y-1.5">
                                  {baseContent.videos.map(vid => (
                                    <li key={vid.id} className="flex items-center justify-between text-sm text-muted-foreground py-2 pl-3 pr-1 border-l-2 border-primary/20 hover:border-primary hover:text-foreground transition-colors rounded-r-lg hover:bg-indigo-50">
                                      <div className="flex items-center gap-2">
                                        <Video className="h-3.5 w-3.5 text-primary" />
                                        <span>{vid.title}</span>
                                        <Badge variant="outline" className="text-[9px] rounded-full">Video</Badge>
                                      </div>
                                      <Link to={`/learn/lecture/${vid.id}`}>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full"><Play className="h-3 w-3" /></Button>
                                      </Link>
                                    </li>
                                  ))}
                                  {baseContent.quizzes.map(quiz => {
                                    const isLocked = !lecturesCompleted;
                                    return (
                                      <li key={quiz.id} className={`flex items-center justify-between text-sm py-2 pl-3 pr-1 border-l-2 rounded-r-lg transition-colors ${
                                        isLocked ? "text-muted-foreground/50 border-border" : "text-muted-foreground border-primary/20 hover:border-primary hover:text-foreground hover:bg-indigo-50"
                                      }`}>
                                        <div className="flex items-center gap-2">
                                          {isLocked ? <Lock className="h-3.5 w-3.5 text-muted-foreground/50" /> : <FileText className="h-3.5 w-3.5 text-primary" />}
                                          <span>{quiz.title}</span>
                                          <Badge variant="outline" className="text-[9px] rounded-full">Quiz</Badge>
                                          {isLocked && <span className="text-[9px] text-muted-foreground/50">Complete all lectures first</span>}
                                        </div>
                                        {isLocked ? (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button size="icon" variant="ghost" className="h-7 w-7 opacity-30 cursor-not-allowed rounded-full" disabled>
                                                <Lock className="h-3 w-3" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Complete all lectures in this module first</TooltipContent>
                                          </Tooltip>
                                        ) : (
                                          <Link to={`/learn/quiz/${quiz.id}`}>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full"><Play className="h-3 w-3" /></Button>
                                          </Link>
                                        )}
                                      </li>
                                    );
                                  })}
                                  {baseContent.resources.map(res => (
                                    <li key={res.id} className="flex items-center justify-between text-sm text-muted-foreground py-2 pl-3 pr-1 border-l-2 border-primary/20 hover:border-primary hover:text-foreground transition-colors rounded-r-lg hover:bg-indigo-50">
                                      <button
                                        type="button"
                                        onClick={() => setResourcePreview(res)}
                                        className="flex items-center gap-2 text-left flex-1 min-w-0"
                                      >
                                        <File className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="truncate">{res.title}</span>
                                        <Badge variant="outline" className="text-[9px] rounded-full shrink-0">{res.fileType.toUpperCase()}</Badge>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* Additional Resources for this Cluster */}
                            <div className="mt-6 pt-4 border-t border-border/40">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Additional Resources for this Cluster
                              </h4>
                              {!hasClusterAdditions ? (
                                <p className="text-xs text-muted-foreground/80 py-2">No additional resources assigned for this cluster yet.</p>
                              ) : (
                                <div className="space-y-2">
                                  {clusterAdditions.resources.map(res => (
                                    <div key={res.id} className="flex items-center justify-between text-sm py-2 pl-3 pr-1 border-l-2 border-primary/30 rounded-r-lg bg-accent/20">
                                      <button
                                        type="button"
                                        onClick={() => setResourcePreview(res)}
                                        className="flex items-center gap-2 text-left flex-1 min-w-0 hover:text-foreground"
                                      >
                                        <File className="h-3.5 w-3.5 text-primary shrink-0" />
                                        <span className="truncate">{res.title}</span>
                                        <Badge variant="outline" className="text-[9px] rounded-full shrink-0">{res.fileType.toUpperCase()}</Badge>
                                        <span className="text-[9px] text-muted-foreground">Assigned</span>
                                      </button>
                                    </div>
                                  ))}
                                  {clusterAdditions.optionalResources.map(res => (
                                    <div key={res.id} className="flex items-center justify-between text-sm py-2 pl-3 pr-1 border-l-2 border-primary/20 rounded-r-lg bg-accent/10">
                                      <button
                                        type="button"
                                        onClick={() => setResourcePreview(res)}
                                        className="flex items-center gap-2 text-left flex-1 min-w-0 hover:text-foreground"
                                      >
                                        <File className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="truncate">{res.title}</span>
                                        <Badge variant="outline" className="text-[9px] rounded-full shrink-0">Optional</Badge>
                                      </button>
                                    </div>
                                  ))}
                                  {clusterAdditions.retestQuiz && (
                                    <div className="flex items-center justify-between text-sm py-2 pl-3 pr-1 border-l-2 border-primary/30 rounded-r-lg bg-accent/20">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5 text-primary" />
                                        <span>{clusterAdditions.retestQuiz.title}</span>
                                        <Badge variant="outline" className="text-[9px] rounded-full">Retest</Badge>
                                      </div>
                                      <Link to={`/learn/quiz/${clusterAdditions.retestQuiz.id}`}>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full"><Play className="h-3 w-3" /></Button>
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
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
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{enrolled}</p>
                    <p className="text-xs text-muted-foreground">Enrolled Learners</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{courseModules.length}</p>
                    <p className="text-xs text-muted-foreground">Modules</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
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

      <ResourcePreviewModal
        resource={resourcePreview}
        open={!!resourcePreview}
        onOpenChange={(open) => !open && setResourcePreview(null)}
      />
    </div>
  );
};

export default CourseDetail;
