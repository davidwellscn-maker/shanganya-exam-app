"use client";

import { cn } from "@/lib/utils";
import { QuestionItem } from "@/lib/questions";

interface QuestionCardProps {
  q: QuestionItem;
  index?: number;
  revealed: boolean;
  picked: string[];
  onToggle: (letter: string) => void;
  onReveal: () => void;
  onReset: () => void;
  /** 标题栏右侧/下方补充内容，如知识点链接、章节标签 */
  headerMeta?: React.ReactNode;
  className?: string;
  /** 是否紧凑模式（用于列表中减少内边距） */
  compact?: boolean;
  /** 是否显示顶部题型装饰条（线框图风格已移除装饰条，保留参数以兼容调用方） */
  showTypeAccent?: boolean;
  /** 自定义题干下方额外信息 */
  extra?: React.ReactNode;
}

/** 题型短标签映射（与线框图一致） */
const shortTypeMap: Record<string, string> = {
  单项选择题: "单选",
  多项选择题: "多选",
  名词解释: "名词",
  简答题: "简答",
  论述题: "论述",
  案例分析题: "案例",
};

export function QuestionCard({
  q,
  index,
  revealed,
  picked,
  onToggle,
  onReveal,
  onReset,
  headerMeta,
  className,
  compact = false,
  showTypeAccent = true,
  extra,
}: QuestionCardProps) {
  const isMCQ = q.type === "单项选择题" || q.type === "多项选择题";
  const isMulti = q.type === "多项选择题";
  const correctKeys = isMCQ ? (q.answer?.trim().split("") || []) : [];

  const shortType = shortTypeMap[q.type] || q.type;
  const chapterTitle = q.section || q.kp_name || "综合";

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card",
        compact ? "p-4" : "p-5",
        className
      )}
    >
      {/* Header（无线框线、无底色、无状态徽标） */}
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {shortType}
        </span>
        {q.year && (
          <span className="text-xs text-muted-foreground">
            {q.year} · {chapterTitle}
          </span>
        )}
        {headerMeta}
      </div>

      {/* Stem */}
      <div className="text-sm text-foreground font-medium">
        {typeof index === "number" ? `${index + 1}. ` : ""}
        {q.stem}
      </div>

      {extra}

      {/* Options（无边框纯标签行） */}
      {isMCQ && Object.keys(q.options).length > 0 && (
        <div className="space-y-2 mt-3">
          {Object.entries(q.options).map(([letter, text]) => {
            const isPicked = picked.includes(letter);
            const isCorrect = revealed && correctKeys.includes(letter);
            const isWrong = revealed && isPicked && !correctKeys.includes(letter);
            const inputId = `q-${q.number}-${q.year ?? "ch"}-${letter}`;

            return (
              <label
                key={letter}
                htmlFor={inputId}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  id={inputId}
                  type={isMulti ? "checkbox" : "radio"}
                  name={`q-${q.number}-${q.year ?? "ch"}`}
                  value={letter}
                  checked={isPicked}
                  disabled={revealed}
                  onChange={() => onToggle(letter)}
                  className={cn(
                    "w-4 h-4 text-primary focus:ring-ring focus:ring-2",
                    isMulti ? "rounded" : "rounded-full"
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    isCorrect
                      ? "text-success-700 font-medium"
                      : isWrong
                        ? "text-error-700"
                        : isPicked
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                  )}
                >
                  {letter}. {text}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* Subjective input */}
      {!isMCQ && (
        <textarea
          className="mt-3 w-full min-h-[6rem] rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          placeholder="请输入简答要点..."
          disabled={revealed}
        />
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        {!revealed ? (
          <button
            type="button"
            onClick={onReveal}
            disabled={isMCQ && picked.length === 0}
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs hover:opacity-85 disabled:opacity-50"
          >
            {isMCQ ? "提交并查看解析" : "查看参考答案"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onReset}
            className="h-8 px-3 rounded-md border border-border bg-card text-xs text-muted-foreground hover:text-foreground"
          >
            重新作答
          </button>
        )}
      </div>

      {/* Answer reveal（中性底色，无正确/错误着色） */}
      {revealed && (
        <div className="mt-3 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
          {q.answer && (
            <div className="mb-2">
              <div className="font-medium text-foreground mb-1">参考答案</div>
              <div className="whitespace-pre-wrap">{q.answer}</div>
            </div>
          )}
          {q.analysis && (
            <div>
              <div className="font-medium text-foreground mb-1">解析</div>
              <div className="whitespace-pre-wrap leading-relaxed">{q.analysis}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
