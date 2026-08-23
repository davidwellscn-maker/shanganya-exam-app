"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { notFound } from "next/navigation";
import allChapters from "@/data/all_knowledge_points.json";
import { useProgress } from "@/lib/useProgress";
import { getQuestionsForChapter, QuestionItem } from "@/lib/questions";
import { ProgressBar } from "@/components/ui/progress-bar";
import { QuestionCard } from "@/components/ui/question-card";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Lightbulb,
  FileText,
  Clock,
  BarChart2,
  ChevronRight,
  ChevronDown,
  Layers,
  Compass,
  TrendingUp,
  PieChart,
} from "lucide-react";

const PIECES: [string, number, number, typeof Layers][] = [
  ["管理学原理", 1, 11, Layers],
  ["企业战略管理", 12, 18, Compass],
  ["市场营销", 19, 27, TrendingUp],
  ["财务管理", 28, 36, PieChart],
];

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

const weightStars: Record<string, string> = {
  高: "★★★",
  中: "★★☆",
  低: "★☆☆",
};
const masteryLabel: Record<number, string> = {
  0: "未学习",
  1: "学习中",
  2: "已掌握",
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => n.toString().padStart(2, "0")).join(":");
}

function getMasteryGridCols(count: number): number {
  if (count <= 8) return 4;
  if (count <= 15) return 5;
  return 6;
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function ChapterContent({ chNum }: { chNum: string }) {
  const chapter = allChapters.find((c) => c.number === parseInt(chNum));
  if (!chapter) notFound();

  const { getStats, getKP, setLevel } = useProgress();
  const [openPiece, setOpenPiece] = useState<string | null>(
    PIECES.find(([, start, end]) => chapter.number >= start && chapter.number <= end)?.[0] ?? null
  );
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQs, setLoadingQs] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [pickedAnswers, setPickedAnswers] = useState<Record<string, string[]>>({});
  const [revealedSet, setRevealedSet] = useState<Set<string>>(new Set());
  const [seconds, setSeconds] = useState(0);
  const [expandedKPs, setExpandedKPs] = useState<Set<string>>(new Set());

  const toggleKP = (kpId: string) => {
    setExpandedKPs((prev) => {
      const next = new Set(prev);
      if (next.has(kpId)) next.delete(kpId);
      else next.add(kpId);
      return next;
    });
  };

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setLoadingQs(true);
    getQuestionsForChapter(chapter.number).then((chQs) => {
      setQuestions(chQs);
      setLoadingQs(false);
    });
  }, [chapter.number]);

  const st = getStats(chapter.kps.map((kp) => ({ chapter: chapter.number, id: kp.id })));

  const filteredQuestions = useMemo(() => {
    if (filterType === "all") return questions;
    return questions.filter((q) => q.type === typeFilterName[filterType]);
  }, [questions, filterType]);

  const choiceQuestions = filteredQuestions.filter((q) => q.type === "单项选择题" || q.type === "多项选择题");
  const { correctCount, answeredCount } = useMemo(() => {
    let correct = 0;
    let answered = 0;
    for (const key of revealedSet) {
      const q = filteredQuestions.find((q) => `q-${q.number}-${q.year ?? "ch"}` === key);
      if (!q) continue;
      const isMCQ = q.type === "单项选择题" || q.type === "多项选择题";
      if (!isMCQ) {
        answered++;
        continue;
      }
      answered++;
      const picked = pickedAnswers[key] || [];
      const answer = (q.answer || "").trim();
      const mine = [...picked].sort().join("");
      if (mine === answer) correct++;
    }
    return { correctCount: correct, answeredCount: answered };
  }, [revealedSet, filteredQuestions, pickedAnswers]);

  const accuracy = answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100);
  const choiceProgressPct = choiceQuestions.length === 0 ? 0 : Math.round((answeredCount / choiceQuestions.length) * 100);

  const qKey = (q: QuestionItem) => `q-${q.number}-${q.year ?? "ch"}`;

  const toggleOption = useCallback((key: string, letter: string, isMulti: boolean) => {
    if (revealedSet.has(key)) return;
    setPickedAnswers((prev) => {
      const cur = prev[key] || [];
      if (isMulti) {
        return { ...prev, [key]: cur.includes(letter) ? cur.filter((k) => k !== letter) : [...cur, letter] };
      }
      return { ...prev, [key]: [letter] };
    });
  }, [revealedSet]);

  const submitAnswer = useCallback((key: string) => {
    setRevealedSet((prev) => new Set(prev).add(key));
  }, []);

  const resetAnswer = useCallback((key: string) => {
    setRevealedSet((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setPickedAnswers((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const markKP = (kpId: string, mastered: boolean) => {
    setLevel(chapter.number, kpId, mastered ? 2 : 1);
  };

  const today = new Date();
  const pieceInfo = PIECES.find(([, s, e]) => chapter.number >= s && chapter.number <= e) ?? PIECES[0];
  const pieceName = pieceInfo[0];

  const studyPlan = [
    { title: `学习 ${chapter.title} 知识点`, date: addDays(today, 0) },
    { title: `完成 ${chapter.title} 历年真题`, date: addDays(today, 1) },
    { title: `复习 ${pieceName} 重点`, date: addDays(today, 4) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 面包屑 + 页面标题 */}
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground transition-colors">首页</a>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <a href="/chapters" className="hover:text-foreground transition-colors">章节学习</a>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{chapter.title}</span>
        </nav>
        <h1 className="text-xl font-bold text-foreground mb-6 mt-4">{chapter.title}</h1>
      </div>

      {/* 三栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6 items-start">
        {/* 左栏：教材章节 */}
        <aside>
          <div className="rounded-lg border border-border bg-card overflow-hidden w-full">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm text-foreground">教材章节</span>
            </div>
            <div className="divide-y divide-border">
              {PIECES.map(([name, start, end]) => {
                const isCurrentPiece = chapter.number >= start && chapter.number <= end;
                const isOpen = openPiece === name || isCurrentPiece;
                const kpCount = allChapters
                  .filter((c) => c.number >= start && c.number <= end)
                  .reduce((s, c) => s + c.kps.length, 0);
                return (
                  <div key={name}>
                    <button
                      type="button"
                      onClick={() => setOpenPiece(isOpen ? null : name)}
                      className={cn(
                        "w-full px-4 py-3 text-left cursor-pointer flex items-center justify-between gap-2 transition-colors",
                        isCurrentPiece ? "border-l-2 border-primary bg-muted/40" : "hover:bg-secondary"
                      )}
                    >
                      <div className="min-w-0">
                        <div
                          className={cn(
                            "text-sm",
                            isCurrentPiece ? "font-medium text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {end - start + 1} 章 · {kpCount} KP
                        </div>
                      </div>
                      <ChevronDown
                        className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", isOpen ? "rotate-180" : "")}
                      />
                    </button>
                    {isOpen && (
                      <div className="pl-4 divide-y divide-border border-l-2 border-primary">
                        {allChapters
                          .filter((c) => c.number >= start && c.number <= end)
                          .map((c) => (
                            <a
                              key={c.number}
                              href={`/chapters/${c.number}`}
                              className={cn(
                                "block px-4 py-2 text-xs transition-colors",
                                c.number === chapter.number
                                  ? "text-foreground font-medium bg-muted/20"
                                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                              )}
                            >
                              ch{String(c.number).padStart(2, "0")} {c.title}
                            </a>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* 中栏：章节详情 */}
        <div className="space-y-6 min-w-0">
          {/* 章节标题 */}
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <h2 className="text-lg font-bold text-foreground">{chapter.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              ch {String(chapter.number).padStart(2, "0")} · {chapter.kps.length} 个知识点 · {questions.length} 道真题
            </p>
          </div>

          {/* 知识点 */}
          <section className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">知识点</span>
              </div>
              <span className="text-sm text-muted-foreground">共 {chapter.kps.length} 个知识点</span>
            </div>
            <div className="divide-y divide-border">
              {chapter.kps.map((kp, idx) => {
                const p = getKP(chapter.number, kp.id);
                const level = p?.level ?? 0;
                const expanded = expandedKPs.has(kp.id);
                return (
                  <div key={kp.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-medium text-foreground shrink-0">{idx + 1}</span>
                      <div className="min-w-0 space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`/kps/${chapter.number}/${kp.id}`}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {kp.name}
                          </a>
                          <span className="text-xs text-primary">{weightStars[kp.weight] ?? "★★☆"}</span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {masteryLabel[level]}
                          </span>
                          <button
                            type="button"
                            onClick={() => markKP(kp.id, level !== 2)}
                            className={cn(
                              "ml-auto h-7 px-3 rounded-md text-xs whitespace-nowrap transition-colors",
                              level === 2
                                ? "bg-muted text-muted-foreground"
                                : "bg-primary text-primary-foreground hover:opacity-90"
                            )}
                          >
                            {level === 2 ? "已掌握" : "标记已学习"}
                          </button>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{kp.definition}</div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span>近10年 {kp.examFrequency} 题</span>
                          {kp.questionTypes.length > 0 && <span>常见题型 {kp.questionTypes.slice(0, 2).join("、")}</span>}
                          <span>{kp.points.length} 个要点</span>
                          <button
                            type="button"
                            onClick={() => toggleKP(kp.id)}
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            {expanded ? "收起要点" : "展开要点"}
                            <ChevronDown
                              className={cn("w-3.5 h-3.5 transition-transform", expanded ? "rotate-180" : "")}
                            />
                          </button>
                        </div>
                        {expanded && kp.points.length > 0 && (
                          <ul className="space-y-2 text-sm leading-relaxed pt-2 mt-2 border-t border-border">
                            {kp.points.map((point, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="font-mono text-xs text-primary shrink-0 w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                                  {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="text-muted-foreground">{point.replace(/^\d+\.\s*/, "")}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 历年真题练习区 */}
          <section className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">本章历年真题练习</span>
              <span className="text-sm text-muted-foreground">共 {questions.length} 道</span>
            </div>

            {/* 题型筛选 */}
            <div className="px-5 py-3 border-b border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">题型：</span>
                {typeFilterKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilterType(key)}
                    className={cn(
                      "h-7 px-3 rounded-full text-xs transition-colors",
                      filterType === key
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                    )}
                  >
                    {typeFilterLabel[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* 真题列表 */}
            <div className="p-5 space-y-6">
              {loadingQs && <p className="text-sm text-muted-foreground text-center py-4">加载真题中...</p>}
              {!loadingQs && filteredQuestions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">本章暂无历年真题</p>
              )}
              {filteredQuestions.map((q, i) => {
                const key = qKey(q);
                return (
                  <QuestionCard
                    key={key}
                    q={q}
                    index={i}
                    revealed={revealedSet.has(key)}
                    picked={pickedAnswers[key] || []}
                    onToggle={(letter) => toggleOption(key, letter, q.type === "多项选择题")}
                    onReveal={() => submitAnswer(key)}
                    onReset={() => resetAnswer(key)}
                    headerMeta={
                      <span className="text-xs text-muted-foreground font-medium">{chapter.title}</span>
                    }
                    extra={
                      q.kp_name ? (
                        <a
                          href={`/kps/${q.kp_chapter ?? chapter.number}/${q.kp_id ?? ""}`}
                          className="inline-flex items-center text-xs text-primary hover:underline bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10 transition-colors mx-5 mb-3 -mt-2"
                        >
                          {q.kp_name}
                        </a>
                      ) : null
                    }
                  />
                );
              })}
              {!loadingQs && filteredQuestions.length > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  已展示 {filteredQuestions.length} 道历年真题
                </p>
              )}
            </div>
          </section>
        </div>

        {/* 右栏：学习进度管理 */}
        <aside className="space-y-6">
          {/* 学习计时 */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-foreground">学习计时</span>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-mono font-bold text-foreground tracking-wider">
              {formatTime(seconds)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">进入页面后开始计时</div>
          </div>

          {/* 知识点掌握 */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm text-foreground">知识点掌握</span>
              <span className="text-xs text-muted-foreground">已掌握 {st.mastered}/{st.total}</span>
            </div>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${getMasteryGridCols(chapter.kps.length)}, minmax(0, 1fr))` }}
            >
              {chapter.kps.map((kp, idx) => {
                const p = getKP(chapter.number, kp.id);
                const level = p?.level ?? 0;
                return (
                  <a
                    key={kp.id}
                    href={`/kps/${chapter.number}/${kp.id}`}
                    title={`${idx + 1}. ${kp.name}`}
                    className={cn(
                      "aspect-square rounded-sm transition-opacity hover:opacity-80",
                      level === 2
                        ? "bg-primary"
                        : level === 1
                          ? "bg-muted-foreground/40"
                          : "bg-muted border border-border"
                    )}
                  />
                );
              })}
            </div>
          </div>

          {/* 本章真题统计 */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-foreground">本章真题统计</span>
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              <span>{correctCount}</span>
              <span className="text-sm font-normal text-muted-foreground">正确 / </span>
              <span>{answeredCount}</span>
              <span className="text-sm font-normal text-muted-foreground">已答</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">正确率 {accuracy}%</div>
            <ProgressBar pct={choiceProgressPct} className="mt-3" striped />
          </div>

          {/* 学习计划 */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-foreground">学习计划</span>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">编辑</a>
            </div>
            <div className="divide-y divide-border">
              {studyPlan.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2">
                  <div className="w-4 h-4 rounded-sm border border-border mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
