"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BookOpen, FileText, Brain, ChevronDown, ChevronRight,
  PanelLeft, PanelRight, BarChart3, Clock, Award, Target,
  Zap, ArrowRight, Sparkles, ListChecks, Flame, ExternalLink,
} from "lucide-react";
import allChapters from "@/data/all_knowledge_points.json";
import connData from "@/data/chapter_connections.json";
import { ChapterConnections, MasteryLevel } from "@/app/types";
import { useProgress } from "@/lib/useProgress";
import { saveLastVisited } from "@/lib/progress";
import { getQuestionsForKP, QuestionItem } from "@/lib/questions";
import { getRecommendations, getAllKPsFlat } from "@/lib/recommend";
import { cn } from "@/lib/utils";
import { MasteryToggle } from "@/components/ui/mastery-toggle";
import { WeightBadge } from "@/components/ui/weight-badge";
import { StatusDot } from "@/components/ui/status-dot";
import { ProgressBar } from "@/components/ui/progress-bar";
import { QuestionCard } from "@/components/ui/question-card";

type Tab = "detail" | "questions" | "quiz";

const PANEL_KEY = "exam-app-panels";

const PIECES: [string, number, number][] = [
  ["管理学原理", 1, 11],
  ["企业战略管理", 12, 18],
  ["市场营销", 19, 27],
  ["财务管理", 28, 36],
];

function getPieceName(chNum: number) {
  return PIECES.find(([, s, e]) => chNum >= s && chNum <= e)?.[0] ?? "综合";
}

const weightStars: Record<string, string> = {
  高: "★★★", 中: "★★☆", 低: "★☆☆",
};
const masteryLabel: Record<number, string> = {
  0: "未学习", 1: "学习中", 2: "已掌握",
};

const typeFilterKeys = ["all", "single", "multiple", "term", "short", "essay", "case"] as const;
const typeFilterName: Record<string, string> = {
  all: "全部", single: "单项选择题", multiple: "多项选择题", term: "名词解释", short: "简答题", essay: "论述题", case: "案例分析题",
};
const typeFilterLabel: Record<string, string> = {
  all: "全部", single: "单选", multiple: "多选", term: "名词", short: "简答", essay: "论述", case: "案例",
};

export default function KPDetailContent({
  chapter,
  kp,
}: {
  chapter: (typeof allChapters)[number];
  kp: (typeof allChapters)[number]["kps"][number];
}) {

  const { ready, getKP, markViewed, setLevel, progress } = useProgress();
  const [tab, setTab] = useState<Tab>("detail");
  const [questions, setQuestions] = useState<QuestionItem[] | null>(null);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizResult, setQuizResult] = useState<"" | "yes" | "no">("");
  const [qFilter, setQFilter] = useState<string>("all");
  const [pickedAnswers, setPickedAnswers] = useState<Record<string, string[]>>({});
  const [revealedQs, setRevealedQs] = useState<Set<number>>(new Set());
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PANEL_KEY) || "{}");
      if (typeof saved.left === "boolean") setLeftOpen(saved.left);
      if (typeof saved.right === "boolean") setRightOpen(saved.right);
    } catch {}
  }, []);
  const savePanels = (left: boolean, right: boolean) => {
    try { localStorage.setItem(PANEL_KEY, JSON.stringify({ left, right })); } catch {}
  };
  const toggleLeft = () => setLeftOpen((v) => { savePanels(!v, rightOpen); return !v; });
  const toggleRight = () => setRightOpen((v) => { savePanels(leftOpen, !v); return !v; });

  useEffect(() => {
    if (ready) { markViewed(chapter.number, kp.id); saveLastVisited(chapter.number, kp.id, kp.name); }
  }, [ready, chapter.number, kp.id, kp.name, markViewed]);

  useEffect(() => {
    let alive = true;
    getQuestionsForKP(chapter.number, kp.id).then((qs) => { if (alive) setQuestions(qs); });
    return () => { alive = false; };
  }, [chapter.number, kp.id]);

  const state = getKP(chapter.number, kp.id);
  const level: MasteryLevel = state?.level ?? 0;
  const conn = (connData as ChapterConnections)[String(chapter.number)];

  const nextKP = useMemo(() => {
    const idx = chapter.kps.findIndex((k) => k.id === kp.id);
    if (idx >= 0 && idx < chapter.kps.length - 1) {
      const n = chapter.kps[idx + 1];
      return { chNum: chapter.number, kpId: n.id, name: n.name, weight: n.weight, note: "本章下一个知识点" };
    }
    const ext = conn?.extensions?.[0];
    if (ext) {
      const extCh = allChapters.find((c) => c.number === ext.chapter);
      if (extCh && extCh.kps.length > 0) {
        const n = extCh.kps[0];
        return { chNum: extCh.number, kpId: n.id, name: n.name, weight: n.weight, note: `延伸章节：第${extCh.number}章 ${extCh.title}` };
      }
    }
    return null;
  }, [chapter, kp.id, conn]);

  const hotKPs = useMemo(() => getAllKPsFlat().sort((a, b) => b.examFrequency - a.examFrequency).slice(0, 5), []);
  const reviewList = useMemo(() => getAllKPsFlat().filter((k) => progress[`ch${k.chNum}-${k.id}`]?.level === 1).slice(0, 6), [progress]);
  const recommendations = useMemo(() => getRecommendations(progress, 5), [progress]);

  const suggestion = level === 2 ? "已掌握，建议考前定期回顾巩固" : level === 1 ? "已浏览但尚未掌握，建议结合真题自测" : kp.weight === "高" ? `高频考点（近10年 ${kp.examFrequency} 题），建议结合真题重点学习` : kp.weight === "中" ? "中权重考点，建议熟悉定义与要点后自测检验" : "低权重考点，通读了解即可";

  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    return qFilter === "all" ? questions : questions.filter((q) => q.type === typeFilterName[qFilter]);
  }, [questions, qFilter]);

  const answeredCount = useMemo(() => {
    if (!questions) return 0;
    return questions.reduce((acc, _, i) => (revealedQs.has(i) ? acc + 1 : acc), 0);
  }, [questions, revealedQs]);

  const toggleOption = useCallback((qIdx: number, key: string, isMulti: boolean) => {
    if (revealedQs.has(qIdx)) return;
    setPickedAnswers((prev) => {
      const cur = prev[String(qIdx)] || [];
      if (isMulti) return { ...prev, [String(qIdx)]: cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key] };
      return { ...prev, [String(qIdx)]: [key] };
    });
  }, [revealedQs]);

  const revealQuestion = useCallback((qIdx: number) => setRevealedQs((prev) => new Set(prev).add(qIdx)), []);
  const resetQuestion = useCallback((qIdx: number) => {
    setRevealedQs((prev) => { const n = new Set(prev); n.delete(qIdx); return n; });
    setPickedAnswers((prev) => { const n = { ...prev }; delete n[String(qIdx)]; return n; });
  }, []);

  const masteredCount = chapter.kps.filter((k) => (getKP(chapter.number, k.id)?.level ?? 0) === 2).length;
  const chapterProgressPct = Math.round((masteredCount / chapter.kps.length) * 100);

  const sideCards = (
    <>
      <StatusCard level={level} suggestion={suggestion} onSetLevel={(lvl) => setLevel(chapter.number, kp.id, lvl)} />
      {nextKP && <NextCard nextKP={nextKP} />}
      {conn && conn.prerequisites.length > 0 && <PrereqCard prerequisites={conn.prerequisites} />}
      <MetaCard kp={kp} />
      {recommendations.length > 0 && <RecommendCard items={recommendations} />}
      <HotKPsCard hotKPs={hotKPs} onJump={(ch, kpid) => { window.location.href = `/kps/${ch}/${kpid}`; }} />
      {reviewList.length > 0 && <ReviewCard items={reviewList.slice(0, 6)} onJump={(ch, kpid) => { window.location.href = `/kps/${ch}/${kpid}`; }} />}
    </>
  );

  return (
    <div className="animate-fade-in space-y-5">
      {/* 面包屑 + 标题 + 元信息 */}
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground transition-colors">首页</a>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <a href={`/chapters/${chapter.number}`} className="hover:text-foreground transition-colors">章节学习</a>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{kp.name}</span>
        </nav>
        <h1 className="text-xl font-bold text-foreground mt-4">{kp.name}</h1>
        <p className="text-sm text-muted-foreground mb-6 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{getPieceName(chapter.number)}</span>
          <span className="opacity-60">·</span>
          <span className="font-mono">{kp.id}</span>
          <span className="opacity-60">·</span>
          <span className="text-primary">{weightStars[kp.weight] || "★★☆"}</span>
          <span>{kp.weight}权重</span>
          <span className="opacity-60">·</span>
          <span>近10年 {kp.examFrequency} 题</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{masteryLabel[level]}</span>
        </p>
      </div>

      <div className="flex gap-5 items-start">
        {/* 左栏：章节内知识点导航 */}
        <aside className={`hidden lg:block shrink-0 sticky top-20 transition-all duration-300 ${leftOpen ? "w-60" : "w-12"}`}>
          {leftOpen ? (
            <div className="rounded-lg border border-border bg-card overflow-hidden flex flex-col max-h-[calc(100vh-6.5rem)]">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <a href={`/chapters/${chapter.number}`} className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors" title={`第${chapter.number}章 ${chapter.title}`}>
                  第{chapter.number}章 {chapter.title}
                </a>
                <button onClick={toggleLeft} title="折叠导航栏" className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <PanelLeft className="w-3.5 h-3.5" />
                </button>
              </div>
              <nav className="overflow-y-auto py-2 custom-scrollbar">
                {chapter.kps.map((k) => {
                  const kpLevel: MasteryLevel = getKP(chapter.number, k.id)?.level ?? 0;
                  const current = k.id === kp.id;
                  return (
                    <a key={k.id} href={`/kps/${chapter.number}/${k.id}`}
                      className={cn("flex items-center gap-2 px-3 py-2.5 text-xs transition-colors border-l-2",
                        current ? "border-primary bg-muted/40 text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30")}>
                      <StatusDot level={kpLevel} />
                      <span className="font-mono text-[10px] text-muted-foreground shrink-0">{k.id}</span>
                      <span className="truncate">{k.name}</span>
                      {current && <Sparkles className="w-3 h-3 text-primary ml-auto shrink-0" />}
                    </a>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-border bg-muted/30">
                <div className="text-[10px] text-muted-foreground mb-1.5 flex items-center justify-between">
                  <span>本章进度</span>
                  <span className="font-mono">{masteredCount}/{chapter.kps.length}</span>
                </div>
                <ProgressBar pct={chapterProgressPct} size="sm" variant="primary" />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card py-3 flex flex-col items-center gap-3">
              <button onClick={toggleLeft} title="展开知识点导航" className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <PanelRight className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-muted-foreground [writing-mode:vertical-rl] tracking-widest py-1">第{chapter.number}章导航</span>
            </div>
          )}
        </aside>

        {/* 中栏：内容区 */}
        <div className="flex-1 min-w-0 space-y-4">
          <a href={`/chapters/${chapter.number}`} className="lg:hidden text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> 第{chapter.number}章：{chapter.title}
          </a>

          {/* 下划线式 Tab */}
          <div className="flex items-end justify-between gap-3 border-b border-border mb-4">
            <div className="flex gap-1">
              {([["detail", "知识点详解", BookOpen], ["questions", "历年真题", FileText], ["quiz", "自测模式", Brain]] as [Tab, string, typeof BookOpen][]).map(([t, label, Icon]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn("-mb-px px-4 py-2.5 text-sm transition-colors inline-flex items-center gap-1.5",
                    tab === t ? "font-medium text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {t === "questions" && questions && questions.length > 0 && <span className="rounded-full bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 ml-1">{questions.length}</span>}
                </button>
              ))}
            </div>
            {tab === "questions" && questions && questions.length > 0 && (
              <div className="text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-1.5 inline-flex items-center gap-2 shrink-0">
                <ListChecks className="w-3.5 h-3.5" />
                已作答 <span className="font-mono font-bold text-foreground">{answeredCount}</span> / {questions.length}
              </div>
            )}
          </div>

          {tab === "detail" && (
            <div className="space-y-4 animate-slide-up">
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="text-sm font-medium text-foreground mb-3">核心定义</div>
                {kp.definition ? (
                  <div className="text-sm leading-relaxed text-foreground">{kp.definition}</div>
                ) : (
                  <div className="text-sm text-muted-foreground">暂无定义内容</div>
                )}
              </div>

              {kp.points.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="text-sm font-medium text-foreground mb-3">核心要点</div>
                  <ul className="space-y-2">
                    {kp.points.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="font-mono text-muted-foreground shrink-0">{i + 1}.</span>
                        <span className="flex-1">{p.replace(/^\d+\.\s*/, "")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={<Award className="w-4 h-4" />} label="Bloom 层级" value={kp.bloom.replace(/（.*）/g, "")} />
                <StatCard icon={<BarChart3 className="w-4 h-4" />} label="考纲层级" value={`${kp.examLevel}（${kp.examLevelScore} 分）`} />
                <StatCard icon={<Target className="w-4 h-4" />} label="综合权重" value={`${kp.weight}（${kp.weightScore} 分）`} />
                <StatCard icon={<ListChecks className="w-4 h-4" />} label="常见题型" value={kp.questionTypes.length > 0 ? kp.questionTypes.slice(0, 2).join("、") : "—"} />
              </div>

              {kp.years.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="text-sm font-medium text-foreground mb-3">历年出现</div>
                  <div className="flex flex-wrap gap-2">
                    {kp.years.map((y) => (
                      <span key={y} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{y} 年</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "questions" && (
            <div className="space-y-4 animate-slide-up">
              {questions === null && <p className="text-sm text-muted-foreground text-center py-8">加载真题中...</p>}
              {questions !== null && questions.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">近 10 年真题中未直接考查本知识点，以了解为主</p>}

              {questions && questions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">题型：</span>
                  {typeFilterKeys.map((k) => {
                    const count = k === "all" ? questions.length : questions.filter((q) => q.type === typeFilterName[k]).length;
                    return (
                      <button key={k} onClick={() => setQFilter(k)}
                        className={cn("h-7 px-3 rounded-full text-xs transition-colors",
                          qFilter === k ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40")}>
                        {typeFilterLabel[k]} <span className="font-mono opacity-80">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredQuestions.map((q, i) => {
                const qIdx = questions!.indexOf(q);
                return (
                  <QuestionCard
                    key={qIdx}
                    q={q}
                    index={i}
                    revealed={revealedQs.has(qIdx)}
                    picked={pickedAnswers[String(qIdx)] || []}
                    onToggle={(letter) => toggleOption(qIdx, letter, q.type === "多项选择题")}
                    onReveal={() => revealQuestion(qIdx)}
                    onReset={() => resetQuestion(qIdx)}
                  />
                );
              })}

              {questions && questions.length > 0 && filteredQuestions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">当前筛选下暂无题目</p>
              )}

              {questions && questions.length > 0 && (
                <p className="text-center font-mono text-[10px] text-muted-foreground py-2">
                  共 {questions.length} 题 · 覆盖 {[...new Set(questions.map((q) => q.year).filter(Boolean))].join("、")} 年
                </p>
              )}
            </div>
          )}

          {tab === "quiz" && (
            <div className="rounded-lg border border-border bg-card p-8 text-center space-y-5 animate-slide-up">
              <Brain className="w-7 h-7 text-muted-foreground mx-auto" />
              <div className="text-xs text-muted-foreground uppercase tracking-wide">回忆测试</div>
              <div className="text-lg font-medium max-w-md mx-auto text-foreground">请回忆：「{kp.name}」的定义和核心要点是什么？</div>

              {quizRevealed && (
                <div className="rounded-md bg-muted/40 p-4 text-sm text-left leading-relaxed max-w-lg mx-auto text-muted-foreground">
                  {kp.definition && <p className="text-foreground font-medium">{kp.definition}</p>}
                  {kp.points.length > 0 && (
                    <ol className="space-y-2 pt-3 mt-3 border-t border-border">
                      {kp.points.map((p, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-muted-foreground shrink-0 font-mono">{String(i + 1).padStart(2, "0")}.</span>
                          <span className="text-muted-foreground">{p.replace(/^\d+\.\s*/, "")}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {!quizRevealed ? (
                <button onClick={() => setQuizRevealed(true)} className="h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm">
                  显示答案
                </button>
              ) : quizResult === "" ? (
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setQuizResult("yes"); if (level !== 2) setLevel(chapter.number, kp.id, 2); }} className="h-9 px-5 rounded-md bg-success text-success-foreground text-sm">
                    记住了
                  </button>
                  <button onClick={() => setQuizResult("no")} className="h-9 px-5 rounded-md border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors">
                    没记住
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{quizResult === "yes" ? "已标记为掌握，继续保持！" : "没关系，建议明天再来复习一次"}</p>
              )}
            </div>
          )}

          <div className="lg:hidden space-y-3">{sideCards}</div>
        </div>

        {/* 右栏：学习状态 */}
        <aside className={`hidden lg:block shrink-0 sticky top-20 transition-all duration-300 ${rightOpen ? "w-64" : "w-12"}`}>
          {rightOpen ? (
            <div className="space-y-3 max-h-[calc(100vh-6.5rem)] overflow-y-auto pb-1 custom-scrollbar">
              <div className="flex justify-end">
                <button onClick={toggleRight} title="折叠状态栏" className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors bg-card border border-border">
                  <PanelRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {sideCards}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card py-3 flex flex-col items-center gap-3">
              <button onClick={toggleRight} title="展开学习状态栏" className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <PanelLeft className="w-4 h-4" />
              </button>
              <StatusDot level={level} />
              <span className="text-[10px] text-muted-foreground [writing-mode:vertical-rl] tracking-widest py-1">学习状态</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
        {icon} <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function StatusCard({ level, suggestion, onSetLevel }: { level: MasteryLevel; suggestion: string; onSetLevel: (lvl: MasteryLevel) => void }) {
  const labels: Record<number, string> = { 0: "未学习", 1: "已浏览 · 未掌握", 2: "已掌握" };
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-sm font-medium text-foreground mb-3">学习状态</div>
      <div className="flex items-center gap-2 mb-2">
        <StatusDot level={level} />
        <span className="text-sm font-medium text-foreground">{labels[level] || labels[0]}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{suggestion}</p>
      <div className="mt-4">
        <MasteryToggle level={level} onChange={onSetLevel} size="md" />
      </div>
    </div>
  );
}

function NextCard({ nextKP }: { nextKP: { chNum: number; kpId: string; name: string; weight: string; note: string } }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-sm font-medium text-foreground mb-3">下一步推荐</div>
      <div className="text-sm font-medium text-foreground leading-snug">{nextKP.kpId} {nextKP.name}</div>
      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">{nextKP.note} <WeightBadge weight={nextKP.weight} compact /></div>
      <a href={`/kps/${nextKP.chNum}/${nextKP.kpId}`} className="mt-3 w-full text-center text-sm text-primary font-medium border border-border rounded-md py-2 hover:bg-muted/30 transition-colors inline-flex items-center justify-center gap-1">
        继续学习 <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

function PrereqCard({ prerequisites }: { prerequisites: { chapter: number; reason?: string }[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-sm font-medium text-foreground mb-3">前置知识</div>
      <p className="text-xs leading-relaxed text-muted-foreground mb-2">学习本章前建议先掌握：</p>
      <div className="space-y-1">
        {prerequisites.map((p) => {
          const c = allChapters.find((c) => c.number === p.chapter);
          return (
            <a key={p.chapter} href={`/chapters/${p.chapter}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/30 transition-colors group">
              <span className="font-mono text-[10px] text-muted-foreground shrink-0">ch{String(p.chapter).padStart(2, "0")}</span>
              <div className="min-w-0">
                <div className="text-xs font-medium text-foreground truncate">第{p.chapter}章 {c?.title || ""}</div>
                {p.reason && <div className="text-[10px] text-muted-foreground truncate">{p.reason}</div>}
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

function MetaCard({ kp }: { kp: (typeof allChapters)[number]["kps"][number] }) {
  const rows: [React.ReactNode, string, string][] = [
    [<Award className="w-3.5 h-3.5" />, "Bloom 层级", kp.bloom.replace(/（.*）/g, "")],
    [<BarChart3 className="w-3.5 h-3.5" />, "考纲层级", `${kp.examLevel}（${kp.examLevelScore} 分）`],
    [<Target className="w-3.5 h-3.5" />, "综合权重", `${kp.weight}（${kp.weightScore} 分）`],
    [<Clock className="w-3.5 h-3.5" />, "覆盖年份", kp.yearsCount > 0 ? kp.years.join("、") : "暂无数据"],
    [<ListChecks className="w-3.5 h-3.5" />, "常见题型", kp.questionTypes.length > 0 ? kp.questionTypes.join("、") : "—"],
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-sm font-medium text-foreground mb-2">考点档案</div>
      <dl>
        {rows.map(([icon, label, value]) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <dt className="text-xs text-muted-foreground flex items-center gap-1.5">{icon} {label}</dt>
            <dd className="text-xs font-medium text-foreground text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function RecommendCard({ items }: { items: ReturnType<typeof getRecommendations> }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-sm font-medium text-foreground mb-3 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-muted-foreground" /> 为你推荐</div>
      <ul className="space-y-1">
        {items.map((kp) => (
          <li key={`${kp.chNum}-${kp.kpId}`}>
            <a href={`/kps/${kp.chNum}/${kp.kpId}`} className="flex items-start gap-2 rounded-md px-1.5 py-1.5 hover:bg-muted/30 transition-colors group">
              <span className="font-mono text-[10px] text-muted-foreground shrink-0 mt-0.5">ch{kp.chNum}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] leading-snug text-foreground font-medium truncate">{kp.kpName}</div>
                <div className="text-[10px] text-muted-foreground">{kp.chTitle} · {kp.weight}权重</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HotKPsCard({ hotKPs, onJump }: { hotKPs: ReturnType<typeof getAllKPsFlat>; onJump: (ch: number, kp: string) => void }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-sm font-medium text-foreground mb-3 flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-muted-foreground" /> 高频考点 Top 5</div>
      <ol className="space-y-1">
        {hotKPs.map((kp, i) => (
          <li key={`${kp.chNum}-${kp.id}`}>
            <button type="button" onClick={() => onJump(kp.chNum, kp.id)} className="flex w-full items-start gap-1.5 rounded-md px-1.5 py-1.5 text-left hover:bg-muted/30 transition-colors">
              <span className="font-mono text-[10px] text-muted-foreground mt-px">{i + 1}</span>
              <span className="flex-1 text-[11.5px] leading-snug text-foreground text-left">{kp.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground shrink-0 mt-px">{kp.examFrequency}题</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ReviewCard({ items, onJump }: { items: ReturnType<typeof getAllKPsFlat>; onJump: (ch: number, kp: string) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-sm font-medium text-foreground mb-3 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-muted-foreground" /> 待复习 ({items.length})</div>
      <ul className="space-y-1">
        {items.map((kp) => (
          <li key={`${kp.chNum}-${kp.id}`}>
            <button type="button" onClick={() => onJump(kp.chNum, kp.id)} className="flex w-full items-start gap-1.5 rounded-md px-1.5 py-1.5 text-left hover:bg-muted/30 transition-colors">
              <StatusDot level={1} />
              <span className="flex-1 text-[11.5px] leading-snug text-foreground text-left">{kp.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
