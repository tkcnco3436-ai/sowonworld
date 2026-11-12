"use client";

import { useEffect, useState } from "react";
import { getLevel, setLevel, setTour } from "@/lib/tour";

// 메인에 처음 들어온 사람에게만 띄우는 2분할 입장 화면. 공유 링크로 하위 페이지에 들어온 사람은 막지 않습니다.
export function LevelGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getLevel()) setOpen(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const choose = (beginner: boolean) => {
    setLevel(beginner ? "beginner" : "expert");
    setOpen(false);
    if (beginner) setTour({ step: 0 });
  };

  return (
    <div className="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div className="gate-brand">
        <span className="logo-mark" aria-hidden>소</span>
        <b id="gate-title">소원월드에 오신 걸 환영해요</b>
      </div>
      <button type="button" className="gate-half gate-beginner" onClick={() => choose(true)} autoFocus>
        <span className="gate-tag">초급</span>
        <strong>처음이에요</strong>
        <span className="gate-desc">지원사업이 뭔지, 어디부터 눌러야 하는지<br />말풍선으로 하나씩 알려드려요</span>
        <span className="gate-go">안내 받으며 시작하기 →</span>
      </button>
      <button type="button" className="gate-half gate-expert" onClick={() => choose(false)}>
        <span className="gate-tag">중급</span>
        <strong>알고 있어요</strong>
        <span className="gate-desc">안내 없이 바로<br />공고와 서류 정보를 볼게요</span>
        <span className="gate-go">바로 들어가기 →</span>
      </button>
    </div>
  );
}
