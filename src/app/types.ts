export type MasteryLevel = 0 | 1 | 2 // 0=未学 1=学过 2=已掌握

export interface KPFlat {
  id: string;
  chapter: number;
  name: string;
  definition: string;
  bloom: string;
  examLevel: string;
  examLevelScore: number;
  examFrequency: number;
  years: number[];
  yearsCount: number;
  weight: string;
  weightScore: number;
  questionTypes: string[];
  points: string[];
}

export interface ChapterConnection {
  prerequisites: { chapter: number; reason: string }[];
  extensions: { chapter: number; reason: string }[];
  crossReferences: { chapter: number; reason: string }[];
}

export interface ChapterConnections {
  [chNum: string]: ChapterConnection;
}

export interface ExamQuestion {
  type: string;
  number: number;
  stem: string;
  answer: string;
  analysis: string;
  options: Record<string, string>;
  year_tags: string[];
  section: string;
}

export interface ChapterIndexItem {
  number: number;
  title: string;
  piece: string;
  kpCount: number;
  highWeight: number;
  midWeight: number;
  totalQuestions: number;
}
