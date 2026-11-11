import type { Metadata } from "next";
import { PortfolioBuilder } from "@/components/portfolio/PortfolioBuilder";
import "./portfolio.css";

export const metadata: Metadata = { title: "포트폴리오 제작소 — 소원월드" };

export default function PortfolioPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head pf-intro">
          <div>
            <span className="eyebrow">포트폴리오 제작소 · BETA</span>
            <h2 style={{ marginTop: 6 }}>사진과 활동 내용만 넣으면 A4 포트폴리오가 완성돼요</h2>
            <p className="muted" style={{ marginTop: 6 }}>지원사업 신청서에 붙일 회사 소개·활동 실적 자료로 쓰세요. 올린 사진은 이 브라우저 안에서만 쓰이고 서버에 저장되지 않아요.</p>
          </div>
        </div>
        <PortfolioBuilder />
      </div>
    </section>
  );
}
