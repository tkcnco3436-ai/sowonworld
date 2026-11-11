import type { Program, Status } from "./types";

// 날짜 계산만 하는 순수 함수라 클라이언트 컴포넌트에서도 씁니다.
const DAY = 24 * 60 * 60 * 1000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getStatus(p: Program, today = new Date()): Status {
  const now = startOfDay(today);
  if (!p.applyEnd) return { kind: "always", label: "상시 접수", daysLeft: null };
  const end = parseDate(p.applyEnd);
  if (p.applyStart && parseDate(p.applyStart) > now) {
    return { kind: "upcoming", label: "접수 예정", daysLeft: null };
  }
  const daysLeft = Math.round((end.getTime() - now.getTime()) / DAY);
  if (daysLeft < 0) return { kind: "closed", label: "마감", daysLeft };
  if (daysLeft <= 7) return { kind: "closing", label: daysLeft === 0 ? "오늘 마감" : `마감 D-${daysLeft}`, daysLeft };
  return { kind: "open", label: "접수중", daysLeft };
}

// 마감이 가까운 순서. 상시·예정은 그 뒤, 마감된 공고는 맨 뒤.
export function sortByDeadline(list: Program[], today = new Date()) {
  const rank = { closing: 0, open: 1, always: 2, upcoming: 3, closed: 4 } as const;
  return [...list].sort((a, b) => {
    const sa = getStatus(a, today);
    const sb = getStatus(b, today);
    if (rank[sa.kind] !== rank[sb.kind]) return rank[sa.kind] - rank[sb.kind];
    return (sa.daysLeft ?? 9999) - (sb.daysLeft ?? 9999);
  });
}

export function formatPeriod(p: Program) {
  const f = (s: string) => s.replaceAll("-", ".");
  if (!p.applyEnd) return "상시 접수";
  return `${p.applyStart ? f(p.applyStart) : ""} ~ ${f(p.applyEnd)}`;
}
