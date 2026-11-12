"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EXAMPLE, PALETTE, formatRange, newId, type Activity, type PortfolioData } from "@/lib/portfolio";
import { PortfolioPage, buildPages, pageSize } from "./PortfolioPages";
import { AiPolish } from "./AiPolish";

const MAX_COLORS = 3;
const MAX_PHOTOS = 10;
const ROLE = ["메인", "보조", "포인트"];

export function PortfolioBuilder() {
  const [data, setData] = useState<PortfolioData>(EXAMPLE);
  const [page, setPage] = useState(0);
  const [custom, setCustom] = useState("#5B8DEF");
  const pages = buildPages(data);
  const current = Math.min(page, pages.length - 1);

  const update = (patch: Partial<PortfolioData>) => setData((d) => ({ ...d, ...patch }));
  const updateActivity = (id: string, patch: Partial<Activity>) =>
    setData((d) => ({ ...d, activities: d.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));

  const toggleColor = (hex: string) =>
    setData((d) => {
      if (d.colors.includes(hex)) return { ...d, colors: d.colors.filter((c) => c !== hex) };
      if (d.colors.length >= MAX_COLORS) return d;
      return { ...d, colors: [...d.colors, hex] };
    });

  const addPhotos = (a: Activity, files: FileList | null) => {
    if (!files) return;
    const room = MAX_PHOTOS - a.photos.length;
    const urls = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, room).map((f) => URL.createObjectURL(f));
    updateActivity(a.id, { photos: [...a.photos, ...urls] });
  };

  const removePhoto = (a: Activity, i: number) => {
    URL.revokeObjectURL(a.photos[i]);
    updateActivity(a.id, { photos: a.photos.filter((_, k) => k !== i) });
  };

  const addActivity = () =>
    setData((d) => ({ ...d, activities: [...d.activities, { id: newId(), title: "", start: "", end: "", content: "", photos: [] }] }));

  const removeActivity = (id: string) => setData((d) => ({ ...d, activities: d.activities.filter((a) => a.id !== id) }));

  const clearAll = () => {
    data.activities.forEach((a) => a.photos.forEach((p) => URL.revokeObjectURL(p)));
    setData({ company: "", intro: "", contact: "", colors: [], orientation: data.orientation, activities: [{ id: newId(), title: "", start: "", end: "", content: "", photos: [] }] });
    setPage(0);
  };

  // 키보드 ← → 로 페이지 넘기기 (입력 중일 때는 제외)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "ArrowRight") setPage((p) => Math.min(p + 1, pages.length - 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages.length]);

  // 미리보기 영역 폭에 맞춰 A4 페이지를 축소.
  // 모바일에서는 미리보기를 상단에 고정하므로 화면 높이의 1/3 안에 들어오게 줄입니다.
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { w, h } = pageSize(data.orientation);
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const mq = window.matchMedia("(max-width: 960px)");
    const fit = () => {
      setMobile(mq.matches);
      const maxH = mq.matches ? window.innerHeight * 0.34 : data.orientation === "portrait" ? 760 : Infinity;
      setScale(Math.min(1, (el.clientWidth - 2) / w, maxH / h));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [w, h, data.orientation]);

  // 작성 중인 칸에 맞춰 미리보기 페이지를 넘깁니다 (업체 정보 → 표지, 활동 → 그 활동 페이지, 연락처 → 마지막 장).
  const showActivity = (id: string) => {
    const i = pages.findIndex((p) => p.kind === "activity" && p.activity.id === id);
    if (i >= 0) setPage(i);
  };

  const isExample = data.company.startsWith("[예시]");

  return (
    <div className="pf-builder">
      <style>{`@page { size: A4 ${data.orientation}; margin: 0; }`}</style>

      <form className="pf-form" onSubmit={(e) => e.preventDefault()}>
        {isExample && (
          <p className="notice" style={{ display: "block" }}>예시 내용이 들어 있어요. 우리 업체 내용으로 바꾸거나 <button type="button" className="pf-link" onClick={clearAll}>모두 지우고 새로 쓰기</button>를 누르세요.</p>
        )}

        <fieldset className="pf-field" onFocusCapture={() => setPage(0)}>
          <legend>1. 업체 정보</legend>
          <label htmlFor="pf-company">업체명<input id="pf-company" value={data.company} onChange={(e) => update({ company: e.target.value })} placeholder="예: OO베이커리" /></label>
          <label htmlFor="pf-intro">한 줄 소개<textarea id="pf-intro" rows={2} value={data.intro} onChange={(e) => update({ intro: e.target.value })} placeholder="어떤 업체인지 1~2문장으로 적어 주세요" /></label>
          <AiPolish kind="intro" text={data.intro} context={{ company: data.company }} onApply={(t) => update({ intro: t })} />
          <label htmlFor="pf-contact">연락처 (마지막 장에 표시)<input id="pf-contact" onFocus={() => setPage(pages.length - 1)} value={data.contact} onChange={(e) => update({ contact: e.target.value })} placeholder="전화 · 이메일 · SNS" /></label>
        </fieldset>

        <fieldset className="pf-field">
          <legend>2. 참여 활동</legend>
          {data.activities.map((a, i) => (
            <div key={a.id} className="pf-act-form" onFocusCapture={() => showActivity(a.id)}>
              <div className="pf-act-head">
                <b>활동 {i + 1}</b>
                {data.activities.length > 1 && <button type="button" className="pf-link" onClick={() => removeActivity(a.id)}>삭제</button>}
              </div>
              <label htmlFor={`pf-title-${a.id}`}>활동명<input id={`pf-title-${a.id}`} value={a.title} onChange={(e) => updateActivity(a.id, { title: e.target.value })} placeholder="예: OO구 가을 플리마켓 참여" /></label>
              <div className="pf-row2">
                <label htmlFor={`pf-start-${a.id}`}>시작일<input id={`pf-start-${a.id}`} type="date" value={a.start} onChange={(e) => updateActivity(a.id, { start: e.target.value })} /></label>
                <label htmlFor={`pf-end-${a.id}`}>종료일<input id={`pf-end-${a.id}`} type="date" value={a.end} onChange={(e) => updateActivity(a.id, { end: e.target.value })} /></label>
              </div>
              <label htmlFor={`pf-content-${a.id}`}>참여 활동 내용<textarea id={`pf-content-${a.id}`} rows={4} value={a.content} onChange={(e) => updateActivity(a.id, { content: e.target.value })} placeholder="무엇을 했고 어떤 결과가 있었는지 적어 주세요" /></label>
              <AiPolish kind="content" text={a.content} context={{ company: data.company, title: a.title, period: formatRange(a) }} onApply={(t) => updateActivity(a.id, { content: t })} />
              <div className="pf-upload">
                <span>사진 ({a.photos.length}/{MAX_PHOTOS}) · 4장 넘으면 사진 페이지가 추가돼요</span>
                <div className="pf-thumbs">
                  {a.photos.map((src, k) => (
                    <div key={src} className="pf-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`활동 ${i + 1} 사진 ${k + 1}`} />
                      <button type="button" aria-label="사진 삭제" onClick={() => removePhoto(a, k)}>×</button>
                    </div>
                  ))}
                  {a.photos.length < MAX_PHOTOS && (
                    <label className="pf-add-photo" htmlFor={`pf-photo-${a.id}`}>
                      + 사진 추가
                      <input id={`pf-photo-${a.id}`} type="file" accept="image/*" multiple hidden onChange={(e) => { addPhotos(a, e.target.files); e.target.value = ""; }} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-ghost" onClick={addActivity}>+ 활동 추가</button>
        </fieldset>

        <fieldset className="pf-field">
          <legend>3. 우리 업체 컬러 (최대 {MAX_COLORS}개)</legend>
          <div className="pf-swatches">
            {PALETTE.map((c) => {
              const idx = data.colors.indexOf(c.hex);
              return (
                <button key={c.hex} type="button" className="pf-swatch" aria-pressed={idx >= 0} title={c.name} onClick={() => toggleColor(c.hex)} disabled={idx < 0 && data.colors.length >= MAX_COLORS}>
                  <i style={{ background: c.hex }} />
                  <span>{idx >= 0 ? ROLE[idx] : c.name}</span>
                </button>
              );
            })}
            <span className="pf-custom">
              <input type="color" id="pf-custom-color" value={custom} onChange={(e) => setCustom(e.target.value.toUpperCase())} aria-label="직접 고른 색" />
              <button type="button" className="pf-link" onClick={() => toggleColor(custom)} disabled={!data.colors.includes(custom) && data.colors.length >= MAX_COLORS}>
                {data.colors.includes(custom) ? "직접 고른 색 빼기" : "직접 고른 색 추가"}
              </button>
            </span>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>
            선택: {data.colors.length ? data.colors.map((c, i) => `${ROLE[i]} ${c}`).join(" · ") : "없음 (기본 블루로 만들어요)"}
          </p>
        </fieldset>

        <fieldset className="pf-field">
          <legend>4. 용지 방향 (A4)</legend>
          <div className="pf-orient">
            {(["portrait", "landscape"] as const).map((o) => (
              <button key={o} type="button" aria-pressed={data.orientation === o} onClick={() => update({ orientation: o })}>
                <i className={o} />{o === "portrait" ? "세로형" : "가로형"}
              </button>
            ))}
          </div>
        </fieldset>
      </form>

      <section className={`pf-viewer${mobile && collapsed ? " pf-collapsed" : ""}`} aria-label="미리보기">
        <div className="pf-viewer-bar">
          <b>미리보기 · A4 {data.orientation === "portrait" ? "세로" : "가로"} <span className="pf-count">{current + 1}/{pages.length}</span></b>
          <div className="pf-viewer-actions">
            {mobile && (
              <button type="button" className="pf-toggle" aria-expanded={!collapsed} onClick={() => setCollapsed((c) => !c)}>
                {collapsed ? "펼치기 ▾" : "접기 ▴"}
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={() => window.print()}>PDF로 저장</button>
          </div>
        </div>
        <div className="pf-stage" ref={stageRef} style={{ height: h * scale + 2 }}>
          <div style={{ width: w * scale, height: h * scale }} className="pf-scaled">
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <PortfolioPage data={data} spec={pages[current]} n={current + 1} />
            </div>
          </div>
        </div>
        <div className="pf-nav">
          <button type="button" onClick={() => setPage(Math.max(current - 1, 0))} disabled={current === 0} aria-label="이전 페이지">←</button>
          <span>{current + 1} / {pages.length}</span>
          <button type="button" onClick={() => setPage(Math.min(current + 1, pages.length - 1))} disabled={current === pages.length - 1} aria-label="다음 페이지">→</button>
        </div>
        <p className="muted pf-hint">키보드 ← → 로도 넘길 수 있어요. PDF로 저장할 때는 인쇄 창에서 &lsquo;PDF로 저장&rsquo;을 고르세요.</p>
      </section>

      {/* 인쇄(PDF 저장) 전용: 모든 페이지를 실제 크기로 이어 붙입니다 */}
      <div className="pf-print" aria-hidden>
        {pages.map((spec, i) => (
          <PortfolioPage key={i} data={data} spec={spec} n={i + 1} />
        ))}
      </div>
    </div>
  );
}
