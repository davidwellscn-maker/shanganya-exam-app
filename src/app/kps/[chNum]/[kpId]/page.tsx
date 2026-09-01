import { notFound } from "next/navigation";
import allChapters from "@/data/all_knowledge_points.json";
import KPDetailContent from "./content";

// 静态导出：预生成全部章节 × 知识点页面
export function generateStaticParams() {
  return allChapters.flatMap((c) =>
    c.kps.map((kp) => ({ chNum: String(c.number), kpId: kp.id }))
  );
}

// 只允许已生成的页面路由，其余返回 404
export const dynamicParams = false;

export default async function KPDetailPage({
  params,
}: {
  params: Promise<{ chNum: string; kpId: string }>;
}) {
  const { chNum, kpId } = await params;
  const chapter = allChapters.find((c) => c.number === parseInt(chNum));
  if (!chapter) notFound();
  const kp = chapter.kps.find((k) => k.id === kpId);
  if (!kp) notFound();
  return <KPDetailContent chapter={chapter} kp={kp} />;
}
