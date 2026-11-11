// A4 포트폴리오 페이지 템플릿. 태경씨앤코 디자인 시스템의 커버(A1)·INDEX(A2)·콘텐츠·CTA 카드 구성을 A4로 옮겼습니다.
import type { CSSProperties, ReactNode } from "react";
import { A4, formatRange, themeVars, type Activity, type PortfolioData } from "@/lib/portfolio";

type PageSpec =
  | { kind: "cover" }
  | { kind: "index" }
  | { kind: "activity"; activity: Activity; no: number }
  | { kind: "gallery"; activity: Activity; no: number; photos: string[] }
  | { kind: "closing" };

const MAIN_PHOTOS = 4;
const GALLERY_PHOTOS = 6;

export function buildPages(data: PortfolioData): PageSpec[] {
  const pages: PageSpec[] = [{ kind: "cover" }];
  if (data.activities.length > 1) pages.push({ kind: "index" });
  data.activities.forEach((a, i) => {
    pages.push({ kind: "activity", activity: a, no: i + 1 });
    const rest = a.photos.slice(MAIN_PHOTOS);
    for (let k = 0; k < rest.length; k += GALLERY_PHOTOS) {
      pages.push({ kind: "gallery", activity: a, no: i + 1, photos: rest.slice(k, k + GALLERY_PHOTOS) });
    }
  });
  pages.push({ kind: "closing" });
  return pages;
}

export function pageSize(o: PortfolioData["orientation"]) {
  return o === "portrait" ? { w: A4.short, h: A4.long } : { w: A4.long, h: A4.short };
}

function overallRange(acts: Activity[]) {
  const dates = acts.flatMap((a) => [a.start, a.end]).filter(Boolean).sort();
  if (!dates.length) return "";
  const f = (s: string) => s.slice(0, 7).replace("-", ".");
  return dates[0].slice(0, 7) === dates[dates.length - 1].slice(0, 7) ? f(dates[0]) : `${f(dates[0])} ~ ${f(dates[dates.length - 1])}`;
}

function Footer({ data, n }: { data: PortfolioData; n: number }) {
  return (
    <div className="pf-footer">
      <span>{data.company || "업체명"} · 활동 포트폴리오</span>
      <b>{String(n).padStart(2, "0")}</b>
    </div>
  );
}

function Photos({ photos, max }: { photos: string[]; max: number }) {
  const list = photos.slice(0, max);
  if (!list.length) {
    return <div className="pf-photos pf-photos-0"><div className="pf-ph">사진을 추가하면 이곳에 들어가요</div></div>;
  }
  return (
    <div className={`pf-photos pf-photos-${Math.min(list.length, 6)}`}>
      {list.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={src} alt={`활동 사진 ${i + 1}`} />
      ))}
    </div>
  );
}

function Page({ data, children, className = "", style }: { data: PortfolioData; children: ReactNode; className?: string; style?: CSSProperties }) {
  const { w, h } = pageSize(data.orientation);
  return (
    <div className={`pf-page pf-${data.orientation} ${className}`} style={{ width: w, height: h, ...(themeVars(data.colors) as CSSProperties), ...style }}>
      {children}
    </div>
  );
}

export function PortfolioPage({ data, spec, n }: { data: PortfolioData; spec: PageSpec; n: number }) {
  const year = new Date().getFullYear();

  if (spec.kind === "cover") {
    const range = overallRange(data.activities);
    return (
      <Page data={data} className="pf-cover">
        <i className="pf-ring pf-ring-a" /><i className="pf-ring pf-ring-b" />
        <div className="pf-cover-top"><span>PORTFOLIO {year}</span><b>{data.company || "업체명"}</b></div>
        <div className="pf-cover-body">
          <span className="pf-tag pf-tag-c2">활동 포트폴리오</span>
          <h1>{data.company || "업체명을 입력하세요"}</h1>
          {data.intro && <p>{data.intro}</p>}
        </div>
        <div className="pf-cover-foot">
          <span>참여 활동 {data.activities.length}건</span>
          {range && <span>{range}</span>}
        </div>
      </Page>
    );
  }

  if (spec.kind === "index") {
    return (
      <Page data={data} className="pf-index">
        <h2 className="pf-index-title">INDEX</h2>
        <ol className="pf-index-list">
          {data.activities.map((a, i) => (
            <li key={a.id}>
              <span className="pf-index-no">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <b>{a.title || "활동명"}</b>
                <span>{formatRange(a)}</span>
              </div>
            </li>
          ))}
        </ol>
        <Footer data={data} n={n} />
      </Page>
    );
  }

  if (spec.kind === "activity") {
    const a = spec.activity;
    return (
      <Page data={data} className="pf-activity">
        <div className="pf-act-text">
          <span className="pf-eyebrow">ACTIVITY {String(spec.no).padStart(2, "0")}</span>
          <h2>{a.title || "활동명을 입력하세요"}</h2>
          {formatRange(a) && <span className="pf-tag pf-tag-c2">{formatRange(a)}</span>}
          <div className="pf-insight">
            <b>참여 내용</b>
            <p>{a.content || "어떤 활동이었는지, 무엇을 했고 어떤 결과가 있었는지 적어 주세요."}</p>
          </div>
        </div>
        <Photos photos={a.photos} max={MAIN_PHOTOS} />
        <Footer data={data} n={n} />
      </Page>
    );
  }

  if (spec.kind === "gallery") {
    return (
      <Page data={data} className="pf-gallery">
        <span className="pf-eyebrow">ACTIVITY {String(spec.no).padStart(2, "0")} · 현장 사진</span>
        <h2>{spec.activity.title}</h2>
        <Photos photos={spec.photos} max={GALLERY_PHOTOS} />
        <Footer data={data} n={n} />
      </Page>
    );
  }

  return (
    <Page data={data} className="pf-closing">
      <div className="pf-cta">
        <span className="pf-tag pf-tag-c3">CONTACT</span>
        <h2>함께 일할 기회를<br />기다리고 있습니다</h2>
        <p className="pf-cta-company">{data.company || "업체명"}</p>
        {data.contact && <p className="pf-cta-contact">{data.contact}</p>}
      </div>
      <Footer data={data} n={n} />
    </Page>
  );
}
