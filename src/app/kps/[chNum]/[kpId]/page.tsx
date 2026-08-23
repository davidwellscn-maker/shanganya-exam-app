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

export default function KPDetailPage({
  params,
}: {
  params: { chNum: string; kpId: string };
}) {
  return <KPDetailContent chNum={params.chNum} kpId={params.kpId} />;
}
