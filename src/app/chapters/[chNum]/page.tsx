import allChapters from "@/data/all_knowledge_points.json";
import ChapterContent from "./content";

// 静态导出：预生成全部章节页面
export function generateStaticParams() {
  return allChapters.map((c) => ({ chNum: String(c.number) }));
}

// 只允许已生成的章节路由，其余返回 404
export const dynamicParams = false;

export default function ChapterPage({ params }: { params: { chNum: string } }) {
  return <ChapterContent chNum={params.chNum} />;
}
