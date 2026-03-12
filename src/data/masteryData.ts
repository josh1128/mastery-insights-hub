import { Brain, AlertTriangle, TrendingDown, Eye, Sparkles } from "lucide-react";
import { members, getMemberModuleData } from "./members";
import { courses } from "./courses";

// --- Threshold config ---
export interface ThresholdConfig {
  masteryMinConfidence: number;
  masteryMinScore: number;
  guessingMaxConfidence: number;
  guessingMinScore: number;
  misconceptionMinConfidence: number;
  misconceptionMaxScore: number;
  strugglingMaxConfidence: number;
  strugglingMaxScore: number;
}

export const defaultThresholds: ThresholdConfig = {
  masteryMinConfidence: 60,
  masteryMinScore: 60,
  guessingMaxConfidence: 40,
  guessingMinScore: 60,
  misconceptionMinConfidence: 60,
  misconceptionMaxScore: 40,
  strugglingMaxConfidence: 40,
  strugglingMaxScore: 40,
};

// --- Cluster types ---
export type ClusterName = "mastery" | "guessing" | "misconception" | "struggling" | "developing";

export const clusterColors: Record<ClusterName, string> = {
  mastery: "hsl(var(--chart-success))",
  guessing: "hsl(var(--chart-info))",
  misconception: "hsl(var(--chart-danger))",
  struggling: "hsl(var(--chart-warning))",
  developing: "hsl(var(--chart-primary))",
};

export const clusterMeta: Record<ClusterName, { label: string; icon: typeof Brain; desc: string; colorClass: string }> = {
  mastery: { label: "True Mastery", icon: Brain, desc: "High confidence + high score", colorClass: "text-success" },
  guessing: { label: "Possible Guessing", icon: Eye, desc: "Low confidence + high score", colorClass: "text-chart-info" },
  misconception: { label: "Misconception Risk", icon: AlertTriangle, desc: "High confidence + low score", colorClass: "text-destructive" },
  struggling: { label: "Struggling", icon: TrendingDown, desc: "Low confidence + low score", colorClass: "text-warning" },
  developing: { label: "Developing", icon: Sparkles, desc: "Near threshold (transition zone)", colorClass: "text-primary" },
};

// --- Student data point ---
export interface LearnerDataPoint {
  id: string;
  name: string;
  confidence: number;
  score: number;
  cluster: ClusterName;
}

// --- Classification ---
export function classifyStudent(s: { confidence: number; score: number }, t: ThresholdConfig): ClusterName {
  if (s.score >= t.masteryMinScore && s.confidence >= t.masteryMinConfidence) return "mastery";
  if (s.score >= t.guessingMinScore && s.confidence <= t.guessingMaxConfidence) return "guessing";
  if (s.score <= t.misconceptionMaxScore && s.confidence >= t.misconceptionMinConfidence) return "misconception";
  if (s.score <= t.strugglingMaxScore && s.confidence <= t.strugglingMaxConfidence) return "struggling";
  return "developing";
}

/**
 * Get classified learner data for a specific course + module (or "all" modules).
 */
export function getLearnerDataForModule(
  courseId: string,
  moduleId: string,
  thresholds: ThresholdConfig
): LearnerDataPoint[] {
  const course = courses.find(c => c.id === courseId);
  if (!course) return [];

  const enrolledMembers = members.filter(m => m.enrolledCourseIds.includes(courseId));

  if (moduleId === "all") {
    // Average across all modules
    return enrolledMembers.map(m => {
      let totalScore = 0, totalConf = 0;
      course.modules.forEach(mod => {
        const data = getMemberModuleData(m.id, courseId, mod.id);
        totalScore += data.score;
        totalConf += data.confidence;
      });
      const avg = {
        score: Math.round(totalScore / course.modules.length),
        confidence: Math.round(totalConf / course.modules.length),
      };
      return {
        id: m.id,
        name: m.name,
        ...avg,
        cluster: classifyStudent(avg, thresholds),
      };
    });
  }

  return enrolledMembers.map(m => {
    const data = getMemberModuleData(m.id, courseId, moduleId);
    return {
      id: m.id,
      name: m.name,
      ...data,
      cluster: classifyStudent(data, thresholds),
    };
  });
}
