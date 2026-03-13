// Central content store for modules, quizzes, and video lectures
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

export type ContentItem =
  | { type: "quiz"; data: Quiz }
  | { type: "video"; data: VideoLecture };

type Listener = () => void;

class ContentStore {
  private modules: CourseModule[] = [];
  private quizzes: Quiz[] = [];
  private videoLectures: VideoLecture[] = [];
  private listeners: Set<Listener> = new Set();
  private initialized = false;

  private ensureInit() {
    if (this.initialized) return;
    this.initialized = true;
    // Seed modules from course definitions
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
  getModules(): CourseModule[] {
    this.ensureInit();
    return this.modules;
  }

  getModulesByCourse(courseId: string): CourseModule[] {
    this.ensureInit();
    return this.modules.filter(m => m.courseId === courseId);
  }

  getModule(id: string): CourseModule | undefined {
    this.ensureInit();
    return this.modules.find(m => m.id === id);
  }

  addModule(mod: CourseModule) {
    this.ensureInit();
    this.modules.push(mod);
    this.notify();
  }

  updateModule(id: string, updates: Partial<CourseModule>) {
    this.ensureInit();
    this.modules = this.modules.map(m => m.id === id ? { ...m, ...updates } : m);
    this.notify();
  }

  deleteModule(id: string) {
    this.ensureInit();
    this.modules = this.modules.filter(m => m.id !== id);
    // Also delete all content in this module
    this.quizzes = this.quizzes.filter(q => q.moduleId !== id);
    this.videoLectures = this.videoLectures.filter(v => v.moduleId !== id);
    this.notify();
  }

  // Quizzes
  getQuizzes(): Quiz[] { return this.quizzes; }

  getQuizzesByModule(courseId: string, moduleId: string): Quiz[] {
    return this.quizzes.filter(q => q.courseId === courseId && q.moduleId === moduleId);
  }

  getQuiz(id: string): Quiz | undefined {
    return this.quizzes.find(q => q.id === id);
  }

  addQuiz(quiz: Quiz) {
    this.quizzes.push(quiz);
    this.notify();
  }

  updateQuiz(id: string, updates: Partial<Quiz>) {
    this.quizzes = this.quizzes.map(q => q.id === id ? { ...q, ...updates } : q);
    this.notify();
  }

  deleteQuiz(id: string) {
    this.quizzes = this.quizzes.filter(q => q.id !== id);
    this.notify();
  }

  // Video Lectures
  getVideoLectures(): VideoLecture[] { return this.videoLectures; }

  getVideoLecturesByModule(courseId: string, moduleId: string): VideoLecture[] {
    return this.videoLectures.filter(v => v.courseId === courseId && v.moduleId === moduleId);
  }

  getVideoLecture(id: string): VideoLecture | undefined {
    return this.videoLectures.find(v => v.id === id);
  }

  addVideoLecture(lecture: VideoLecture) {
    this.videoLectures.push(lecture);
    this.notify();
  }

  updateVideoLecture(id: string, updates: Partial<VideoLecture>) {
    this.videoLectures = this.videoLectures.map(v => v.id === id ? { ...v, ...updates } : v);
    this.notify();
  }

  deleteVideoLecture(id: string) {
    this.videoLectures = this.videoLectures.filter(v => v.id !== id);
    this.notify();
  }

  // Get all content for a module
  getModuleContent(courseId: string, moduleId: string): ContentItem[] {
    const items: ContentItem[] = [];
    this.quizzes
      .filter(q => q.courseId === courseId && q.moduleId === moduleId)
      .forEach(q => items.push({ type: "quiz", data: q }));
    this.videoLectures
      .filter(v => v.courseId === courseId && v.moduleId === moduleId)
      .forEach(v => items.push({ type: "video", data: v }));
    return items;
  }

  // Get total content count for a course
  getCourseContentCount(courseId: string): number {
    return this.quizzes.filter(q => q.courseId === courseId).length +
      this.videoLectures.filter(v => v.courseId === courseId).length;
  }
}

export const contentStore = new ContentStore();
