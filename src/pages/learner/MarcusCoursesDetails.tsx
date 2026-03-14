import { useReducer, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Play, Video, FileText, File, Lock, Brain, Target, TrendingUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCourse } from "@/data/courses";
import { contentStore } from "@/data/contentStore";
import { ResourcePreviewModal } from "@/components/course/ResourcePreviewModal";
import { getMemberModuleData } from "@/data/members";
import { getClusterContentForModule } from "@/lib/clusterModuleContent";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import type { Resource } from "@/data/contentStore";

const MARCUS_ID = "member-marcus";

function getMasteryLabel(score: number, confidence: number): { label: string; color: string } {
  const highScore = score >= 70;
  const highConf = confidence >= 70;
  if (highScore && highConf) return { label: "Mastery", color: "bg-emerald-100 text-emerald-700" };
  if (!highScore && highConf) return { label: "Overconfident", color: "bg-orange-100 text-orange-700" };
  if (highScore && !highConf) return { label: "Underconfident", color: "bg-blue-100 text-blue-700" };
  if (score === 0 && confidence === 0) return { label: "Not attempted", color: "bg-slate-100 text-slate-500" };
  return { label: "Struggling", color: "bg-red-100 text-red-700" };
}

const MarcusCourseDetail = () => {
  const { id } = useParams();
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [resourcePreview, setResourcePreview] = useState<Resource | null>(null);

  useEffect(() => {
    const unsub = contentStore.subscribe(forceUpdate);
    return () => { unsub(); };
  }, []);

  const course = getCourse(id || "");
  if (!course) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link to="/learner/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Courses
        </Link>
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  const courseModules = contentStore.getModulesByCourse(course.id);

  const areModuleLecturesCompleted = (moduleId: string): boolean => {
    const lectures = contentStore.getVideoLecturesByModule(course.id, moduleId);
    if (lectures.length === 0) return true;
    return lectures.every(l => contentStore.isLectureCompleted(MARCUS_ID, l.id));
  };

  const modulesAttempted = courseModules.filter(mod => {
    const data = getMemberModuleData(MARCUS_ID, course.id, mod.id);
    return data.score > 0 || data.confidence > 0;
  }).length;

  const overallProgress = courseModules.length > 0
    ? Math.round((modulesAttempted / courseModules.length) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="relative z-10 space-y-8">
        <Link to="/learner/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Courses
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
                    No modules available yet.
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-2">
                    {courseModules.map(mod => {
                      const moduleData = getMemberModuleData(MARCUS_ID, course.id, mod.id);
                      const mastery = getMasteryLabel(moduleData.score, moduleData.confidence);
                      const lecturesCompleted = areModuleLecturesCompleted(mod.id);
                      const attempted = moduleData.score > 0 || moduleData.confidence > 0;

                      const videos = contentStore.getVideoLectures().filter(v => v.moduleId === mod.id && v.courseId === course.id);
                      const quizzes = contentStore.getQuizzesByModule
                      ? contentStore.getQuizzesByModule(course.id, mod.id).filter(q => !q.isRetest)
                      : contentStore.getQuizzes().filter(q => q.moduleId === mod.id && !q.isRetest);
                      const allResources = contentStore.getResources().filter(r => r.moduleId === mod.id && r.courseId === course.id);
                      const requiredResources = allResources.filter(r => !r.isOptional);
                      const baseCount = videos.length + quizzes.length + requiredResources.length;

                      // Derive Marcus's actual cluster from his scores
const marcusCluster = (() => {
    const { score, confidence } = moduleData;
    const highScore = score >= 70;
    const highConf = confidence >= 70;
    if (highScore && highConf) return "mastery";
    if (!highScore && highConf) return "overconfident";
    if (highScore && !highConf) return "underconfident";
    return "struggling";
  })();
  
  const { clusterAdditions } = getClusterContentForModule(course.id, mod.id, marcusCluster);
// Read from interventions — filtered to this module only
const rawAssignedResources = contentStore.getAssignedResourcesForLearner(MARCUS_ID, course.id, mod.id);
const assignedResources = mastery.label !== "Mastery" && mastery.label !== "Not attempted"
  ? rawAssignedResources
  : [];
const allOptional: typeof allResources = [];
const assignedRetestIds = contentStore.getInterventionsForLearner(MARCUS_ID)
  .filter(i => i.type === "retest" && i.courseId === course.id)
  .map(i => i.contentId)
  .filter(Boolean) as string[];

const retestQuiz = mastery.label !== "Mastery" && mastery.label !== "Not attempted" && assignedRetestIds.length > 0
  ? contentStore.getQuiz(assignedRetestIds[assignedRetestIds.length - 1])
  : undefined;
const hasAdditional = assignedResources.length > 0 || allOptional.length > 0 || !!retestQuiz;

                      return (
                        <AccordionItem key={mod.id} value={mod.id} className="border border-border/40 rounded-2xl px-4">
                          <AccordionTrigger className="text-sm font-medium hover:no-underline">
                            <div className="flex items-center gap-2 w-full">
                              <span>{mod.name}</span>
                              <div className="ml-auto mr-2 flex items-center gap-2">
                                {attempted && (
                                  <Badge className={`text-[10px] rounded-full border-0 ${mastery.color}`}>
                                    {mastery.label}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-[10px] rounded-full">
                                  {baseCount} items
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>

                            {/* Marcus's score */}
                            {attempted && (
                              <div className="grid grid-cols-2 gap-3 mb-4 pt-2">
                                <div className="bg-slate-50 rounded-2xl p-3">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Target className="h-3 w-3 text-indigo-500" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                                  </div>
                                  <p className="text-2xl font-black text-slate-900">{moduleData.score}%</p>
                                  <Progress value={moduleData.score} className="h-1.5 mt-1.5 bg-slate-200" />
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-3">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Brain className="h-3 w-3 text-violet-500" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence</p>
                                  </div>
                                  <p className="text-2xl font-black text-slate-900">{moduleData.confidence}%</p>
                                  <Progress value={moduleData.confidence} className="h-1.5 mt-1.5 bg-slate-200" />
                                </div>
                              </div>
                            )}

                            {/* Base content */}
                            <div className="space-y-1">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Content</h4>
                              {baseCount === 0 ? (
                                <p className="text-xs text-muted-foreground py-2">No content in this module yet.</p>
                              ) : (
                                <ul className="space-y-1.5">
                                  {videos.map(vid => (
                                    <li key={vid.id} className="flex items-center justify-between text-sm text-muted-foreground py-2 pl-3 pr-1 border-l-2 border-primary/20 hover:border-primary hover:text-foreground transition-colors rounded-r-lg hover:bg-indigo-50">
                                      <div className="flex items-center gap-2">
                                        <Video className="h-3.5 w-3.5 text-primary" />
                                        <span>{vid.title}</span>
                                        <Badge variant="outline" className="text-[9px] rounded-full">Video</Badge>
                                      </div>
                                      <Link to={`/learner/lecture/${vid.id}`}>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                                          <Play className="h-3 w-3" />
                                        </Button>
                                      </Link>
                                    </li>
                                  ))}
                                  {quizzes.map(quiz => {
                                    const isLocked = !lecturesCompleted;
                                    return (
                                      <li key={quiz.id} className={`flex items-center justify-between text-sm py-2 pl-3 pr-1 border-l-2 rounded-r-lg transition-colors ${
                                        isLocked ? "text-muted-foreground/50 border-border" : "text-muted-foreground border-primary/20 hover:border-primary hover:text-foreground hover:bg-indigo-50"
                                      }`}>
                                        <div className="flex items-center gap-2">
                                          {isLocked
                                            ? <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                                            : <FileText className="h-3.5 w-3.5 text-primary" />}
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
                                            <TooltipContent>Complete all lectures first</TooltipContent>
                                          </Tooltip>
                                        ) : (
                                          <Link to={`/learner/quiz/${quiz.id}?return=/learner/courses/${course.id}`}>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                                              <Play className="h-3 w-3" />
                                            </Button>
                                          </Link>
                                        )}
                                      </li>
                                    );
                                  })}
                                  {requiredResources.map(res => (
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

                            {/* From your instructor */}
                            {hasAdditional && (
                              <div className="mt-6 pt-4 border-t border-border/40 space-y-2">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                  From your instructor
                                </h4>
                                {assignedResources.map(res => (
                                  <div key={res.id} className="flex items-center justify-between text-sm py-2 pl-3 pr-1 border-l-2 border-indigo-200 rounded-r-lg bg-indigo-50/50">
                                    <button
                                      type="button"
                                      onClick={() => setResourcePreview(res)}
                                      className="flex items-center gap-2 text-left flex-1 min-w-0 hover:text-foreground"
                                    >
                                      <File className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                      <span className="truncate">{res.title}</span>
                                      <Badge variant="outline" className="text-[9px] rounded-full shrink-0">{res.fileType.toUpperCase()}</Badge>
                                      <Badge className="text-[9px] rounded-full border-0 bg-indigo-100 text-indigo-700 shrink-0">Assigned</Badge>
                                    </button>
                                  </div>
                                ))}
                                {allOptional.map(res => (
                                  <div key={res.id} className="flex items-center justify-between text-sm py-2 pl-3 pr-1 border-l-2 border-border/40 rounded-r-lg bg-slate-50/50">
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
                                {retestQuiz && (
                                  <div className="flex items-center justify-between text-sm py-2 pl-3 pr-1 border-l-2 border-indigo-200 rounded-r-lg bg-indigo-50/50">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-3.5 w-3.5 text-indigo-500" />
                                      <span>{retestQuiz.title}</span>
                                      <Badge className="text-[9px] rounded-full border-0 bg-indigo-100 text-indigo-700">Retest</Badge>
                                    </div>
                                    <Link to={`/learner/quiz/${retestQuiz.id}?return=/learner/courses/${course.id}`}>
                                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full">
                                        <Play className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                  </div>
                                )}
                              </div>
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

          {/* Right: Marcus's personal stats */}
          <div className="space-y-5">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{overallProgress}%</p>
                    <p className="text-xs text-muted-foreground">Modules attempted</p>
                  </div>
                </div>
                <Progress value={overallProgress} className="h-2 bg-slate-100" />
                <div className="pt-2 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Module Breakdown</p>
                  {courseModules.map(mod => {
                    const data = getMemberModuleData(MARCUS_ID, course.id, mod.id);
                    const mastery = getMasteryLabel(data.score, data.confidence);
                    return (
                      <div key={mod.id} className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate max-w-[140px]">{mod.name}</p>
                        <Badge className={`text-[9px] rounded-full border-0 ${mastery.color}`}>
                          {mastery.label}
                        </Badge>
                      </div>
                    );
                  })}
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

export default MarcusCourseDetail;