"use client";

import { useMemo, useState } from "react";
import { ProgramCard } from "./ProgramCard";
import { CATEGORIES, type Program, type Status, type StatusKind } from "@/lib/types";

type Item = { program: Program; status: Status };

const STATUS_FILTERS: { key: "all" | StatusKind | "active"; label: string }[] = [
  { key: "active", label: "신청 가능" },
  { key: "closing", label: "마감 임박" },
  { key: "upcoming", label: "접수 예정" },
  { key: "all", label: "전체(마감 포함)" },
];

export function BoardFilters({ items, initialQuery }: { items: Item[]; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [cats, setCats] = useState<string[]>([]);
  const [region, setRegion] = useState("전체");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]["key"]>("active");

  const regions = useMemo(
    () => ["전체", ...Array.from(new Set(items.map((i) => i.program.region))).sort()],
    [items],
  );

  const filtered = items.filter(({ program: p, status: s }) => {
    if (status === "active" && !["open", "closing", "always"].includes(s.kind)) return false;
    if (status !== "active" && status !== "all" && s.kind !== status) return false;
    if (cats.length && !p.categories.some((c) => cats.includes(c))) return false;
    if (region !== "전체" && !p.region.includes(region) && p.region !== "전국") return false;
    const q = query.trim();
    if (q) {
      const hay = `${p.title} ${p.agency} ${p.support} ${p.summary} ${p.categories.join(" ")}`;
      const synonyms: Record<string, string[]> = { 로고: ["브랜드", "로고", "BI"], 패키지: ["포장", "패키지"], 상세페이지: ["상세페이지", "온라인"] };
      const terms = synonyms[q] ?? [q];
      if (!terms.some((t) => hay.includes(t))) return false;
    }
    return true;
  });

  const toggleCat = (c: string) => setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <>
      <div className="filters">
        <div className="filter-row">
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="사업명·기관·키워드 검색" aria-label="검색어" id="board-q" />
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="지역" id="board-region">
            {regions.map((r) => (
              <option key={r} value={r}>{r === "전체" ? "지역 전체" : r}</option>
            ))}
          </select>
        </div>
        <div className="filter-row">
          <span>분야</span>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className="fchip" aria-pressed={cats.includes(c)} onClick={() => toggleCat(c)}>{c}</button>
          ))}
        </div>
        <div className="filter-row">
          <span>상태</span>
          {STATUS_FILTERS.map((f) => (
            <button key={f.key} type="button" className="fchip" aria-pressed={status === f.key} onClick={() => setStatus(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>
      <p className="result-count">공고 {filtered.length}건 · 마감 임박순 · 지역 선택 시 전국 공고도 함께 보여요</p>
      {filtered.length ? (
        <div className="cards">
          {filtered.map(({ program, status }) => (
            <ProgramCard key={program.id} program={program} status={status} />
          ))}
        </div>
      ) : (
        <div className="empty">조건에 맞는 공고가 없어요. 필터를 줄이거나 &lsquo;전체(마감 포함)&rsquo;를 눌러 보세요.</div>
      )}
    </>
  );
}
