"use client";

import { useEffect, useState } from "react";
import { ProgramCard } from "./ProgramCard";
import { KindIcon } from "./KindIcon";
import { CATEGORIES, type Program, type Status, type StatusKind } from "@/lib/types";
import { KINDS, kindOf, type Kind } from "@/lib/kinds";

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

const SYNONYMS: Record<string, string[]> = { 로고: ["브랜드", "로고", "BI"], 패키지: ["포장", "패키지"], 상세페이지: ["상세페이지", "온라인"] };

export function BoardFilters({ items, initialQuery, initialKind }: { items: Item[]; initialQuery: string; initialKind: Kind | "all" }) {
  const [kind, setKind] = useState<Kind | "all">(initialKind);
  const [query, setQuery] = useState(initialQuery);
  const [cats, setCats] = useState<string[]>([]);
  const [region, setRegion] = useState("전체");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]["key"]>("active");
  const [moreOpen, setMoreOpen] = useState(false); // 휴대폰에서 분야·상태 필터 펼치기

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

  // 사업 성격은 주소(?type=)에도 남겨서 링크로 공유하거나 뒤로 가기 해도 유지되게 합니다.
  const pickKind = (k: Kind | "all") => {
    setKind(k);
    const url = new URL(window.location.href);
    if (k === "all") url.searchParams.delete("type");
    else url.searchParams.set("type", k);
    window.history.replaceState(null, "", url);
  };

  // 사업 성격을 뺀 나머지 조건으로 먼저 거르고, 탭마다 건수를 셉니다.
  const base = items.filter(({ program: p, status: s }) => {
    if (status === "active" && !["open", "closing", "always"].includes(s.kind)) return false;
    if (status !== "active" && status !== "all" && s.kind !== status) return false;
    if (cats.length && !p.categories.some((c) => cats.includes(c))) return false;
    if (region !== "전체" && !p.region.includes(region) && p.region !== "전국") return false;
    const q = query.trim();
    if (q) {
      const hay = `${p.title} ${p.agency} ${p.support} ${p.summary} ${p.categories.join(" ")}`;
      if (!(SYNONYMS[q] ?? [q]).some((t) => hay.includes(t))) return false;
    }
    return true;
  });
  const counts = Object.fromEntries(KINDS.map((k) => [k.key, base.filter((i) => kindOf(i.program) === k.key).length])) as Record<Kind, number>;
  const filtered = kind === "all" ? base : base.filter((i) => kindOf(i.program) === kind);

  const toggleCat = (c: string) => setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const narrowed = query.trim() !== "" || cats.length > 0 || region !== "전체" || status !== "active";
  const resetFilters = () => {
    setQuery("");
    setCats([]);
    setStatus("active");
    pickRegion("전체");
  };

  return (
    <>
      <div className="kind-tabs" role="tablist" aria-label="사업 성격" data-tour="kinds">
        <button type="button" role="tab" aria-selected={kind === "all"} className="kind-tab kind-tab-all" onClick={() => pickKind("all")}>
          <span className="kind-tab-head"><b>전체</b><em>{base.length}</em></span>
          <span className="kind-tab-desc">모든 공고</span>
        </button>
        {KINDS.map((k) => (
          <button key={k.key} type="button" role="tab" aria-selected={kind === k.key} className={`kind-tab kind-tab-${k.key}`} onClick={() => pickKind(k.key)}>
            <span className="kind-tab-head">
              <KindIcon kind={k.key} size={20} />
              <b>{k.label}</b>
              <em>{counts[k.key]}</em>
            </span>
            <span className="kind-tab-desc">{k.desc}</span>
          </button>
        ))}
      </div>

      <div className="filters">
        <div className="filter-row">
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="사업명·기관·키워드 검색" aria-label="검색어" id="board-q" />
        </div>
        <div className="filter-row region-row" role="group" aria-label="내 지역" data-tour="region">
          <span>내 지역</span>
          {REGIONS.map((r) => (
            <button key={r} type="button" className="fchip" aria-pressed={region === r} onClick={() => pickRegion(r)}>
              {r === "전체" ? "지역 전체" : r}
            </button>
          ))}
        </div>
        <button type="button" className="filters-more" aria-expanded={moreOpen} onClick={() => setMoreOpen((o) => !o)}>
          필터 더 보기 (분야·상태){cats.length + (status !== "active" ? 1 : 0) > 0 && <em>{cats.length + (status !== "active" ? 1 : 0)}</em>}
          <span aria-hidden>{moreOpen ? "▴" : "▾"}</span>
        </button>
        <div className={`filters-extra${moreOpen ? " open" : ""}`}>
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
      </div>
      <div className="result-bar">
        <p className="result-count">
          {kind !== "all" && <b>{KINDS.find((k) => k.key === kind)!.label} </b>}공고 {filtered.length}건 · 마감 임박순
        </p>
        {narrowed && <button type="button" className="pf-link" onClick={resetFilters}>조건 초기화</button>}
      </div>
      {filtered.length ? (
        <div className="cards" data-tour="cards">
          {filtered.map(({ program, status }) => (
            <ProgramCard key={program.id} program={program} status={status} />
          ))}
        </div>
      ) : (
        <div className="empty">
          조건에 맞는 공고가 없어요.
          <div className="empty-actions">
            {kind !== "all" && <button type="button" className="btn btn-ghost" onClick={() => pickKind("all")}>모든 성격 보기</button>}
            {narrowed && <button type="button" className="btn btn-ghost" onClick={resetFilters}>조건 초기화</button>}
          </div>
        </div>
      )}
    </>
  );
}
