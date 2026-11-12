"use client";

import { resetOnboarding } from "@/lib/tour";

// 첫 화면(초급/중급 선택)과 안내를 처음부터 다시 봅니다.
export function RestartTour() {
  return (
    <button
      type="button"
      className="restart-tour"
      onClick={() => {
        resetOnboarding();
        window.location.href = "/";
      }}
    >
      처음 안내 다시 보기
    </button>
  );
}
