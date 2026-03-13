import { useSyncExternalStore, useCallback } from "react";
import { contentStore } from "@/data/contentStore";

export function useContentStore() {
  const subscribe = useCallback((cb: () => void) => contentStore.subscribe(cb), []);
  const getSnapshot = useCallback(() => ({
    quizzes: contentStore.getQuizzes(),
    videoLectures: contentStore.getVideoLectures(),
  }), []);

  useSyncExternalStore(subscribe, getSnapshot);

  return contentStore;
}
