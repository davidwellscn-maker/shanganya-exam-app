// 推荐算法：高权重优先 + 未掌握优先 + 前置章节已学优先
// v2: 三态掌握

import allChapters from "@/data/all_knowledge_points.json";
import connData from "@/data/chapter_connections.json";
import { ProgressData, getKPKey } from "./progress";
import { ChapterConnections } from "@/app/types";

export interface RecommendItem {
  chNum: number;
  chTitle: string;
  kpId: string;
  kpName: string;
  weight: string;
  weightScore: number;
  examFrequency: number;
  score: number;
}

// 拉平所有 KP，附带章节信息
export function getAllKPsFlat() {
  return allChapters.flatMap((ch) =>
    ch.kps.map((kp) => ({
      chNum: ch.number,
      chTitle: ch.title,
      ...kp,
    }))
  );
}

// 计算某章的前置章节掌握比例（0-1），无前置时返回 1
function prerequisiteReadiness(chNum: number, progress: ProgressData): number {
  const conn = (connData as ChapterConnections)[String(chNum)];
  const pres = conn?.prerequisites || [];
  if (pres.length === 0) return 1;
  let done = 0;
  for (const p of pres) {
    const ch = allChapters.find((c) => c.number === p.chapter);
    if (!ch || ch.kps.length === 0) { done++; continue; }
    const viewed = ch.kps.filter((kp) => (progress[getKPKey(ch.number, kp.id)]?.level ?? 0) >= 1).length;
    if (viewed / ch.kps.length >= 0.5) done++;
  }
  return done / pres.length;
}

// 今日推荐：未掌握的 KP 按「权重分 × 频次 × 前置就绪度」排序
export function getRecommendations(progress: ProgressData, topN = 3): RecommendItem[] {
  const readinessCache = new Map<number, number>();
  const candidates: RecommendItem[] = [];

  for (const ch of allChapters) {
    for (const kp of ch.kps) {
      const p = progress[getKPKey(ch.number, kp.id)];
      if (p?.level === 2) continue;
      if (!readinessCache.has(ch.number)) {
        readinessCache.set(ch.number, prerequisiteReadiness(ch.number, progress));
      }
      const readiness = readinessCache.get(ch.number)!;
      // 权重分为主导，频次微调，前置就绪度加成
      const score = kp.weightScore * 10 + kp.examFrequency + readiness * 5;
      candidates.push({
        chNum: ch.number,
        chTitle: ch.title,
        kpId: kp.id,
        kpName: kp.name,
        weight: kp.weight,
        weightScore: kp.weightScore,
        examFrequency: kp.examFrequency,
        score,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, topN);
}
