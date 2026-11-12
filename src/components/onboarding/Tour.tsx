"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TOUR, TOUR_EVENT, getTour, matchesPath, setTour, type TourState } from "@/lib/tour";

type Box = { top: number; left: number; width: number; height: number };
const PAD = 8;

// 초급 안내: 강조할 곳만 밝히고 옆에 말풍선을 띄웁니다. 페이지를 넘나들며 이어집니다.
export function Tour() {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<TourState | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [vw, setVw] = useState(1024);
  const elRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const load = () => setState(getTour());
    load();
    window.addEventListener(TOUR_EVENT, load);
    return () => window.removeEventListener(TOUR_EVENT, load);
  }, []);

  const step = state ? TOUR[state.step] : undefined;
  const here = !!step && matchesPath(step, pathname);

  // 안내 버튼 대신 강조된 곳을 직접 눌러 다음 페이지로 오면 그 단계로 넘깁니다.
  useEffect(() => {
    if (!state) return;
    const cur = TOUR[state.step];
    const nxt = TOUR[state.step + 1];
    if (!cur?.next || !nxt || matchesPath(cur, pathname) || !matchesPath(nxt, pathname)) return;
    setTour(cur.next === "firstCard" ? { step: state.step + 1, detailHref: pathname } : { ...state, step: state.step + 1 });
  }, [state, pathname]);

  // 강조할 요소를 찾아 화면 가운데로 스크롤하고, 위치를 계속 따라갑니다.
  useEffect(() => {
    if (!step || !here) {
      setBox(null);
      return;
    }
    let raf = 0;
    let tries = 0;
    let scrolled = false;
    const tick = () => {
      const el = document.querySelector<HTMLElement>(step.target);
      elRef.current = el;
      if (el) {
        if (!scrolled) {
          el.scrollIntoView({ block: "center", behavior: "smooth" });
          scrolled = true;
        }
        const r = el.getBoundingClientRect();
        setBox({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
      } else if (++tries > 120) {
        setBox(null);
      }
      setVw(window.innerWidth);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step, here]);

  if (!state || !step) return null;

  const total = TOUR.length;
  const finish = () => setTour(null);
  const goNext = () => {
    const nextIndex = state.step + 1;
    if (nextIndex >= total) return finish();
    if (step.next === "firstCard") {
      const href = elRef.current?.getAttribute("href");
      setTour({ step: nextIndex, detailHref: href ?? undefined });
      if (href) router.push(href);
      return;
    }
    setTour({ ...state, step: nextIndex });
    if (step.next) router.push(step.next);
  };
  const resume = () => {
    // 공고 상세 단계인데 열었던 공고를 모르면 공고 고르기 단계로 돌아갑니다.
    if (step.path === "/board/" && !state.detailHref) {
      setTour({ step: 3 });
      router.push("/board");
      return;
    }
    router.push(step.path === "/board/" ? state.detailHref! : step.path);
  };

  // 다른 페이지에 있을 때는 작은 '안내 계속하기' 버튼만 보여줍니다.
  if (!here) {
    return (
      <div className="tour-resume">
        <button type="button" onClick={resume}>
          안내 계속하기 ({state.step + 1}/{total})
        </button>
        <button type="button" aria-label="안내 끝내기" onClick={finish}>×</button>
      </div>
    );
  }

  const mobile = vw < 720;
  let bubbleStyle: React.CSSProperties = {};
  if (!mobile && box) {
    const below = box.top + box.height + 220 < window.innerHeight;
    const left = Math.min(Math.max(16, box.left), vw - 376);
    bubbleStyle = below ? { top: box.top + box.height + 14, left } : { top: Math.max(16, box.top - 14), left, transform: "translateY(-100%)" };
  }

  return (
    <div className="tour" aria-live="polite">
      {box ? (
        <>
          {/* 강조 영역 바깥을 네 조각으로 어둡게 덮습니다 */}
          <div className="tour-shade" style={{ top: 0, left: 0, right: 0, height: Math.max(0, box.top) }} />
          <div className="tour-shade" style={{ top: box.top + box.height, left: 0, right: 0, bottom: 0 }} />
          <div className="tour-shade" style={{ top: box.top, left: 0, width: Math.max(0, box.left), height: box.height }} />
          <div className="tour-shade" style={{ top: box.top, left: box.left + box.width, right: 0, height: box.height }} />
          <div className="tour-spot" style={{ top: box.top, left: box.left, width: box.width, height: box.height }} />
        </>
      ) : (
        <div className="tour-dim" />
      )}
      <div className={`tour-bubble${mobile || !box ? " tour-bubble-sheet" : ""}`} style={bubbleStyle} role="dialog" aria-label={`안내 ${state.step + 1}단계`}>
        <div className="tour-progress">
          {TOUR.map((_, i) => (
            <i key={i} className={i <= state.step ? "on" : ""} />
          ))}
          <span>{state.step + 1} / {total}</span>
        </div>
        <b>{step.title}</b>
        <p>{step.text}</p>
        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={finish}>안내 건너뛰기</button>
          <button type="button" className="tour-next" onClick={goNext}>
            {state.step + 1 === total ? "안내 마치기" : step.next === "firstCard" ? "이 공고 열기 →" : "다음 →"}
          </button>
        </div>
      </div>
    </div>
  );
}
