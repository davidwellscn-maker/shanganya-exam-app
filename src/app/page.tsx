"use client";

import { useMemo } from "react";
import allChapters from "@/data/all_knowledge_points.json";
import chapterIndex from "@/data/chapter_index.json";
import { useProgress } from "@/lib/useProgress";
import { getRecommendations } from "@/lib/recommend";
import { ProgressBar } from "@/components/ui/progress-bar";
import { readLastVisited } from "@/lib/progress";
import {
  Gauge,
  Radar,
  Map,
  Flame,
  Lightbulb,
  FileBadge,
  Layers,
  Compass,
  TrendingUp,
  PieChart,
  ChevronRight,
  ArrowRight,
  Award,
  Zap,
} from "lucide-react";

const EXAM_DATE = "2027-05-23";

const PIECES: [string, number, number, typeof Layers][] = [
  ["管理学原理", 1, 11, Layers],
  ["企业战略管理", 12, 18, Compass],
  ["市场营销", 19, 27, TrendingUp],
  ["财务管理", 28, 36, PieChart],
];

const PIECE_WEIGHTS: Record<string, number> = {
  "管理学原理": 25,
  "企业战略管理": 30,
  "市场营销": 20,
  "财务管理": 25,
};

const QUESTION_TYPES = ["单项选择题", "多项选择题", "名词解释", "简答题", "论述题", "案例分析题"];

function daysToExam(): number {
  const diff = new Date(EXAM_DATE).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function suggestedMinutes(weight: string): number {
  return weight === "高" ? 25 : weight === "中" ? 20 : 15;
}

function SectionHead({ icon: Icon, title, subtitle, action }: { icon: typeof Gauge; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
        <h2 className="text-lg font-semibold text-foreground truncate">{title}</h2>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        {action}
      </div>
    </div>
  );
}

export default function Home() {
  const { ready, getStats, getKP, progress } = useProgress();

  const allKPs = useMemo(
    () => allChapters.flatMap((ch) => ch.kps.map((kp) => ({ chapter: ch.number, id: kp.id }))),
    []
  );
  const overall = getStats(allKPs);

  const recommendations = useMemo(
    () => (ready ? getRecommendations(progress, 6) : []),
    [ready, progress]
  );

  const pieceStats = useMemo(
    () =>
      PIECES.map(([name, start, end]) => {
        const chs = allChapters.filter((ch) => ch.number >= start && ch.number <= end);
        const kps = chs.flatMap((ch) => ch.kps.map((kp) => ({ chapter: ch.number, id: kp.id })));
        const totalQuestions = chs.reduce((s, ch) => {
          const idx = chapterIndex.find((c) => c.number === ch.number);
          return s + (idx?.totalQuestions ?? 0);
        }, 0);
        const totalKPs = kps.length;

        let hottestCh = chs[0];
        let hottestFreq = -1;
        for (const ch of chs) {
          let freq = 0;
          for (const kp of ch.kps) {
            freq += kp.examFrequency ?? 0;
          }
          if (freq > hottestFreq) {
            hottestFreq = freq;
            hottestCh = ch;
          }
        }

        return { name, start, end, totalKPs, totalQuestions, hottestCh };
      }),
    []
  );

  const lastVisited = ready ? readLastVisited() : null;
  const continueTarget = lastVisited
    ? { href: `/kps/${lastVisited.chNum}/${lastVisited.kpId}`, label: `继续学习：${lastVisited.kpName}` }
    : null;

  const overallPct = overall.total > 0 ? Math.round((overall.mastered / overall.total) * 100) : 0;
  const remaining = overall.total - overall.mastered;
  const days = daysToExam();

  return (
    <div className="space-y-10 animate-fade-in">
      {/* ==================== 学习驾驶舱 ==================== */}
      <section className="rounded-md border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 min-w-0">
            <Gauge className="w-5 h-5 text-muted-foreground shrink-0" />
            <h2 className="text-lg font-semibold text-foreground truncate">学习驾驶舱</h2>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {EXAM_DATE} 考试 · 数据每日刷新
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 距离考试 */}
          <div className="rounded-sm border border-border bg-card p-5 text-center space-y-2">
            <div className="text-xs text-muted-foreground">距离考试</div>
            <div className="text-3xl font-bold text-foreground">{days}</div>
            <div className="text-xs text-muted-foreground">天</div>
          </div>

          {/* 知识点掌握 */}
          <div className="rounded-sm border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-foreground font-medium truncate">知识点掌握</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {overall.mastered} / {overall.viewed} / {overall.total - overall.viewed}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">已掌握 / 已浏览 / 未开始</div>
            <ProgressBar pct={overallPct} variant={overallPct === 100 ? "success" : "primary"} />
            <div className="text-xs text-muted-foreground">总体进度 {overallPct}%</div>
          </div>

          {/* 真题练习 */}
          <div className="rounded-sm border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-foreground font-medium truncate">真题练习</span>
              <span className="text-xs text-muted-foreground shrink-0">0 / 445 · 0%</span>
            </div>
            <div className="text-xs text-muted-foreground">已答 / 总题数 · 客观题正确率</div>
            <ProgressBar pct={0} variant="primary" />
            <div className="text-xs text-muted-foreground">已覆盖 0%</div>
          </div>
        </div>

        {/* 今日建议 */}
        <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                今日建议
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                剩余 <span className="text-foreground font-medium">{days} 天</span>，未掌握知识点{" "}
                <span className="text-foreground font-medium">{remaining} 个</span>。按照当前进度，建议今天学习{" "}
                <span className="text-foreground font-medium">3 个高频知识点</span>，优先攻克企业战略管理与财务管理章节。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 考试情报区 ==================== */}
      <section>
        <SectionHead
          icon={Radar}
          title="考试情报区"
          subtitle="2015-2025 真题反推 · 官方信息汇总"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-md border border-border bg-card p-5 space-y-6">
            {/* 题型结构 */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">题型结构</h3>
              <div className="flex flex-wrap gap-2">
                {QUESTION_TYPES.map((t) => (
                  <span key={t} className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs text-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* 分值分布 */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">分值分布</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "总分", value: "100" },
                  { label: "选择/多选", value: "~40" },
                  { label: "简答/论述", value: "~30" },
                  { label: "案例分析", value: "~30" },
                ].map((item) => (
                  <div key={item.label} className="rounded-md bg-muted/50 p-3 text-center">
                    <div className="text-lg font-bold text-foreground">{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 模块分值占比 */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">模块分值占比</h3>
              <div className="space-y-3">
                {PIECES.map(([name]) => (
                  <div key={name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground">{name}</span>
                      <span className="text-muted-foreground">{PIECE_WEIGHTS[name]}%</span>
                    </div>
                    <ProgressBar pct={PIECE_WEIGHTS[name]} variant="primary" />
                  </div>
                ))}
              </div>
            </div>

            {/* 近十年侧重点 */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">近十年侧重点（2015-2025 真题反推）</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                {[
                  "企业战略管理占比最高（约 30%），案例分析高频出处",
                  "财务管理计算题稳定，NPV、CAPM、财务比率反复出现",
                  "市场营销选择题集中，STP、4P 为必背框架",
                  "管理学原理简答题分布较均匀，古典管理理论高频",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 min-w-0">
                    <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 官方信息 */}
          <div className="rounded-sm border border-border bg-card p-5 space-y-5">
            <div className="flex items-center gap-2">
              <FileBadge className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">官方信息</h3>
            </div>
            <div className="space-y-3 text-xs">
              {[
                { label: "考试时间", value: "每年 5 月倒数第二个周日" },
                { label: "报名官网", value: "tdxl.neea.edu.cn", href: "https://tdxl.neea.edu.cn" },
                { label: "成绩查询", value: "查询入口", href: "https://tdxl.neea.edu.cn/query.html" },
                { label: "主管网站", value: "中国教育考试网", href: "https://www.neea.edu.cn" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground shrink-0">{item.label}</span>
                  {item.href ? (
                    <a
                      className="text-foreground font-medium text-right break-all hover:underline transition-colors"
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-foreground font-medium text-right">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="w-full h-9 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:opacity-85 transition-opacity"
            >
              查看 2026 年报名公告
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 章节与重点总览 ==================== */}
      <section>
        <SectionHead
          icon={Map}
          title="章节与重点总览"
          subtitle="4 篇 36 章 · 518 知识点 · 近10年 315 道真题"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pieceStats.map((p, idx) => {
            const Icon = PIECES[idx][3];
            return (
              <a
                key={p.name}
                href={`/chapters/${p.start}`}
                className="group rounded-md border border-border bg-card p-5 space-y-4 hover:border-foreground/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {p.name}
                    </div>
                    <div className="text-xs text-muted-foreground">第 {p.start}-{p.end} 章</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "章", value: p.end - p.start + 1 },
                    { label: "知识点", value: p.totalKPs },
                    { label: "近10年真题", value: p.totalQuestions },
                    { label: "分值占比", value: `${PIECE_WEIGHTS[p.name]}%` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-md bg-muted/50 p-2 text-center">
                      <div className="font-bold text-foreground">{item.value}</div>
                      <div className="text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-md bg-muted/30 p-2 text-xs">
                  <span className="text-muted-foreground">最高频：</span>
                  <span className="text-foreground font-medium">
                    ch {p.hottestCh.number} {p.hottestCh.title}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* ==================== 今日推荐 / 高频考点 ==================== */}
      <section>
        <SectionHead
          icon={Flame}
          title="今日推荐 / 高频考点"
          subtitle="基于近10年考频推荐"
          action={
            <a
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
              href="/questions"
            >
              查看全部真题
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ready && recommendations.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 rounded-md border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              全部知识点已掌握，保持复习即可
            </div>
          )}
          {recommendations.map((r, i) => {
            const level = getKP(r.chNum, r.kpId)?.level ?? 0;
            const mastered = level === 2;
            return (
              <a
                key={`${r.chNum}-${r.kpId}`}
                href={`/kps/${r.chNum}/${r.kpId}`}
                className="group rounded-md border border-border bg-card p-4 space-y-3 hover:border-foreground/50 transition-colors animate-slide-up"
                style={{ animationDelay: `${(i + 4) * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                    {r.kpName}
                  </div>
                  <span
                    className={
                      mastered
                        ? "inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground shrink-0"
                        : "inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-foreground shrink-0"
                    }
                  >
                    {mastered ? "已掌握" : "未掌握"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  ch {r.chNum} {r.chTitle}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>近10年 {r.examFrequency} 题</span>
                  <span>建议 {suggestedMinutes(r.weight)} 分钟</span>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
