// 学习进度数据层：localStorage 封装（纯客户端，零后端依赖）
// v2: 三态掌握（0=未学 1=学过 2=已掌握）

import type { MasteryLevel } from "@/app/types";

const STORAGE_KEY = "exam-app-progress-v2";
const LAST_VISITED_KEY = "exam-app-last-visited";
export const PROGRESS_EVENT = "progress-updated";

export interface KPProgress {
  level: MasteryLevel;
  viewedAt?: string;
  masteredAt?: string;
}

export interface ProgressData {
  [kpKey: string]: KPProgress;
}

export interface LastVisited {
  chNum: number;
  kpId: string;
  kpName: string;
  visitedAt: string;
}

export function getKPKey(chNum: number, kpId: string): string {
  return `ch${chNum}-${kpId}`;
}

export function readProgress(): ProgressData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // migrate from v1 format
  try {
    const v1 = localStorage.getItem("exam-app-progress");
    if (v1) {
      const old: Record<string, { viewed: boolean; mastered: boolean; viewedAt?: string; masteredAt?: string }> = JSON.parse(v1);
      const migrated: ProgressData = {};
      for (const [key, val] of Object.entries(old)) {
        migrated[key] = {
          level: val.mastered ? 2 : val.viewed ? 1 : 0,
          viewedAt: val.viewedAt,
          masteredAt: val.masteredAt,
        };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {}
  return {};
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

export function markViewed(chNum: number, kpId: string): void {
  const data = readProgress();
  const key = getKPKey(chNum, kpId);
  const prev = data[key];
  if (!prev || prev.level === 0) {
    data[key] = { level: 1, viewedAt: new Date().toISOString() };
    saveProgress(data);
  } else if (!prev.viewedAt) {
    data[key] = { ...prev, viewedAt: new Date().toISOString() };
    saveProgress(data);
  }
}

export function setLevel(chNum: number, kpId: string, level: MasteryLevel): MasteryLevel {
  const data = readProgress();
  const key = getKPKey(chNum, kpId);
  const prev = data[key];
  const now = new Date().toISOString();
  data[key] = {
    level,
    viewedAt: level > 0 ? (prev?.viewedAt || now) : prev?.viewedAt,
    masteredAt: level === 2 ? now : undefined,
  };
  saveProgress(data);
  return level;
}

export function readLastVisited(): LastVisited | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_VISITED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveLastVisited(chNum: number, kpId: string, kpName: string): void {
  if (typeof window === "undefined") return;
  const item: LastVisited = { chNum, kpId, kpName, visitedAt: new Date().toISOString() };
  localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(item));
}
