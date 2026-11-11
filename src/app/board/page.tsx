import type { Metadata } from "next";
import { getPrograms } from "@/lib/programs";
import { getStatus, sortByDeadline } from "@/lib/status";
import { BoardFilters } from "@/components/BoardFilters";

export const metadata: Metadata = { title: "실시간 공고 — 디지월드" };

export default async function BoardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const items = sortByDeadline(getPrograms()).map((p) => ({ program: p, status: getStatus(p) }));
  const hasSample = items.some((i) => i.program.sample);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">실시간 공고 보드</span>
            <h2 style={{ marginTop: 6 }}>디자인 지원사업 공고</h2>
          </div>
        </div>
        {hasSample && (
          <p className="notice" style={{ marginBottom: 16 }}>
            지금은 화면 확인용 <b>예시 공고</b>가 표시됩니다. 실제 공고는 기업마당 API 연동 후 검수를 거쳐 올라옵니다.
          </p>
        )}
        <BoardFilters items={items} initialQuery={q} />
      </div>
    </section>
  );
}
