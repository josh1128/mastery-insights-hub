import { Brain, AlertTriangle, TrendingDown, Eye } from "lucide-react";
import { members, getMemberModuleData } from "./members";
import { courses } from "./courses";

// --- Threshold config ---
export interface ThresholdConfig {
  scoreThreshold: number;
  confidenceThreshold: number;
  labels: Record<ClusterName, string>;
}

// --- Cluster types ---
export type ClusterName = "mastery" | "overconfident" | "underconfident" | "struggling";

export const defaultThresholds: ThresholdConfig = {
  scoreThreshold: 65,
  confidenceThreshold: 65,
  labels: {
    mastery: "Mastery",
    overconfident: "Overconfident",
    underconfident: "Underconfident",
    struggling: "Struggling",
  }
};

/* Semantic learner cluster colors (exact across app: badges, charts, text) */
export const clusterColors: Record<ClusterName, string> = {
  mastery: "#10b981",         /* Emerald/Green — Confident & Correct */
  overconfident: "#3b82f6",   /* Blue — Confident & Wrong */
  underconfident: "#eab308",  /* Yellow — Unsure & Correct */
  struggling: "#ef4444",      /* Red — Unsure & Wrong */
};

export const clusterMeta: Record<ClusterName, { icon: any; desc: string; characteristics: string; colorClass: string }> = {
    mastery: { 
      icon: Brain, 
      desc: "Confident & Correct", 
      characteristics: "Current signals show the learner answered correctly and reported high confidence. This may indicate solid understanding, though continued practice can help reinforce mastery.", 
      colorClass: "text-success" 
    },
  
    overconfident: { 
      icon: AlertTriangle, 
      desc: "Confident & Wrong", 
      characteristics: "Current signals show the learner answered incorrectly while reporting high confidence. This pattern may suggest a possible misconception worth revisiting.", 
      colorClass: "text-destructive" 
    },
  
    underconfident: { 
      icon: Eye, 
      desc: "Unsure & Correct", 
      characteristics: "Current signals show the learner answered correctly but reported low confidence. This may indicate emerging understanding that could benefit from reassurance or additional practice.", 
      colorClass: "text-chart-info" 
    },
  
    struggling: { 
      icon: TrendingDown, 
      desc: "Unsure & Wrong", 
      characteristics: "Current signals show the learner answered incorrectly and reported low confidence. This pattern may indicate an area where additional support or review could help.", 
      colorClass: "text-warning" 
    }
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
  const isCorrect = s.score >= t.scoreThreshold;
  const isConfident = s.confidence >= t.confidenceThreshold;

  if (isCorrect && isConfident) return "mastery";
  if (!isCorrect && isConfident) return "overconfident";
  if (isCorrect && !isConfident) return "underconfident";
  return "struggling";
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

// ============================================================================
// DRILL-DOWN CHART DATA GENERATORS
// ============================================================================

export interface BarChartDataPoint {
  name: string;
  rate: number;
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  fill: string; // The hex color for Recharts
}

/**
 * Generates data for the Bar Chart.
 */
export function getMasteryBarChartData(courseId: string, moduleId: string): BarChartDataPoint[] {
  const course = courses.find(c => c.id === courseId);
  if (!course) return [];

  const enrolledMembers = members.filter(m => m.enrolledCourseIds.includes(courseId));

  if (moduleId === "all") {
    return course.modules.map(mod => {
      let totalScore = 0;
      enrolledMembers.forEach(m => {
        totalScore += getMemberModuleData(m.id, courseId, mod.id).score;
      });
      const avgScore = enrolledMembers.length > 0 ? Math.round(totalScore / enrolledMembers.length) : 0;
      
      return {
        // FIX: Changed mod.title to mod.name
        name: mod.name || `Module ${mod.id.replace('m', '')}`,
        rate: avgScore,
      };
    });
  } else {
    let totalScore = 0;
    enrolledMembers.forEach(m => {
      totalScore += getMemberModuleData(m.id, courseId, moduleId).score;
    });
    const baseAvg = enrolledMembers.length > 0 ? Math.round(totalScore / enrolledMembers.length) : 0;

    return [
      { name: "Quiz 1", rate: Math.min(100, baseAvg + 6) },
      { name: "Quiz 2", rate: Math.max(0, baseAvg - 4) },
      { name: "Quiz 3", rate: baseAvg },
    ];
  }
}

/**
 * Generates data for the Cluster Pie/Donut Chart.
 */
export function getClusterPieChartData(
  courseId: string, 
  moduleId: string, 
  thresholds: ThresholdConfig
): PieChartDataPoint[] {
  const learners = getLearnerDataForModule(courseId, moduleId, thresholds);
  
  const counts: Record<ClusterName, number> = {
    mastery: 0,
    overconfident: 0,
    underconfident: 0,
    struggling: 0,
  };

  learners.forEach(l => {
    counts[l.cluster]++;
  });

  const pieData = [
    { name: "Mastery", value: counts.mastery, fill: clusterColors.mastery },
    { name: "Overconfident", value: counts.overconfident, fill: clusterColors.overconfident },
    { name: "Underconfident", value: counts.underconfident, fill: clusterColors.underconfident },
    { name: "Struggling", value: counts.struggling, fill: clusterColors.struggling },
  ];

  return pieData.filter(data => data.value > 0); 
}