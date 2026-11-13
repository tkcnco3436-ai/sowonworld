import Link from "next/link";
import { getPrograms } from "@/lib/programs";
import { getStatus, sortByDeadline } from "@/lib/status";
import { ProgramCard } from "@/components/ProgramCard";
import { LevelGate } from "@/components/onboarding/LevelGate";
import { KindIcon } from "@/components/KindIcon";
import { KINDS, kindOf } from "@/lib/kinds";
import { BookOpen, FileCheck, Megaphone, Search, Sparkles } from "@/components/Icons";

export const revalidate = 3600;

const QUICK = ["간판", "로고", "포장", "상세페이지"];

export default function Home() {
  const programs = sortByDeadline(getPrograms());
  const urgent = programs.filter((p) => ["closing", "open"].includes(getStatus(p).kind)).slice(0, 4);
  const hasSample = programs.some((p) => p.sample);
  const active = programs.filter((p) => ["closing", "open", "always"].includes(getStatus(p).kind));

  return (
    <>
      <LevelGate />
      <section className="hero">
        <div className="container">
          <span className="eyebrow">소상공인 디자인 지원사업 모음</span>
          <h1 style={{ marginTop: 10 }}>
            간판·로고·포장 디자인,
            <br />
            <em>지원받고</em> 바꾸세요
          </h1>
          <p className="lead">흩어진 지원사업 공고를 모아 마감 임박순으로 보여드려요. 신청 방법과 서류 발급처도 함께 안내합니다.</p>
          <form className="search" action="/board" role="search">
            <input name="q" type="search" placeholder="어떤 디자인이 필요하세요? 예: 간판" aria-label="공고 검색" />
            <button className="btn btn-primary" type="submit"><Search size={20} />찾기</button>
          </form>
          <div className="quick-tags">
            {QUICK.map((q) => (
              <Link key={q} href={`/board?q=${encodeURIComponent(q)}`}>#{q}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section kind-entry-section">
        <div className="container">
          <div className="section-head">
            <h2>어떤 도움이 필요하세요?</h2>
            <span className="muted" style={{ fontSize: 14 }}>지금 신청할 수 있는 공고 기준</span>
          </div>
          <div className="kind-entry">
            {KINDS.map((k) => {
              const n = active.filter((p) => kindOf(p) === k.key).length;
              return (
                <Link key={k.key} href={`/board?type=${k.key}`} className={`kind-card kind-card-${k.key}`}>
                  <span className="kind-card-icon"><KindIcon kind={k.key} size={28} /></span>
                  <span className="kind-card-text">
                    <b>{k.label}</b>
                    <span>{k.desc}</span>
                  </span>
                  <span className="kind-card-count"><em>{n}</em>건 →</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="tiles">
            <Link href="/guide" className="tile" data-tour="start">
              <span className="ic"><BookOpen /></span>
              <b>처음이에요</b>
              <span>5단계 신청 가이드와 30초 자가진단</span>
            </Link>
            <Link href="/board" className="tile">
              <span className="ic"><Megaphone /></span>
              <b>공고 보기</b>
              <span>마감 임박순 실시간 공고</span>
            </Link>
            <Link href="/docs" className="tile">
              <span className="ic"><FileCheck /></span>
              <b>서류 떼기</b>
              <span>증명서별 발급 사이트 바로가기</span>
            </Link>
            <Link href="/portfolio" className="tile pink">
              <span className="ic"><Sparkles /></span>
              <b>포트폴리오 제작</b>
              <span>사진과 활동 내용만 넣으면 A4 PDF로</span>
              <span className="chip chip-closing soon">BETA</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2>마감 임박 공고</h2>
            <Link href="/board" className="link-more">전체 보기 →</Link>
          </div>
          {hasSample && (
            <p className="notice" style={{ marginBottom: 16 }}>
              지금 보이는 공고는 화면 확인용 <b>예시</b>입니다. 기업마당 인증키를 등록하면 실제 공고로 바뀝니다.
            </p>
          )}
          <div className="cards">
            {urgent.map((p) => (
              <ProgramCard key={p.id} program={p} status={getStatus(p)} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>신청서 쓰기가 막막하다면 <span className="hl">함께 준비해요</span></h2>
              <p>공고 선택부터 신청서 작성, 선정 후 디자인 수행까지 태경씨앤코가 도와드립니다.</p>
            </div>
            <Link href="/guide#step-4" className="btn btn-pink">신청서 작성 팁 보기 →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
