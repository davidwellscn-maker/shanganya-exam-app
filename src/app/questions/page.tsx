"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { loadAllQuestions, QuestionItem } from "@/lib/questions";
import { ProgressBar } from "@/components/ui/progress-bar";
import { QuestionCard } from "@/components/ui/question-card";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  PieChart,
  BarChart2,
  Filter,
  Calendar,
  ChevronRight,
  BookOpen,
  FileText,
  RotateCcw,
  FolderOpen,
} from "lucide-react";

const typeFilterKeys = ["all", "single", "multiple", "term", "short", "essay", "case"];
const typeFilterName: Record<string, string> = {
  all: "全部",
  single: "单项选择题",
  multiple: "多项选择题",
  term: "名词解释",
  short: "简答题",
  essay: "论述题",
  case: "案例分析题",
};
const typeFilterLabel: Record<string, string> = {
  all: "全部",
  single: "单选",
  multiple: "多选",
  term: "名词",
  short: "简答",
  essay: "论述",
  case: "案例",
};
const typeChipColor: Record<string, string> = {
  all: "bg-primary text-primary-foreground",
  single: "bg-primary text-primary-foreground",
  multiple: "bg-primary text-primary-foreground",
  term: "bg-primary text-primary-foreground",
  short: "bg-primary text-primary-foreground",
  essay: "bg-primary text-primary-foreground",
  case: "bg-primary text-primary-foreground",
};

const PIECE_NAMES: Record<number, string> = {
  1: "管理学原理", 2: "管理学原理", 3: "管理学原理", 4: "管理学原理", 5: "管理学原理",
  6: "管理学原理", 7: "管理学原理", 8: "管理学原理", 9: "管理学原理", 10: "管理学原理", 11: "管理学原理",
  12: "企业战略管理", 13: "企业战略管理", 14: "企业战略管理", 15: "企业战略管理",
  16: "企业战略管理", 17: "企业战略管理", 18: "企业战略管理",
  19: "市场营销", 20: "市场营销", 21: "市场营销", 22: "市场营销", 23: "市场营销",
  24: "市场营销", 25: "市场营销", 26: "市场营销", 27: "市场营销",
  28: "财务管理", 29: "财务管理", 30: "财务管理", 31: "财务管理", 32: "财务管理",
  33: "财务管理", 34: "财务管理", 35: "财务管理", 36: "财务管理",
};

const CHAPTER_PIECES: { name: string; start: number; end: number }[] = [
  { name: "管理学原理", start: 1, end: 11 },
  { name: "企业战略管理", start: 12, end: 18 },
  { name: "市场营销", start: 19, end: 27 },
  { name: "财务管理", start: 28, end: 36 },
];

const CHAPTER_THEME: Record<number, string> = {
  1: "brand", 2: "brand", 3: "brand", 4: "brand", 5: "brand",
  6: "brand", 7: "brand", 8: "brand", 9: "brand", 10: "brand", 11: "brand",
  12: "strategy", 13: "strategy", 14: "strategy", 15: "strategy",
  16: "strategy", 17: "strategy", 18: "strategy",
  19: "marketing", 20: "marketing", 21: "marketing", 22: "marketing", 23: "marketing",
  24: "marketing", 25: "marketing", 26: "marketing", 27: "marketing",
  28: "finance", 29: "finance", 30: "finance", 31: "finance", 32: "finance",
  33: "finance", 34: "finance", 35: "finance", 36: "finance",
};

function chapterDotColor(ch: number) {
  const t = CHAPTER_THEME[ch];
  return t === "strategy" ? "bg-brand-600" : t === "marketing" ? "bg-brand-400" : t === "finance" ? "bg-text-500" : "bg-brand-500";
}

function chaptersInRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function QuestionsPage() {
  const [data, setData] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [pickedAnswers, setPickedAnswers] = useState<Record<string, string[]>>({});
  const [revealedSet, setRevealedSet] = useState<Set<string>>(new Set());
  const [chapterFilter, setChapterFilter] = useState<Set<number>>(new Set());
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setLoading(true);
    loadAllQuestions().then((all) => {
      setData(all);
      setLoading(false);
    });
  }, []);

  const sourceData = useMemo(() => data.filter((q) => q.year !== undefined), [data]);

  const allYears = useMemo(
    () => [...new Set(sourceData.map((q) => q.year).filter((y): y is number => typeof y === "number"))].sort((a, b) => b - a),
    [sourceData]
  );

  const filtered = useMemo(() => {
    return sourceData.filter((q) => {
      if (filterType !== "all" && q.type !== typeFilterName[filterType]) return false;
      if (chapterFilter.size > 0 && (!q.kp_chapter || !chapterFilter.has(q.kp_chapter))) return false;
      if (yearFilter !== "all" && String(q.year) !== yearFilter) return false;
      if (searchText.trim()) {
        const qx = searchText.toLowerCase();
        if (!q.stem.toLowerCase().includes(qx) && !(q.kp_name ?? "").toLowerCase().includes(qx)) return false;
      }
      return true;
    });
  }, [sourceData, filterType, chapterFilter, yearFilter, searchText]);

  const grouped = useMemo(() => {
    const map = new Map<string, QuestionItem[]>();
    for (const q of filtered) {
      const key = `${q.year} 年`;
      const arr = map.get(key) || [];
      arr.push(q);
      map.set(key, arr);
    }
    const entries = [...map.entries()];
    entries.sort((a, b) => b[0].localeCompare(a[0]));
    return entries;
  }, [filtered]);

  const qKey = (q: QuestionItem) => `${q.number}-${q.year ?? `ch${q.kp_chapter ?? "x"}`}`;

  const totalQuestions = filtered.length;
  const answeredCount = useMemo(() => {
    let count = 0;
    for (const key of revealedSet) {
      if (filtered.some((q) => qKey(q) === key)) count++;
    }
    return count;
  }, [revealedSet, filtered, qKey]);

  const { correctCount, choiceAnsweredCount } = useMemo(() => {
    let correct = 0;
    let choiceAnswered = 0;
    for (const key of revealedSet) {
      const q = filtered.find((q) => qKey(q) === key);
      if (!q) continue;
      const isMCQ = q.type === "单项选择题" || q.type === "多项选择题";
      if (!isMCQ) continue;
      choiceAnswered++;
      const picked = pickedAnswers[key] || [];
      const answer = (q.answer || "").trim();
      const mine = [...picked].sort().join("");
      if (mine === answer) correct++;
    }
    return { correctCount: correct, choiceAnsweredCount: choiceAnswered };
  }, [revealedSet, filtered, qKey, pickedAnswers]);

  const accuracy = choiceAnsweredCount === 0 ? 0 : Math.round((correctCount / choiceAnsweredCount) * 100);
  const progressPct = totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100);
  const choiceProgressPct = useMemo(() => {
    const totalChoice = filtered.filter((q) => q.type === "单项选择题" || q.type === "多项选择题").length;
    return totalChoice === 0 ? 0 : Math.round((choiceAnsweredCount / totalChoice) * 100);
  }, [filtered, choiceAnsweredCount]);

  const toggleOption = (questionKey: string, letter: string, isMulti: boolean) => {
    if (revealedSet.has(questionKey)) return;
    setPickedAnswers((prev) => {
      const cur = prev[questionKey] || [];
      if (isMulti) {
        return { ...prev, [questionKey]: cur.includes(letter) ? cur.filter((k) => k !== letter) : [...cur, letter] };
      }
      return { ...prev, [questionKey]: [letter] };
    });
  };

  const submitAnswer = (questionKey: string) => {
    setRevealedSet((prev) => new Set(prev).add(questionKey));
  };

  const resetAnswer = (questionKey: string) => {
    setRevealedSet((prev) => {
      const next = new Set(prev);
      next.delete(questionKey);
      return next;
    });
    setPickedAnswers((prev) => {
      const next = { ...prev };
      delete next[questionKey];
      return next;
    });
  };

  const toggleChapter = (ch: number) => {
    setChapterFilter((prev) => {
      const next = new Set(prev);
      if (next.has(ch)) next.delete(ch);
      else next.add(ch);
      return next;
    });
  };

  const togglePiece = (start: number, end: number) => {
    setChapterFilter((prev) => {
      const next = new Set(prev);
      const range = chaptersInRange(start, end);
      const allSelected = range.every((ch) => next.has(ch));
      if (allSelected) range.forEach((ch) => next.delete(ch));
      else range.forEach((ch) => next.add(ch));
      return next;
    });
  };

  const isPieceChecked = (start: number, end: number) =>
    chaptersInRange(start, end).every((ch) => chapterFilter.has(ch));

  const clearFilters = () => {
    setFilterType("all");
    setChapterFilter(new Set());
    setYearFilter("all");
    setSearchText("");
  };

  const activeFilterCount = (filterType !== "all" ? 1 : 0) + chapterFilter.size + (yearFilter !== "all" ? 1 : 0) + (searchText.trim() ? 1 : 0);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground transition-colors">首页</a>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">历年真题</span>
        </nav>
        <h1 className="text-xl font-bold text-foreground mb-6">历年真题练习</h1>
        <div className="rounded-lg border border-border bg-card mb-6">
          <div className="p-4 border-b border-border">
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="p-4">
            <Skeleton className="h-7 w-full max-w-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 面包屑 + 页面标题 */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <a href="/" className="hover:text-foreground transition-colors">首页</a>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <span className="text-foreground font-medium">历年真题</span>
      </nav>
      <h1 className="text-xl font-bold text-foreground mb-6">历年真题练习</h1>

      {/* 题库 Tab + 题型筛选 */}
      <div className="rounded-lg border border-border bg-card mb-6">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/questions"
              className="h-8 px-4 rounded-full bg-primary text-primary-foreground text-xs inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              历年真题
            </a>
            <a
              href="/chapters"
              className="h-8 px-4 rounded-full border border-border bg-card text-muted-foreground text-xs inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              章节题库
            </a>
          </div>
        </div>
        <div className="px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">题型：</span>
            {typeFilterKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilterType(key)}
                className={cn(
                  "h-7 px-3 rounded-full text-xs",
                  filterType === key
                    ? typeChipColor[key]
                    : "border border-border bg-card text-muted-foreground"
                )}
              >
                {typeFilterLabel[key]}
              </button>
            ))}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                清除筛选
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 两栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* 左栏：真题列表 */}
        <div className="space-y-6">
          {grouped.length === 0 && (
            <EmptyState
              icon="search"
              title="未找到匹配真题"
              description="尝试调整筛选条件或搜索关键词"
              variant="cool"
              action={
                <button type="button" onClick={clearFilters} className="h-7 px-3 rounded-full border border-border bg-card text-muted-foreground text-xs inline-flex items-center gap-1.5">
                  <RotateCcw className="w-3 h-3" />
                  清除筛选
                </button>
              }
            />
          )}
          {grouped.map(([label, qs], groupIndex) => (
            <div key={label} className="space-y-4 animate-slide-up" style={{ animationDelay: `${groupIndex * 80}ms` }}>
              <div className="flex items-center gap-2">
                <span className="chip chip-brand">
                  <Calendar className="w-3 h-3" />
                  {label}
                </span>
                <span className="badge-chip">{qs.length} 题</span>
              </div>
              {qs.map((q, i) => {
                const key = qKey(q);
                return (
                  <QuestionCard
                    key={`${key}-${i}`}
                    q={q}
                    index={i}
                    revealed={revealedSet.has(key)}
                    picked={pickedAnswers[key] || []}
                    onToggle={(letter) => toggleOption(key, letter, q.type === "多项选择题")}
                    onReveal={() => submitAnswer(key)}
                    onReset={() => resetAnswer(key)}
                    compact
                    headerMeta={
                      q.kp_chapter && PIECE_NAMES[q.kp_chapter] ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <span className={cn("w-1.5 h-1.5 rounded-full", chapterDotColor(q.kp_chapter))} />
                          {PIECE_NAMES[q.kp_chapter]}
                        </span>
                      ) : null
                    }
                    extra={
                      q.kp_name ? (
                        <a
                          href={`/chapters/${q.kp_chapter ?? ""}`}
                          className="inline-flex items-center text-xs text-primary hover:underline bg-primary/5 px-2 py-1 rounded-md border border-primary/10 transition-colors mx-5 mb-3 -mt-2"
                        >
                          <FolderOpen className="w-3 h-3 mr-1" />
                          {q.kp_name}
                        </a>
                      ) : null
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* 右栏：练习统计与筛选 */}
        <aside className="space-y-6">
          {/* 练习进度 */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm text-foreground">练习进度</span>
              <PieChart className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              <span>{answeredCount}</span>
              <span className="text-sm font-normal text-muted-foreground"> / {totalQuestions}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">已作答题目</div>
            <ProgressBar pct={progressPct} className="mt-3" />
          </div>

          {/* 客观题正确率 */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm text-foreground">客观题正确率</span>
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              <span>{correctCount}</span>
              <span className="text-sm font-normal text-muted-foreground"> 正确 / </span>
              <span>{choiceAnsweredCount}</span>
              <span className="text-sm font-normal text-muted-foreground"> 已答</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">正确率 {accuracy}%</div>
            <ProgressBar pct={choiceProgressPct} className="mt-3" />
          </div>

          {/* 章节筛选 */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm text-foreground">章节筛选</span>
              <Filter className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {CHAPTER_PIECES.map((p) => {
                const checked = isPieceChecked(p.start, p.end);
                return (
                  <label key={p.name} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePiece(p.start, p.end)}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
                    />
                    <span className={cn("text-sm", checked ? "text-foreground" : "text-muted-foreground")}>
                      {p.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 年份筛选 */}
          {allYears.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-sm text-foreground">年份筛选</span>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", ...allYears.map(String)].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYearFilter(y)}
                    className={cn(
                      "h-7 px-3 rounded-full text-xs",
                      yearFilter === y
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground"
                    )}
                  >
                    {y === "all" ? "全部" : y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
