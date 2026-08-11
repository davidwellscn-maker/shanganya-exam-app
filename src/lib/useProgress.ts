"use client";

// 学习进度 React hook：订阅 localStorage 进度数据，提供统计与操作方法
// v2: 三态掌握（0=未学 1=学过 2=已掌握）

import { useState, useEffect, useCallback } from "react";
import type { MasteryLevel } from "@/app/types";
import {
  ProgressData,
  PROGRESS_EVENT,
  readProgress,
  markViewed as _markViewed,
  setLevel as _setLevel,
  getKPKey,
} from "./progress";

export interface ProgressStats {
  viewed: number;    // level >= 1
  studied: number;   // level === 1
  mastered: number;  // level === 2
  total: number;
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(readProgress());
    setReady(true);
    const onUpdate = () => setProgress(readProgress());
    window.addEventListener(PROGRESS_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const markViewed = useCallback((chNum: number, kpId: string) => {
    _markViewed(chNum, kpId);
  }, []);

  const setLevel = useCallback((chNum: number, kpId: string, level: MasteryLevel) => {
    return _setLevel(chNum, kpId, level);
  }, []);

  const getKP = useCallback(
    (chNum: number, kpId: string) => progress[getKPKey(chNum, kpId)],
    [progress]
  );

  // 统计一组 KP（[chNum, kpId] 数组）的进度
  const getStats = useCallback(
    (kps: { chapter: number; id: string }[]): ProgressStats => {
      let viewed = 0;
      let studied = 0;
      let mastered = 0;
      for (const kp of kps) {
        const p = progress[getKPKey(kp.chapter, kp.id)];
        const lvl = p?.level ?? 0;
        if (lvl >= 1) viewed++;
        if (lvl === 1) studied++;
        if (lvl === 2) mastered++;
      }
      return { viewed, studied, mastered, total: kps.length };
    },
    [progress]
  );

  return { progress, ready, markViewed, setLevel, getKP, getStats };
}
