/**
 * Resolves cluster-specific content for a module on the Course Dashboard.
 * Maps interventions (resources, retests, messages) to clusters via target learner IDs.
 */

import { contentStore } from "@/data/contentStore";
import {
  getLearnerDataForModule,
  defaultThresholds,
  type ClusterName,
  type ThresholdConfig,
} from "@/data/masteryData";
import type { Resource, Quiz } from "@/data/contentStore";

export interface ClusterModuleContent {
  /** Base module content (videos, non-retest quizzes, required resources) */
  baseContent: {
    videos: { id: string; title: string; moduleId: string }[];
    quizzes: { id: string; title: string; moduleId: string; isRetest: boolean }[];
    resources: Resource[];
  };
  /** Cluster-specific additions from interventions */
  clusterAdditions: {
    resources: Resource[];
    retestQuiz: Quiz | null;
    messages: { text: string; id: string }[];
    optionalResources: Resource[];
  };
}

/**
 * Get learner IDs that belong to a given cluster for a course+module.
 */
export function getLearnerIdsForCluster(
  courseId: string,
  moduleId: string,
  clusterName: ClusterName,
  thresholds: ThresholdConfig = defaultThresholds
): string[] {
  const data = getLearnerDataForModule(courseId, moduleId, thresholds);
  return data.filter((d) => d.cluster === clusterName).map((d) => d.id);
}

/**
 * Get cluster-specific content for a module.
 * Base content = normal videos, non-retest quizzes, required resources.
 * Cluster additions = resources/retests/messages assigned via interventions to learners in that cluster.
 */
export function getClusterContentForModule(
  courseId: string,
  moduleId: string,
  clusterName: ClusterName,
  thresholds: ThresholdConfig = defaultThresholds
): ClusterModuleContent {
  const clusterLearnerIds = new Set(
    getLearnerIdsForCluster(courseId, moduleId, clusterName, thresholds)
  );

  const baseVideos = contentStore
    .getVideoLecturesByModule(courseId, moduleId)
    .map((v) => ({ id: v.id, title: v.title, moduleId: v.moduleId }));
  const allQuizzes = contentStore.getQuizzesByModule(courseId, moduleId);
  const baseQuizzes = allQuizzes
    .filter((q) => !q.isRetest)
    .map((q) => ({
      id: q.id,
      title: q.title,
      moduleId: q.moduleId,
      isRetest: !!q.isRetest,
    }));
  const baseResources = contentStore
    .getResourcesByModule(courseId, moduleId)
    .filter((r) => !r.isOptional);

  const resources: Resource[] = [];
  let retestQuiz: Quiz | null = null;
  const messages: { text: string; id: string }[] = [];
  const optionalResources: Resource[] = [];

  const interventions = contentStore.getInterventions();
  for (const int of interventions) {
    if (int.courseId !== courseId) continue;
    const targets = new Set(int.targetLearnerIds);
    const hasOverlap = [...clusterLearnerIds].some((id) => targets.has(id));
    if (!hasOverlap) continue;

    if (int.type === "resource" && int.contentId) {
      const res = contentStore.getResource(int.contentId);
      if (res && res.moduleId === moduleId) {
        if (res.isOptional) optionalResources.push(res);
        else resources.push(res);
      }
    } else if (int.type === "retest" && int.contentId) {
      const quiz = contentStore.getQuiz(int.contentId);
      if (quiz && quiz.moduleId === moduleId && quiz.isRetest) {
        retestQuiz = quiz;
      }
    } else if (int.type === "message" && int.message) {
      messages.push({ text: int.message, id: int.id });
    }
  }

  // Dedupe resources and optional resources
  const seenResIds = new Set<string>();
  const dedupeRes = (arr: Resource[]) =>
    arr.filter((r) => {
      if (seenResIds.has(r.id)) return false;
      seenResIds.add(r.id);
      return true;
    });

  return {
    baseContent: {
      videos: baseVideos,
      quizzes: baseQuizzes,
      resources: baseResources,
    },
    clusterAdditions: {
      resources: dedupeRes(resources),
      retestQuiz,
      messages,
      optionalResources: dedupeRes(optionalResources),
    },
  };
}
