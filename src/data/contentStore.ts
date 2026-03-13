// Central content store for quizzes and video lectures
// This is a simple reactive store using listeners pattern

export type QuestionType = "true-false" | "multiple-choice";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  text: string;
  // For true-false: correctAnswer is "true" or "false"
  // For multiple-choice: correctAnswer is the id of the correct option
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
  fileUrl: string; // blob URL or placeholder
  confidenceCheckpoints: ConfidenceCheckpoint[];
  createdAt: string;
}

export type ContentItem = 
  | { type: "quiz"; data: Quiz }
  | { type: "video"; data: VideoLecture };

type Listener = () => void;

class ContentStore {
  private quizzes: Quiz[] = [];
  private videoLectures: VideoLecture[] = [];
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
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
}

export const contentStore = new ContentStore();
