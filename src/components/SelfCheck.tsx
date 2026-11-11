"use client";

import Link from "next/link";
import { useState } from "react";

// 소상공인기본법 기준: 광업·제조업·건설업·운수업은 상시근로자 10명 미만, 그 밖의 업종은 5명 미만.
// 업종별 매출액 기준(소기업 기준)도 함께 충족해야 하므로 결과 화면에서 안내합니다.
const INDUSTRIES = [
  { value: "manufacturing", label: "제조업", limit: 10 },
  { value: "construction", label: "건설업", limit: 10 },
  { value: "transport", label: "운수업", limit: 10 },
  { value: "mining", label: "광업", limit: 10 },
  { value: "food", label: "음식점업", limit: 5 },
  { value: "retail", label: "도·소매업", limit: 5 },
  { value: "service", label: "서비스업 (미용·교육 등)", limit: 5 },
  { value: "etc", label: "그 밖의 업종", limit: 5 },
];

export function SelfCheck() {
  const [industry, setIndustry] = useState("food");
  const [workers, setWorkers] = useState("2");
  const ind = INDUSTRIES.find((i) => i.value === industry)!;
  const n = Number(workers);
  const valid = workers !== "" && Number.isFinite(n) && n >= 0;
  const ok = valid && n < ind.limit;

  return (
    <div className="selfcheck">
      <label htmlFor="sc-industry">
        업종
        <select id="sc-industry" value={industry} onChange={(e) => setIndustry(e.target.value)}>
          {INDUSTRIES.map((i) => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
      </label>
      <label htmlFor="sc-workers">
        상시근로자 수 (사장님 본인 제외)
        <input id="sc-workers" type="number" min={0} inputMode="numeric" value={workers} onChange={(e) => setWorkers(e.target.value)} />
      </label>
      {valid && (
        <div className={`result ${ok ? "yes" : "no"}`}>
          {ok ? (
            <>
              {ind.label} 기준(상시근로자 {ind.limit}명 미만)으로는 <b style={{ color: "var(--blue)" }}>소상공인에 해당할 가능성이 높아요.</b>{" "}
              업종별 매출액 기준도 충족해야 하니 소상공인 확인서로 최종 확인하세요.{" "}
              <Link href="/board" style={{ color: "var(--blue)" }}>신청 가능한 공고 보기 →</Link>
            </>
          ) : (
            <>
              {ind.label}은 상시근로자 {ind.limit}명 미만이 기준이라 소상공인에는 해당하지 않을 수 있어요. 중소기업 대상 공고도 함께 살펴보세요.
            </>
          )}
        </div>
      )}
    </div>
  );
}
