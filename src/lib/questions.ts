// 真题数据加载与 KP 关联查询（客户端，模块级缓存避免重复请求）

export interface QuestionItem {
  type: string;
  number: number;
  stem: string;
  answer: string;
  analysis: string;
  options: Record<string, string>;
  year_tags: string[];
  section: string;
  kp_id?: string;
  kp_chapter?: number;
  kp_name?: string;
  year?: number;
}

let cache: QuestionItem[] | null = null;
let loading: Promise<QuestionItem[]> | null = null;

export async function loadAllQuestions(): Promise<QuestionItem[]> {
  if (cache) return cache;
  if (loading) return loading;

  loading = (async () => {
    const resp = await fetch("/data/questions/_index.json");
    const idx = await resp.json();
    const all: QuestionItem[] = [];

    // 历年真题（按年份）
    for (const yr of idx.years as number[]) {
      try {
        const r = await fetch(`/data/questions/${yr}.json`);
        const qs = (await r.json()) as QuestionItem[];
        for (const q of qs) all.push({ ...q, year: yr });
      } catch {}
    }

    cache = all;
    return all;
  })();

  return loading;
}

// 从题目自带的知识点 chapter 字段推断所属章节
function inferChapterFromKP(q: QuestionItem): number | undefined {
  if (typeof q.kp_chapter === "number") return q.kp_chapter;
  return undefined;
}

// 查询某个 KP 关联的全部真题（按 kp_chapter + kp_id 匹配）
export async function getQuestionsForKP(chNum: number, kpId: string): Promise<QuestionItem[]> {
  const all = await loadAllQuestions();
  const matched = all.filter((q) => inferChapterFromKP(q) === chNum && q.kp_id === kpId);
  // 历年真题优先（有年份），其余按题型排列
  return matched.sort((a, b) => (b.year || 0) - (a.year || 0));
}

// 查询某章节对应的全部历年真题
export async function getQuestionsForChapter(chNum: number): Promise<QuestionItem[]> {
  const all = await loadAllQuestions();
  const matched = all.filter((q) => q.section === "历年真题" && inferChapterFromKP(q) === chNum);
  // 历年真题优先：有年份的按年份降序；同年份按题型顺序、题号升序
  const typeOrder: Record<string, number> = {
    单项选择题: 1,
    多项选择题: 2,
    名词解释: 3,
    简答题: 4,
    论述题: 5,
    案例分析题: 6,
  };
  return matched.sort((a, b) => {
    const yearDiff = (b.year || 0) - (a.year || 0);
    if (yearDiff !== 0) return yearDiff;
    const typeDiff = (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
    if (typeDiff !== 0) return typeDiff;
    return a.number - b.number;
  });
}
