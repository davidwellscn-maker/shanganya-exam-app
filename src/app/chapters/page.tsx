"use client";

import { useState, useMemo } from "react";
import { useProgress } from "@/lib/useProgress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { WeightBadge } from "@/components/ui/weight-badge";
import { cn } from "@/lib/utils";
import chapterIndex from "@/data/chapter_index.json";
import allChapters from "@/data/all_knowledge_points.json";
import connData from "@/data/chapter_connections.json";
import { ChapterIndexItem, ChapterConnections } from "@/app/types";
import { Search, ChevronRight, Layers, Compass, TrendingUp, PieChart, ArrowRight, Sparkles, BookOpen } from "lucide-react";

const PIECES: [string, number, number, typeof Layers][] = [
  ["管理学原理", 1, 11, Layers],
  ["企业战略管理", 12, 18, Compass],
  ["市场营销", 19, 27, TrendingUp],
  ["财务管理", 28, 36, PieChart],
];

export default function ChaptersPage() {
  const idx = chapterIndex as ChapterIndexItem[];
  const conn = connData as ChapterConnections;
  const { getStats } = useProgress();
  const totalKPs = idx.reduce((s, c) => s + c.kpCount, 0);

  const [search, setSearch] = useState("");
  const [filterWeight, setFilterWeight] = useState("全部");

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return allChapters
      .flatMap((ch) =>
        ch.kps
          .filter((kp) => kp.name.toLowerCase().includes(q) || kp.definition.toLowerCase().includes(q))
          .map((kp) => ({ chNum: ch.number, chTitle: ch.title, ...kp }))
      )
      .slice(0, 20);
  }, [search]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 面包屑 + 页面标题 */}
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground transition-colors">首页</a>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">知识点导航</span>
        </nav>
        <h1 className="text-xl font-bold text-foreground mb-6 mt-4">知识点导航</h1>
      </div>

      {/* 搜索与权重筛选 */}
      <div className="rounded-lg border border-border bg-card mb-6 px-5 py-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索 518 个知识点（名称、定义）..."
              className="w-full h-9 rounded-md border border-input bg-muted/40 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {["全部", "高", "中", "低"].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setFilterWeight(w)}
                className={cn(
                  "h-7 px-3 rounded-full text-xs transition-colors",
                  filterWeight === w
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground"
                )}
              >
                {w === "全部" ? "全部权重" : `${w}权重`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索结果 */}
      {searchResults !== null && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              搜索结果 · {searchResults.length} 个匹配
            </p>
          </div>
          {searchResults.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              无匹配结果
            </div>
          ) : (
            searchResults.map((kp) => (
              <a
                key={`${kp.chNum}-${kp.id}`}
                href={`/kps/${kp.chNum}/${kp.id}`}
                className="block rounded-md border border-border bg-card p-3 group hover:border-foreground/50 transition-colors"
              >
                <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  ch{kp.chNum}
                </span>
                <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors mt-1.5">
                  {kp.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{kp.definition}</div>
              </a>
            ))
          )}
        </div>
      )}

      {/* 按篇分组 */}
      <div className="space-y-10">
        {PIECES.map(([name, start, end, Icon]) => {
          const chs = idx.filter((c) => c.number >= start && c.number <= end);
          const filtered =
            filterWeight === "全部"
              ? chs
              : chs.filter((c) => {
                  const chData = allChapters.find((cd) => cd.number === c.number);
                  if (!chData) return false;
                  return chData.kps.some((kp) => kp.weight === filterWeight);
                });
          if (filtered.length === 0 && search.trim()) return null;

          return (
            <section key={name}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                <h2 className="text-lg font-semibold text-foreground truncate">{name}</h2>
                <a
                  href={`/chapters/${start}`}
                  className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  开始学习 <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((ch) => {
                  const chNum = String(ch.number);
                  const pre = conn[chNum]?.prerequisites?.length || 0;
                  const ext = conn[chNum]?.extensions?.length || 0;
                  const cross = conn[chNum]?.crossReferences?.length || 0;
                  const totalLinks = pre + ext + cross;
                  const chData = allChapters.find((c) => c.number === ch.number);
                  const st = getStats(
                    chData ? chData.kps.map((kp) => ({ chapter: ch.number, id: kp.id })) : []
                  );
                  const mPct = st.total > 0 ? Math.round((st.mastered / st.total) * 100) : 0;
                  const done = st.total > 0 && st.mastered === st.total;
                  return (
                    <a
                      key={ch.number}
                      href={`/chapters/${ch.number}`}
                      className="block rounded-md border border-border bg-card p-4 group hover:border-foreground/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          ch{String(ch.number).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "text-xs tabular-nums font-bold",
                            done ? "text-success" : "text-muted-foreground"
                          )}
                        >
                          {st.mastered}/{ch.kpCount} 掌握
                        </span>
                      </div>

                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
                        {ch.title}
                      </div>

                      <div className="mt-3">
                        <ProgressBar pct={mPct} variant={done ? "success" : "primary"} size="sm" />
                      </div>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {ch.highWeight > 0 && <WeightBadge weight="高" compact />}
                        {ch.midWeight > 0 && <WeightBadge weight="中" compact />}
                        {totalLinks > 0 && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground inline-flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {totalLinks} 关联
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">{ch.totalQuestions} 题</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
