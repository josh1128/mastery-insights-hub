import { Brain, AlertTriangle, TrendingDown, Eye, Sparkles } from "lucide-react";

// --- Threshold config with per-cluster granularity ---
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
  mastery: { label: "Mastery Achieved", icon: Brain, desc: "High confidence + high score", colorClass: "text-success" },
  guessing: { label: "Possible Guessing", icon: Eye, desc: "Low confidence + high score", colorClass: "text-chart-info" },
  misconception: { label: "Misconception Risk", icon: AlertTriangle, desc: "High confidence + low score", colorClass: "text-destructive" },
  struggling: { label: "Struggling", icon: TrendingDown, desc: "Low confidence + low score", colorClass: "text-warning" },
  developing: { label: "Developing", icon: Sparkles, desc: "Near threshold (transition zone)", colorClass: "text-primary" },
};

// --- Student data point ---
export interface LearnerDataPoint {
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

// --- Module data generation ---
export interface StudentPoint {
  name: string;
  confidence: number;
  score: number;
}

const generateModuleData = (seed: number): StudentPoint[] => {
  const rng = (s: number) => { s = Math.sin(s) * 10000; return s - Math.floor(s); };
  const data: StudentPoint[] = [];
  for (let i = 0; i < 55; i++) {
    const r1 = rng(seed + i * 7);
    const r2 = rng(seed + i * 13 + 3);
    data.push({
      name: `Student ${i + 1}`,
      confidence: Math.round(r1 * 100),
      score: Math.round(r2 * 100),
    });
  }
  return data;
};

export const moduleDataMap: Record<string, { label: string; data: StudentPoint[] }> = {
  all: { label: "All Modules", data: generateModuleData(42) },
  soc2: { label: "SOC 2", data: generateModuleData(101) },
  gdpr: { label: "GDPR", data: generateModuleData(202) },
  phishing: { label: "Phishing", data: generateModuleData(303) },
  dataclass: { label: "Data Classification", data: generateModuleData(404) },
  incident: { label: "Incident Response", data: generateModuleData(505) },
  final: { label: "Final Assessment", data: generateModuleData(606) },
};
