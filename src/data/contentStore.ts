// Central content store for modules, quizzes, video lectures, resources, and interventions
// Single source of truth for all course content

import { courses as courseDefs } from "@/data/courses";

export type QuestionType = "true-false" | "multiple-choice";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  text: string;
  correctAnswer: string;
  options?: { id: string; text: string }[];
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  moduleId: string;
  captureConfidence: boolean;
  questions: QuizQuestion[];
  createdAt: string;
  isRetest?: boolean;
}

export interface ConfidenceCheckpoint {
  id: string;
  timestampSeconds: number;
  prompt: string;
}

export interface VideoLecture {
  id: string;
  title: string;
  courseId: string;
  moduleId: string;
  fileName: string;
  fileUrl: string;
  confidenceCheckpoints: ConfidenceCheckpoint[];
  createdAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  name: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  courseId: string;
  moduleId: string;
  fileName: string;
  fileUrl: string;
  fileType: string; // pdf, docx, etc.
  isOptional: boolean;
  createdAt: string;
}

export type InterventionType = "retest" | "resource" | "extra-quiz" | "message";

export interface Intervention {
  id: string;
  type: InterventionType;
  targetLearnerIds: string[];
  contentId?: string; // quiz id, resource id, etc.
  message?: string;
  courseId: string;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  learnerId: string;
  quizId: string;
  courseId: string;
  moduleId: string;
  score: number;
  averageConfidence: number | null;
  isRetest: boolean;
  submittedAt: string;
}

// Track which learners have completed which lectures
export interface LectureCompletion {
  learnerId: string;
  lectureId: string;
  completedAt: string;
}

// Track teach-back scores for mastery integration
export interface TeachBackScore {
  learnerId: string;
  quizId: string;
  courseId: string;
  moduleId: string;
  score: number; // 0-100
  completedAt: string;
}

export type ContentItem =
  | { type: "quiz"; data: Quiz }
  | { type: "video"; data: VideoLecture }
  | { type: "resource"; data: Resource };

type Listener = () => void;

class ContentStore {
  private modules: CourseModule[] = [];
  private quizzes: Quiz[] = [];
  private videoLectures: VideoLecture[] = [];
  private resources: Resource[] = [];
  private interventions: Intervention[] = [];
  private lectureCompletions: LectureCompletion[] = [];
  private teachBackScores: TeachBackScore[] = [];
  private listeners: Set<Listener> = new Set();
  private initialized = false;

  private ensureInit() {
    if (this.initialized) return;
    this.initialized = true;
    for (const course of courseDefs) {
      for (const mod of course.modules) {
        this.modules.push({
          id: mod.id,
          courseId: course.id,
          name: mod.name,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // Modules
  getModules(): CourseModule[] { this.ensureInit(); return this.modules; }
  getModulesByCourse(courseId: string): CourseModule[] { this.ensureInit(); return this.modules.filter(m => m.courseId === courseId); }
  getModule(id: string): CourseModule | undefined { this.ensureInit(); return this.modules.find(m => m.id === id); }

  addModule(mod: CourseModule) { this.ensureInit(); this.modules.push(mod); this.notify(); }

  updateModule(id: string, updates: Partial<CourseModule>) {
    this.ensureInit();
    this.modules = this.modules.map(m => m.id === id ? { ...m, ...updates } : m);
    this.notify();
  }

  deleteModule(id: string) {
    this.ensureInit();
    this.modules = this.modules.filter(m => m.id !== id);
    this.quizzes = this.quizzes.filter(q => q.moduleId !== id);
    this.videoLectures = this.videoLectures.filter(v => v.moduleId !== id);
    this.resources = this.resources.filter(r => r.moduleId !== id);
    this.notify();
  }

  // Quizzes
  getQuizzes(): Quiz[] { return this.quizzes; }
  getQuizzesByModule(courseId: string, moduleId: string): Quiz[] { return this.quizzes.filter(q => q.courseId === courseId && q.moduleId === moduleId); }
  getQuiz(id: string): Quiz | undefined { return this.quizzes.find(q => q.id === id); }

  addQuiz(quiz: Quiz) { this.quizzes.push(quiz); this.notify(); }

  updateQuiz(id: string, updates: Partial<Quiz>) {
    this.quizzes = this.quizzes.map(q => q.id === id ? { ...q, ...updates } : q);
    this.notify();
  }

  deleteQuiz(id: string) { this.quizzes = this.quizzes.filter(q => q.id !== id); this.notify(); }

  // Video Lectures
  getVideoLectures(): VideoLecture[] { return this.videoLectures; }
  getVideoLecturesByModule(courseId: string, moduleId: string): VideoLecture[] { return this.videoLectures.filter(v => v.courseId === courseId && v.moduleId === moduleId); }
  getVideoLecture(id: string): VideoLecture | undefined { return this.videoLectures.find(v => v.id === id); }

  addVideoLecture(lecture: VideoLecture) { this.videoLectures.push(lecture); this.notify(); }

  updateVideoLecture(id: string, updates: Partial<VideoLecture>) {
    this.videoLectures = this.videoLectures.map(v => v.id === id ? { ...v, ...updates } : v);
    this.notify();
  }

  deleteVideoLecture(id: string) { this.videoLectures = this.videoLectures.filter(v => v.id !== id); this.notify(); }

  // Resources
  getResources(): Resource[] { return this.resources; }
  getResourcesByModule(courseId: string, moduleId: string): Resource[] { return this.resources.filter(r => r.courseId === courseId && r.moduleId === moduleId); }
  getResource(id: string): Resource | undefined { return this.resources.find(r => r.id === id); }
  getResourcesByCourse(courseId: string): Resource[] { return this.resources.filter(r => r.courseId === courseId); }

  addResource(resource: Resource) { this.resources.push(resource); this.notify(); }

  updateResource(id: string, updates: Partial<Resource>) {
    this.resources = this.resources.map(r => r.id === id ? { ...r, ...updates } : r);
    this.notify();
  }

  deleteResource(id: string) { this.resources = this.resources.filter(r => r.id !== id); this.notify(); }

  // Interventions
  getInterventions(): Intervention[] { return this.interventions; }
  getInterventionsForLearner(learnerId: string): Intervention[] {
    return this.interventions.filter(i => i.targetLearnerIds.includes(learnerId));
  }

  addIntervention(intervention: Intervention) { this.interventions.push(intervention); this.notify(); }

  // Lecture completions
  getLectureCompletions(): LectureCompletion[] { return this.lectureCompletions; }
  isLectureCompleted(learnerId: string, lectureId: string): boolean {
    return this.lectureCompletions.some(c => c.learnerId === learnerId && c.lectureId === lectureId);
  }
  completeLecture(learnerId: string, lectureId: string) {
    if (!this.isLectureCompleted(learnerId, lectureId)) {
      this.lectureCompletions.push({ learnerId, lectureId, completedAt: new Date().toISOString() });
      this.notify();
    }
  }

  // Quiz results + mastery source of truth
  recordQuizResult(result: QuizResult) {
    // Remove any existing result from the same learner + quiz so latest wins
    this.quizResults = this.quizResults.filter(
      r => !(r.learnerId === result.learnerId && r.quizId === result.quizId),
    );
    this.quizResults.push(result);
    this.notify();
  }

  /**
   * Returns the most relevant quiz result for mastery for a learner in a course+module.
   * If any retest exists, the latest retest replaces earlier attempts.
   * Otherwise, the latest non-retest attempt is used.
   */
  getLatestQuizResultForModule(learnerId: string, courseId: string, moduleId: string): QuizResult | undefined {
    const relevant = this.quizResults.filter(
      r => r.learnerId === learnerId && r.courseId === courseId && r.moduleId === moduleId,
    );
    if (relevant.length === 0) return undefined;

    const retests = relevant.filter(r => r.isRetest);
    const pool = retests.length > 0 ? retests : relevant;
    return pool.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))[0];
  }

  /**
   * Resources explicitly assigned to a learner via interventions.
   * These are visible only to the targeted learner(s).
   */
  getAssignedResourcesForLearner(learnerId: string, courseId?: string, moduleId?: string): Resource[] {
    const interventionsForLearner = this.interventions.filter(
      i => i.type === "resource" && i.targetLearnerIds.includes(learnerId),
    );
    const contentIds = new Set(interventionsForLearner.map(i => i.contentId).filter(Boolean) as string[]);
    let res = this.resources.filter(r => contentIds.has(r.id));
    if (courseId) res = res.filter(r => r.courseId === courseId);
    if (moduleId) res = res.filter(r => r.moduleId === moduleId);
    return res;
  }

  // Get all content for a module
  getModuleContent(courseId: string, moduleId: string): ContentItem[] {
    const items: ContentItem[] = [];
    this.quizzes.filter(q => q.courseId === courseId && q.moduleId === moduleId).forEach(q => items.push({ type: "quiz", data: q }));
    this.videoLectures.filter(v => v.courseId === courseId && v.moduleId === moduleId).forEach(v => items.push({ type: "video", data: v }));
    this.resources.filter(r => r.courseId === courseId && r.moduleId === moduleId && !r.isOptional).forEach(r => items.push({ type: "resource", data: r }));
    return items;
  }

  getCourseContentCount(courseId: string): number {
    return this.quizzes.filter(q => q.courseId === courseId).length +
      this.videoLectures.filter(v => v.courseId === courseId).length +
      this.resources.filter(r => r.courseId === courseId && !r.isOptional).length;
  }

  // Teach-back scores
  getTeachBackScores(): TeachBackScore[] { return this.teachBackScores; }
  getTeachBackScore(learnerId: string, quizId: string): TeachBackScore | undefined {
    return this.teachBackScores.find(t => t.learnerId === learnerId && t.quizId === quizId);
  }
  getTeachBackScoresByModule(courseId: string, moduleId: string): TeachBackScore[] {
    return this.teachBackScores.filter(t => t.courseId === courseId && t.moduleId === moduleId);
  }
  addTeachBackScore(score: TeachBackScore) {
    // Replace existing score for same learner+quiz
    this.teachBackScores = this.teachBackScores.filter(
      t => !(t.learnerId === score.learnerId && t.quizId === score.quizId)
    );
    this.teachBackScores.push(score);
    this.notify();
  }
}

export const contentStore = new ContentStore();
