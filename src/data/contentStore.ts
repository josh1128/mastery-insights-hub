// Central content store for modules, quizzes, video lectures, resources, and interventions
import { courses as courseDefs } from "@/data/courses";
import { demoVideos, demoResources, demoQuizzes } from "@/data/democontent";

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

// ... (Rest of your interfaces: VideoLecture, CourseModule, Resource, etc. stay the same)

export interface Resource {
  id: string;
  title: string;
  courseId: string;
  moduleId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  isOptional: boolean;
  createdAt: string;
}

export interface ConfidenceCheckpoint {
  timestamp: number;
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

export type InterventionType = "retest" | "resource" | "extra-quiz" | "message";

export interface Intervention {
  id: string;
  type: InterventionType;
  targetLearnerIds: string[];
  contentId?: string;
  message?: string;
  courseId: string;
  createdAt: string;
}

export interface LectureCompletion {
  learnerId: string;
  lectureId: string;
  completedAt: string;
}

export interface TeachBackScore {
  learnerId: string;
  quizId: string;
  courseId: string;
  moduleId: string;
  score: number;
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
  private quizResults: QuizResult[] = [];
  private teachBackScores: TeachBackScore[] = [];
  // Per-learner enrollments so we can persist Marcus' catalog state
  private learnerEnrollments: Record<string, string[]> = {};
  private listeners: Set<Listener> = new Set();
  private initialized = false;

  private ensureInit() {
    if (this.initialized) return;
    this.initialized = true;
    
    // FIRST: Load any previously saved data from Marcus's sessions
    this.loadFromDisk();

    // SECOND: Load defaults if nothing was in disk
    if (this.modules.length === 0) {
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
    
    if (this.quizzes.length === 0) this.quizzes = demoQuizzes;
    if (this.videoLectures.length === 0) this.videoLectures = demoVideos;
    if (this.resources.length === 0) this.resources = demoResources;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- PERSISTENCE LOGIC ---

  private saveToDisk() {
    try {
      const data = {
        quizzes: this.quizzes,
        videoLectures: this.videoLectures,
        resources: this.resources,
        interventions: this.interventions,
        lectureCompletions: this.lectureCompletions,
        quizResults: this.quizResults,
        teachBackScores: this.teachBackScores,
        learnerEnrollments: this.learnerEnrollments,
      };
      localStorage.setItem("mastery_hub_data", JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.error("Failed to save data to disk", e);
    }
  }

  private loadFromDisk() {
    try {
      const saved = localStorage.getItem("mastery_hub_data");
      if (saved) {
        const data = JSON.parse(saved);
        this.quizzes = data.quizzes || [];
        this.videoLectures = data.videoLectures || [];
        this.resources = data.resources || [];
        this.interventions = data.interventions || [];
        this.lectureCompletions = data.lectureCompletions || [];
        this.quizResults = data.quizResults || [];
        this.teachBackScores = data.teachBackScores || [];
        this.learnerEnrollments = data.learnerEnrollments || {};
      }
    } catch (e) {
      console.warn("Could not load data from disk.");
    }
  }

  // --- MASTERY & RESULTS ---

  /**
   * FIXED: This method now exists to match your MarcusDashboard call.
   */
  saveQuizResult(learnerId: string, courseId: string, moduleId: string, data: { score: number, averageConfidence: number, completedAt: string }) {
    const result: QuizResult = {
      id: `res-${Date.now()}`,
      learnerId,
      courseId,
      moduleId,
      quizId: "manual-assessment", 
      score: data.score,
      averageConfidence: data.averageConfidence,
      isRetest: false,
      submittedAt: data.completedAt
    };
    this.recordQuizResult(result);
  }

  recordQuizResult(result: QuizResult) {
    this.ensureInit();
    const existingIndex = this.quizResults.findIndex(
      (r) => r.learnerId === result.learnerId && r.moduleId === result.moduleId
    );

    if (existingIndex !== -1) {
      this.quizResults[existingIndex] = {
        ...this.quizResults[existingIndex],
        score: result.score,
        averageConfidence: result.averageConfidence,
        submittedAt: result.submittedAt,
        isRetest: true
      };
    } else {
      this.quizResults.push(result);
    }
    
    this.saveToDisk();
  }

  getLatestQuizResultForModule(learnerId: string, courseId: string, moduleId: string): QuizResult | undefined {
    this.ensureInit();
    const relevant = this.quizResults.filter(
      r => r.learnerId === learnerId && r.courseId === courseId && r.moduleId === moduleId,
    );
    if (relevant.length === 0) return undefined;

    return [...relevant].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))[0];
  }

  // --- MASTERY GATING HELPERS ---

  /**
   * Simple mastery label based on latest score only.
   */
  getModuleMasteryStatus(
    learnerId: string,
    courseId: string,
    moduleId: string
  ): "Mastered" | "Developing" | "Struggling" | "Not started" {
    const latest = this.getLatestQuizResultForModule(learnerId, courseId, moduleId);
    if (!latest) return "Not started";
    if (latest.score >= 80) return "Mastered";
    if (latest.score >= 50) return "Developing";
    return "Struggling";
  }

  /**
   * A module is unlocked if it's the first module in the course,
   * or if the previous module's latest score is >= 80.
   */
  isModuleUnlocked(learnerId: string, courseId: string, moduleId: string): boolean {
    this.ensureInit();
    const course = courseDefs.find((c) => c.id === courseId);
    if (!course) return false;

    const index = course.modules.findIndex((m) => m.id === moduleId);
    if (index === -1) return false;
    if (index === 0) return true;

    const prev = course.modules[index - 1];
    const latestPrev = this.getLatestQuizResultForModule(learnerId, courseId, prev.id);
    return !!latestPrev && latestPrev.score >= 80;
  }

  /**
   * Ordered modules for a course, decorated for learner dashboards.
   */
  getLearnerModuleStates(learnerId: string, courseId: string) {
    this.ensureInit();
    const course = courseDefs.find((c) => c.id === courseId);
    if (!course) return [];

    return course.modules.map((m) => {
      const latest = this.getLatestQuizResultForModule(learnerId, courseId, m.id);
      const status = this.getModuleMasteryStatus(learnerId, courseId, m.id);
      const unlocked = this.isModuleUnlocked(learnerId, courseId, m.id);

      return {
        id: m.id,
        name: m.name,
        latestScore: latest?.score ?? null,
        status,
        unlocked,
      };
    });
  }

  // --- MODULES & CONTENT ---

  getModules(): CourseModule[] {
    this.ensureInit();
    return this.modules;
  }

  getModulesByCourse(courseId: string): CourseModule[] {
    this.ensureInit();
    return this.modules.filter((m) => m.courseId === courseId);
  }

  getQuizzes(): Quiz[] {
    this.ensureInit();
    return this.quizzes;
  }

  getQuizzesByModule(courseId: string, moduleId: string): Quiz[] {
    this.ensureInit();
    return this.quizzes.filter((q) => q.courseId === courseId && q.moduleId === moduleId);
  }

  getQuiz(id: string): Quiz | undefined {
    this.ensureInit();
    return this.quizzes.find((q) => q.id === id);
  }

  getVideoLectures(): VideoLecture[] {
    this.ensureInit();
    return this.videoLectures;
  }

  getVideoLecture(id: string): VideoLecture | undefined {
    this.ensureInit();
    return this.videoLectures.find((v) => v.id === id);
  }

  getVideoLecturesByModule(courseId: string, moduleId: string): VideoLecture[] {
    this.ensureInit();
    return this.videoLectures.filter(
      (v) => v.courseId === courseId && v.moduleId === moduleId
    );
  }

  getResources(): Resource[] {
    this.ensureInit();
    return this.resources;
  }

  getResource(id: string): Resource | undefined {
    this.ensureInit();
    return this.resources.find((r) => r.id === id);
  }

  getResourcesByModule(courseId: string, moduleId: string): Resource[] {
    this.ensureInit();
    return this.resources.filter(
      (r) => r.courseId === courseId && r.moduleId === moduleId
    );
  }

  getCourseContentCount(courseId: string): number {
    this.ensureInit();
    const quizCount = this.quizzes.filter((q) => q.courseId === courseId).length;
    const videoCount = this.videoLectures.filter((v) => v.courseId === courseId).length;
    const resourceCount = this.resources.filter((r) => r.courseId === courseId).length;
    return quizCount + videoCount + resourceCount;
  }

  addModule(mod: CourseModule) {
    this.ensureInit();
    this.modules.push(mod);
    this.saveToDisk();
  }

  updateModule(id: string, patch: Partial<CourseModule>) {
    this.ensureInit();
    this.modules = this.modules.map((m) => (m.id === id ? { ...m, ...patch } : m));
    this.saveToDisk();
  }

  deleteModule(id: string) {
    this.ensureInit();
    this.modules = this.modules.filter((m) => m.id !== id);
    this.quizzes = this.quizzes.filter((q) => q.moduleId !== id);
    this.videoLectures = this.videoLectures.filter((v) => v.moduleId !== id);
    this.resources = this.resources.filter((r) => r.moduleId !== id);
    this.saveToDisk();
  }

  addQuiz(quiz: Quiz) {
    this.ensureInit();
    this.quizzes.push(quiz);
    this.saveToDisk();
  }

  updateQuiz(id: string, patch: Partial<Quiz>) {
    this.ensureInit();
    this.quizzes = this.quizzes.map((q) => (q.id === id ? { ...q, ...patch } : q));
    this.saveToDisk();
  }

  deleteQuiz(id: string) {
    this.ensureInit();
    this.quizzes = this.quizzes.filter((q) => q.id !== id);
    this.saveToDisk();
  }

  addVideoLecture(lecture: VideoLecture) {
    this.ensureInit();
    this.videoLectures.push(lecture);
    this.saveToDisk();
  }

  updateVideoLecture(id: string, patch: Partial<VideoLecture>) {
    this.ensureInit();
    this.videoLectures = this.videoLectures.map((v) =>
      v.id === id ? { ...v, ...patch } : v
    );
    this.saveToDisk();
  }

  deleteVideoLecture(id: string) {
    this.ensureInit();
    this.videoLectures = this.videoLectures.filter((v) => v.id !== id);
    this.saveToDisk();
  }

  addResource(resource: Resource) {
    this.ensureInit();
    this.resources.push(resource);
    this.saveToDisk();
  }

  updateResource(id: string, patch: Partial<Resource>) {
    this.ensureInit();
    this.resources = this.resources.map((r) => (r.id === id ? { ...r, ...patch } : r));
    this.saveToDisk();
  }

  deleteResource(id: string) {
    this.ensureInit();
    this.resources = this.resources.filter((r) => r.id !== id);
    this.saveToDisk();
  }

  // --- Lecture completions ---

  completeLecture(learnerId: string, lectureId: string) {
    this.ensureInit();
    const existingIndex = this.lectureCompletions.findIndex(
      (c) => c.learnerId === learnerId && c.lectureId === lectureId
    );
    const completion: LectureCompletion = {
      learnerId,
      lectureId,
      completedAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      this.lectureCompletions[existingIndex] = completion;
    } else {
      this.lectureCompletions.push(completion);
    }

    this.saveToDisk();
  }

  isLectureCompleted(learnerId: string, lectureId: string): boolean {
    this.ensureInit();
    return this.lectureCompletions.some(
      (c) => c.learnerId === learnerId && c.lectureId === lectureId
    );
  }

  // --- Interventions ---

  addIntervention(intervention: Intervention) {
    this.ensureInit();
    this.interventions.push(intervention);
    this.saveToDisk();
  }

  getInterventions(): Intervention[] {
    this.ensureInit();
    return this.interventions;
  }

  getInterventionsForLearner(learnerId: string): Intervention[] {
    this.ensureInit();
    return this.interventions.filter((i) =>
      i.targetLearnerIds.includes(learnerId)
    );
  }

  // --- Enrollment helpers (per-learner, persisted) ---

  getEnrolledCourseIds(learnerId: string): string[] {
    this.ensureInit();
    return this.learnerEnrollments[learnerId] ?? [];
  }

  enrollLearnerInCourse(learnerId: string, courseId: string) {
    this.ensureInit();
    const current = this.learnerEnrollments[learnerId] ?? [];
    if (!current.includes(courseId)) {
      this.learnerEnrollments[learnerId] = [...current, courseId];
      this.saveToDisk();
    }
  }

  setEnrolledCourseIds(learnerId: string, courseIds: string[]) {
    this.ensureInit();
    this.learnerEnrollments[learnerId] = [...new Set(courseIds)];
    this.saveToDisk();
  }
}

export const contentStore = new ContentStore();