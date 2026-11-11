export const CATEGORIES = ["브랜드", "간판", "포장", "온라인", "기타"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Program = {
  id: string;
  title: string;
  agency: string;
  region: string; // "전국" 또는 시·도 이름
  categories: Category[];
  target: string;
  support: string;
  amount?: string;
  applyStart: string | null; // YYYY-MM-DD
  applyEnd: string | null; // null이면 상시 접수
  url: string;
  source: "bizinfo" | "manual" | "sample";
  summary: string;
  requiredDocs: string[]; // documents.ts의 id
  sample?: boolean;
  collectedAt?: string;
};

export type StatusKind = "open" | "closing" | "upcoming" | "closed" | "always";

export type Status = {
  kind: StatusKind;
  label: string;
  daysLeft: number | null;
};
