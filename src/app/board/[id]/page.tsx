import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgram } from "@/lib/programs";
import { formatPeriod, getStatus } from "@/lib/status";
import { getDoc } from "@/lib/documents";
import { StatusChip } from "@/components/ProgramCard";
import { ExternalLink } from "@/components/Icons";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProgram((await params).id);
  return { title: p ? `${p.title} — 디지월드` : "공고를 찾을 수 없어요" };
}

export default async function ProgramPage({ params }: Props) {
  const p = getProgram((await params).id);
  if (!p) notFound();
  const status = getStatus(p);
  const docs = p.requiredDocs.map(getDoc).filter((d) => d !== undefined);

  return (
    <section className="section">
      <div className="container">
        <Link href="/board" className="link-more">← 공고 목록</Link>
        <div className="detail" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <StatusChip status={status} />
              {p.categories.map((c) => <span key={c} className="chip chip-tag">{c}</span>)}
              {p.sample && <span className="chip chip-sample">예시</span>}
            </div>
            <h1>{p.title}</h1>
            <p className="muted">{p.agency} · {p.region}</p>
            {p.sample && <p className="notice">화면 확인용 예시 공고입니다. 실제 공고가 아니에요.</p>}
            <div className="info">
              <dl>
                <dt>지원 대상</dt><dd>{p.target}</dd>
                <dt>지원 내용</dt><dd>{p.support}</dd>
                {p.amount && (<><dt>지원 규모</dt><dd>{p.amount}</dd></>)}
                <dt>신청 기간</dt><dd>{formatPeriod(p)}</dd>
                <dt>주관 기관</dt><dd>{p.agency}</dd>
              </dl>
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>한눈에 요약</h2>
              <p>{p.summary}</p>
            </div>
            <p className="muted" style={{ fontSize: 14 }}>요약은 참고용이에요. 지원 조건과 제출 서류는 반드시 원문 공고로 확인하세요.</p>
          </div>

          <aside className="side">
            <div className="side-box">
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">원문 공고 보기 <ExternalLink /></a>
              <span className="muted" style={{ fontSize: 13 }}>기관 사이트에서 공고문과 신청 양식을 내려받으세요.</span>
            </div>
            <div className="side-box">
              <b style={{ color: "var(--ink)" }}>준비할 서류 {docs.length}개</b>
              <ul className="checklist">
                {docs.map((d) => (
                  <li key={d.id}>
                    {d.name}
                    <Link href={`/docs#${d.id}`}>발급처 →</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="side-box pink">
              <b style={{ color: "var(--ink)" }}>신청서 작성이 어렵다면</b>
              <span style={{ fontSize: 14 }}>태경씨앤코가 신청 준비부터 디자인 수행까지 도와드려요.</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>문의 [이메일 주소] · [전화번호]</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
