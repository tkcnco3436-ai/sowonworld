"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TOUR_EVENT, getTour, setLevel, setTour } from "@/lib/tour";

// 모든 화면 오른쪽 아래에 떠 있는 물음표 말풍선. 누르면 초급 안내를 처음부터 시작합니다.
// 안내가 진행 중일 때는 안내 화면이 대신 보이므로 숨깁니다.
export function HelpButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [touring, setTouring] = useState(true); // 첫 렌더에서 깜빡이지 않도록 숨긴 채 시작

  useEffect(() => {
    const sync = () => setTouring(!!getTour());
    sync();
    window.addEventListener(TOUR_EVENT, sync);
    return () => window.removeEventListener(TOUR_EVENT, sync);
  }, []);

  if (touring) return null;

  const start = () => {
    setLevel("beginner");
    setTour({ step: 0 });
    if (pathname !== "/") router.push("/");
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button type="button" className="help-fab" onClick={start} aria-label="이용 가이드 보기 (처음부터 차근차근 안내)">
      <span className="help-fab-label">처음이세요? 이용 가이드</span>
      <span className="help-fab-bubble" aria-hidden>?</span>
    </button>
  );
}
