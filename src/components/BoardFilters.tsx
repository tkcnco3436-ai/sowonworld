"use client";

import { useEffect, useState } from "react";
import { ProgramCard } from "./ProgramCard";
import { CATEGORIES, type Program, type Status, type StatusKind } from "@/lib/types";

type Item = { program: Program; status: Status };

// 맨 왼쪽부터 지역 전체, 부산, 서울 순. 나머지는 수도권 → 광역시 → 도 순서.
const REGIONS = ["전체", "부산", "서울", "경기", "인천", "대구", "광주", "대전", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];
const REGION_KEY = "sowonworld-region"; // 고른 지역을 다음 방문 때도 기억

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REGION_KEY);
      if (saved && REGIONS.includes(saved)) setRegion(saved);
    } catch {}
  }, []);

  const pickRegion = (r: string) => {
    setRegion(r);
    try {
      localStorage.setItem(REGION_KEY, r);
    } catch {}
  };

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
        </div>
        <div className="filter-row region-row" role="group" aria-label="내 지역">
          <span>내 지역</span>
          {REGIONS.map((r) => (
            <button key={r} type="button" className="fchip" aria-pressed={region === r} onClick={() => pickRegion(r)}>
              {r === "전체" ? "지역 전체" : r}
            </button>
          ))}
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
