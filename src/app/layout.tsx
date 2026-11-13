import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
import { BottomNav } from "@/components/BottomNav";
import { FamilyBar } from "@/components/FamilyBar";
import { SANGINWORLD_URL } from "@/lib/site";
import { Tour } from "@/components/onboarding/Tour";
import { RestartTour } from "@/components/onboarding/RestartTour";
import { HelpButton } from "@/components/onboarding/HelpButton";
import "./globals.css";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "소원월드 — 디자인 지원사업 정보 월드",
  description: "간판·로고·포장·상세페이지 디자인 지원사업 공고를 모아 보고, 신청 방법과 서류 발급처까지 한 번에 확인하세요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <FamilyBar />
        <header className="site-header">
          <div className="container">
            <Link href="/" className="logo">
              <span className="logo-mark" aria-hidden>소</span>
              소원월드
              <span className="beta">BETA</span>
            </Link>
            <NavLinks />
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            <b style={{ color: "var(--ink)" }}>소원월드 (디자인 지원사업 정보 월드) · 운영 태경씨앤코</b>
            <span>공고 요약은 참고용입니다. 지원 대상과 조건은 반드시 기관 공고문 원문으로 확인하세요.</span>
            <span>문의 [이메일 주소] · [전화번호]</span>
            <span>
              패밀리 사이트{" "}
              <a href={SANGINWORLD_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", fontWeight: 700 }}>상인월드 ↗</a>
            </span>
            <RestartTour />
          </div>
        </footer>
        <BottomNav />
        <Tour />
        <HelpButton />
      </body>
    </html>
  );
}
