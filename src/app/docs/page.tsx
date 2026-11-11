import type { Metadata } from "next";
import Link from "next/link";
import { DOCUMENTS } from "@/lib/documents";
import { ExternalLink } from "@/components/Icons";

export const metadata: Metadata = { title: "서류 발급처 — 디지월드" };

export default function DocsPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">서류 발급처 모음</span>
            <h2 style={{ marginTop: 6 }}>지원사업에 자주 쓰는 서류</h2>
            <p className="muted" style={{ marginTop: 6 }}>대부분 온라인으로 바로 발급돼요. 필요한 서류는 공고마다 다르니 공고문의 &lsquo;제출 서류&rsquo;를 확인하세요.</p>
          </div>
        </div>
        <div className="doc-list">
          {DOCUMENTS.map((d) => {
            const external = d.url.startsWith("http");
            return (
              <article key={d.id} id={d.id} className="doc">
                <h3>{d.name}</h3>
                <span className="issuer">{d.issuer}{d.forWho ? ` · ${d.forWho}만 해당` : ""}</span>
                <p>{d.note}</p>
                {external ? (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">{d.urlLabel} 바로가기 <ExternalLink size={16} /></a>
                ) : (
                  <Link href={d.url} className="btn btn-ghost">{d.urlLabel} →</Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
