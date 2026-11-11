// 포트폴리오 제작소에서 쓰는 데이터 구조와 색 계산.
export type Orientation = "portrait" | "landscape";

export type Activity = {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  end: string;
  content: string;
  photos: string[]; // 브라우저 안에서만 쓰는 object URL
};

export type PortfolioData = {
  company: string;
  intro: string;
  contact: string;
  activities: Activity[];
  colors: string[]; // 최대 3개. [메인, 보조, 포인트]
  orientation: Orientation;
};

// A4 비율을 96dpi 픽셀로 (210 × 297mm)
export const A4 = { short: 794, long: 1123 };

export const PALETTE = [
  { hex: "#2563EB", name: "블루" },
  { hex: "#133C9E", name: "네이비" },
  { hex: "#FFC8DD", name: "연핑크" },
  { hex: "#E2557F", name: "로즈" },
  { hex: "#1E8FA6", name: "틸" },
  { hex: "#2F9E44", name: "그린" },
  { hex: "#9B2FC4", name: "퍼플" },
  { hex: "#F5A623", name: "오렌지" },
  { hex: "#E03131", name: "레드" },
  { hex: "#8B5E3C", name: "브라운" },
  { hex: "#2B2D33", name: "차콜" },
];

const toRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const toHex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

export function mix(hex: string, target: string, t: number) {
  const a = toRgb(hex);
  const b = toRgb(target);
  return toHex(a.map((v, i) => v + (b[i] - v) * t));
}

function luminance(hex: string) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// 배경색 위에 올릴 글자색 (밝은 색이면 차콜, 어두운 색이면 흰색)
export const onColor = (hex: string) => (luminance(hex) > 0.45 ? "#2B2D33" : "#FFFFFF");

// 고른 색이 1~2개여도 3가지 역할을 채웁니다.
export function themeVars(colors: string[]): Record<string, string> {
  const c1 = colors[0] ?? "#2563EB";
  const c2 = colors[1] ?? mix(c1, "#ffffff", 0.75);
  const c3 = colors[2] ?? (colors[1] ? mix(colors[1], "#000000", 0.15) : "#FFC8DD");
  // 메인색이 아주 밝으면 제목·숫자용으로 진하게 만든 색을 씁니다.
  const ink = luminance(c1) > 0.45 ? mix(c1, "#000000", 0.55) : c1;
  return {
    "--c1": c1,
    "--c1-light": mix(c1, "#ffffff", 0.25),
    "--c1-deep": mix(c1, "#000000", 0.45),
    "--c1-soft": mix(c1, "#ffffff", 0.9),
    "--c1-ink": ink,
    "--on-c1": onColor(c1),
    "--c2": c2,
    "--on-c2": onColor(c2),
    "--c3": c3,
    "--on-c3": onColor(c3),
  };
}

export function formatRange(a: Activity) {
  const f = (s: string) => s.replaceAll("-", ".");
  if (a.start && a.end && a.start !== a.end) return `${f(a.start)} ~ ${f(a.end)}`;
  return f(a.start || a.end || "");
}

let seq = 0;
export const newId = () => `a${Date.now().toString(36)}${(seq++).toString(36)}`;

export const EXAMPLE: PortfolioData = {
  company: "[예시] 동네빵집 OO베이커리",
  intro: "우리 동네 재료로 매일 아침 빵을 굽는 작은 베이커리입니다. 지역 행사와 협업으로 주민과 함께 성장하고 있어요.",
  contact: "[전화번호] · [이메일 주소] · @[인스타그램]",
  orientation: "portrait",
  colors: ["#2563EB", "#FFC8DD"],
  activities: [
    {
      id: "ex1",
      title: "OO구 가을 플리마켓 참여",
      start: "2026-09-12",
      end: "2026-09-14",
      content:
        "구청 주최 가을 플리마켓에 3일간 참여해 시그니처 식빵과 쿠키를 판매했습니다. 현장 시식 이벤트로 신규 고객을 만들고, 인스타그램 팔로우 이벤트를 함께 진행했습니다.",
      photos: [],
    },
    {
      id: "ex2",
      title: "선물용 쿠키 패키지 리뉴얼",
      start: "2026-06-01",
      end: "2026-07-31",
      content:
        "명절·기념일 선물 수요에 맞춰 쿠키 박스와 라벨 디자인을 새로 만들었습니다. 매장 진열과 온라인 판매 사진에 같은 디자인을 적용해 브랜드 인상을 통일했습니다.",
      photos: [],
    },
  ],
};
