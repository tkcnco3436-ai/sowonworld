import type { Metadata } from "next";
import Link from "next/link";
import { SelfCheck } from "@/components/SelfCheck";

export const metadata: Metadata = { title: "신청 가이드 — 디지월드" };

const STEPS = [
  { id: "step-1", short: "자가진단" },
  { id: "step-2", short: "공고 찾기" },
  { id: "step-3", short: "서류 준비" },
  { id: "step-4", short: "신청서 쓰기" },
  { id: "step-5", short: "선정 후 진행" },
];

const TERMS = [
  ["자부담", "지원금 외에 사장님이 직접 내야 하는 금액이에요. 보통 총 사업비의 일정 비율로 정해져요."],
  ["수행기관", "선정된 업체를 대신해 실제 디자인 작업을 맡는 디자인 전문회사예요."],
  ["정산", "지원금을 쓴 내역을 증빙 서류로 기관에 보고하는 절차예요."],
  ["상시근로자", "4대보험에 가입해 꾸준히 일하는 직원이에요. 대표자 본인은 보통 포함하지 않아요."],
  ["바우처", "정해진 금액 안에서 서비스를 골라 쓸 수 있는 이용권 방식의 지원이에요."],
  ["공고문", "지원 대상, 금액, 기간, 제출 서류가 모두 적힌 기관의 공식 안내문이에요."],
];

export default function GuidePage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <span className="eyebrow">신청 기초 가이드</span>
        <h1 style={{ fontSize: "clamp(28px, 4.4vw, 40px)", fontWeight: 900, marginTop: 8, lineHeight: 1.3 }}>
          처음이어도 5단계면 신청할 수 있어요
        </h1>
        <p style={{ marginTop: 12, fontSize: 17 }}>제일 오래 걸리는 건 서류 준비예요. 공고를 찾기 전에 3단계 서류부터 미리 떼어 두면 마감에 쫓기지 않아요.</p>
        <nav className="steps-nav" aria-label="단계 바로가기" style={{ marginTop: 24 }}>
          {STEPS.map((s, i) => (
            <a key={s.id} href={`#${s.id}`}>{i + 1}. {s.short}</a>
          ))}
        </nav>

        <div style={{ marginTop: 24 }}>
          <article className="step" id="step-1">
            <span className="step-num">1</span>
            <div>
              <h2>나는 소상공인일까? 30초 자가진단</h2>
              <p>소상공인 지원사업은 업종별 직원 수와 매출 기준을 함께 봐요. 직원 수부터 확인해 보세요.</p>
              <SelfCheck />
            </div>
          </article>

          <article className="step" id="step-2">
            <span className="step-num">2</span>
            <div>
              <h2>내게 맞는 공고 찾기</h2>
              <p>공고는 전국 단위(정부·공공기관)와 우리 동네 단위(시·군·구청)로 나뉘어요. 동네 공고가 경쟁이 덜한 경우가 많아요.</p>
              <ul>
                <li><Link href="/board" style={{ color: "var(--blue)", fontWeight: 700 }}>실시간 공고</Link>에서 분야와 지역을 고르세요.</li>
                <li>검색할 때는 &lsquo;디자인&rsquo;, &lsquo;브랜드&rsquo;, &lsquo;간판&rsquo;, &lsquo;포장&rsquo; 네 단어면 대부분 찾을 수 있어요.</li>
                <li>공고문에서 지원 대상, 자부담 비율, 마감일을 먼저 확인하세요.</li>
              </ul>
            </div>
          </article>

          <article className="step" id="step-3">
            <span className="step-num">3</span>
            <div>
              <h2>서류 미리 준비하기</h2>
              <p>사업자등록증명, 소상공인 확인서, 국세·지방세 납세증명서는 대부분의 공고에서 공통으로 요구해요.</p>
              <ul>
                <li>소상공인 확인서는 발급에 시간이 걸릴 수 있어 가장 먼저 신청하세요.</li>
                <li>바꾸고 싶은 간판·로고·포장의 지금 모습을 밝은 곳에서 정면으로 찍어 두세요. 개선 전후 비교 자료가 돼요.</li>
                <li>발급 사이트는 <Link href="/docs" style={{ color: "var(--blue)", fontWeight: 700 }}>서류 발급처</Link>에 모아 두었어요.</li>
              </ul>
            </div>
          </article>

          <article className="step" id="step-4">
            <span className="step-num">4</span>
            <div>
              <h2>신청서 · 사업계획서 쓰기</h2>
              <p>심사위원은 &lsquo;디자인을 바꾸면 무엇이 좋아지는지&rsquo;를 봐요. 세 가지만 구체적으로 쓰세요.</p>
              <ul>
                <li><b>문제:</b> &ldquo;매출이 줄었다&rdquo;보다 &ldquo;간판이 낡아 지나가는 손님이 가게를 못 알아본다&rdquo;처럼 디자인으로 풀 수 있는 문제를 적어요.</li>
                <li><b>활용 계획:</b> 새 디자인을 매장, 온라인, 제품 중 어디에 어떻게 쓸지 적어요.</li>
                <li><b>기대 효과:</b> 재방문, 온라인 주문처럼 확인할 수 있는 변화를 적어요.</li>
                <li>마감일에는 접속이 몰리니 2~3일 전에 제출하세요.</li>
              </ul>
            </div>
          </article>

          <article className="step" id="step-5">
            <span className="step-num">5</span>
            <div>
              <h2>선정 후 디자인 진행하기</h2>
              <p>선정되면 수행기관(디자인 회사)과 시안을 협의하고, 결과물과 사용 내역을 기관에 보고(정산)해요.</p>
              <ul>
                <li>수행기관을 직접 고르는 사업이라면 기관에 등록된 디자인 전문회사인지 확인하세요.</li>
                <li>자부담금 납부 시기와 정산 서류를 미리 확인하세요.</li>
              </ul>
            </div>
          </article>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 900, margin: "40px 0 16px" }}>자주 나오는 용어</h2>
        <div className="glossary">
          {TERMS.map(([t, d]) => (
            <div key={t}><b>{t}</b>{d}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
