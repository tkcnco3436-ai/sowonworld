// 포트폴리오 문장 다듬기 API. 사장님이 쓴 소개·활동 내용을 Claude가 읽기 좋은 문장으로 고쳐 줍니다.
// ANTHROPIC_API_KEY 환경 변수가 필요합니다 (.env.local, Vercel 프로젝트 환경 변수).
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_INPUT = 1500;
const LIMIT_PER_MINUTE = 8;

// 서버 인스턴스별 간단한 요청 제한. 정식 오픈 때는 로그인·결제와 묶어 제대로 제한합니다.
const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT_PER_MINUTE;
}

const SYSTEM = `너는 소상공인의 지원사업 신청용 포트폴리오 문장을 다듬는 편집자다.
- 사장님이 쓴 사실만 쓴다. 없는 수치, 성과, 고유명사를 지어내지 않는다.
- 숫자, 날짜, 상호, 지명, 행사명은 그대로 둔다.
- 심사위원이 빨리 읽을 수 있게 짧고 분명한 문장으로 쓴다. "~했습니다" 체를 쓴다.
- 과장된 홍보 문구("최고의", "혁신적인")와 이모지는 쓰지 않는다.
- 다듬은 문장만 출력한다. 제목, 따옴표, 설명, 머리말을 붙이지 않는다.`;

type Body = {
  kind?: "intro" | "content";
  text?: string;
  company?: string;
  title?: string;
  period?: string;
};

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI 기능이 아직 설정되지 않았어요. 관리자에게 문의해 주세요." }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (tooMany(ip)) {
    return NextResponse.json({ error: "요청이 많아요. 1분 뒤에 다시 시도해 주세요." }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const text = (body.text ?? "").trim();
  if (!text) return NextResponse.json({ error: "다듬을 내용을 먼저 적어 주세요." }, { status: 400 });
  if (text.length > MAX_INPUT) return NextResponse.json({ error: `${MAX_INPUT}자 이하로 줄여 주세요.` }, { status: 400 });

  const task =
    body.kind === "intro"
      ? `업체 "${body.company ?? ""}"의 한 줄 소개를 1~2문장, 80자 안팎으로 다듬어 줘.`
      : `활동 "${body.title ?? ""}"(${body.period || "기간 미입력"})의 참여 내용을 3~4문장, 220자 안팎으로 다듬어 줘. 무엇을 했는지 → 어떻게 했는지 → 결과 순서로 정리해.`;

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [{ role: "user", content: `${task}\n\n<원문>\n${text}\n</원문>` }],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "이 내용은 AI가 다듬을 수 없었어요. 문장을 조금 바꿔서 다시 시도해 주세요." }, { status: 422 });
    }
    const polished = response.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("")
      .trim();
    if (!polished) return NextResponse.json({ error: "다듬은 결과가 비어 있어요. 다시 시도해 주세요." }, { status: 502 });
    return NextResponse.json({ text: polished });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "AI 사용량이 많아요. 잠시 뒤 다시 시도해 주세요." }, { status: 429 });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic 인증 실패: ANTHROPIC_API_KEY 확인 필요");
      return NextResponse.json({ error: "AI 기능 설정에 문제가 있어요. 관리자에게 문의해 주세요." }, { status: 503 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API 오류 ${error.status}:`, error.message);
      return NextResponse.json({ error: "AI 응답에 실패했어요. 잠시 뒤 다시 시도해 주세요." }, { status: 502 });
    }
    throw error;
  }
}
