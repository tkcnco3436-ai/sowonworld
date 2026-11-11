"use client";

import { useState } from "react";

type Props = {
  kind: "intro" | "content";
  text: string;
  context: { company?: string; title?: string; period?: string };
  onApply: (text: string) => void;
};

// 입력칸 아래에 붙는 'AI로 다듬기' 버튼. 결과는 바로 덮어쓰지 않고 비교한 뒤 적용합니다.
export function AiPolish({ kind, text, context, onApply }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const run = async () => {
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, text, ...context }),
      });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (!res.ok || !data.text) throw new Error(data.error ?? "AI 응답에 실패했어요.");
      setResult(data.text);
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI 응답에 실패했어요.");
      setState("error");
    }
  };

  return (
    <div className="pf-ai">
      <button type="button" className="pf-ai-btn" onClick={run} disabled={!text.trim() || state === "loading"}>
        {state === "loading" ? "다듬는 중…" : "✦ AI로 문장 다듬기"}
      </button>
      {state === "error" && <p className="pf-ai-error" role="alert">{error}</p>}
      {state === "done" && (
        <div className="pf-ai-result">
          <b>AI가 다듬은 문장</b>
          <p>{result}</p>
          <div className="pf-ai-actions">
            <button type="button" className="btn btn-primary" onClick={() => { onApply(result); setState("idle"); }}>이 문장으로 바꾸기</button>
            <button type="button" className="btn btn-ghost" onClick={run}>다시 다듬기</button>
            <button type="button" className="pf-link" onClick={() => setState("idle")}>닫기</button>
          </div>
          <span className="muted">AI가 쓴 문장도 사실과 맞는지 꼭 확인해 주세요.</span>
        </div>
      )}
    </div>
  );
}
