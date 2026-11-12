// 처음 온 사장님(초급)에게 보여주는 말풍선 안내 단계와 브라우저 저장 도우미.
export type Level = "beginner" | "expert";

export type TourStep = {
  path: string; // "/board/" 처럼 끝이 /면 그 아래 하위 페이지(공고 상세)를 뜻합니다
  target: string; // 강조할 요소 (data-tour 속성)
  title: string;
  text: string;
  next?: string; // 다음을 누르면 이동할 경로. "firstCard"는 강조한 공고 카드의 링크
};

export const TOUR: TourStep[] = [
  {
    path: "/",
    target: '[data-tour="start"]',
    title: "여기서 시작해요",
    text: "지원사업이 처음이라면 '처음이에요'를 눌러 신청 가이드부터 봐요.",
    next: "/guide",
  },
  {
    path: "/guide",
    target: '[data-tour="selfcheck"]',
    title: "지원 대상인지 확인해요",
    text: "업종과 직원 수만 넣으면 소상공인에 해당하는지 바로 알려드려요.",
    next: "/board",
  },
  {
    path: "/board",
    target: '[data-tour="region"]',
    title: "우리 가게 지역을 골라요",
    text: "지역을 누르면 우리 동네 공고와 전국 공고만 보여요. 다음에 와도 기억해 둘게요.",
  },
  {
    path: "/board",
    target: '[data-tour="cards"] > a',
    title: "공고를 열어 봐요",
    text: "마감이 가까운 순서예요. 관심 가는 공고를 눌러 보세요.",
    next: "firstCard",
  },
  {
    path: "/board/",
    target: '[data-tour="docs"]',
    title: "필요한 서류를 챙겨요",
    text: "이 공고에 필요한 서류예요. '발급처'를 누르면 서류를 떼는 사이트로 바로 가요.",
  },
  {
    path: "/board/",
    target: '[data-tour="origin"]',
    title: "신청은 원문 공고에서 해요",
    text: "신청서 양식과 접수는 기관 사이트에서 해요. 막히면 태경씨앤코가 도와드려요.",
  },
];

const LEVEL_KEY = "sowonworld-level";
const TOUR_KEY = "sowonworld-tour";
export const TOUR_EVENT = "sowonworld-tour-change";

export type TourState = { step: number; detailHref?: string };

const safe = <T,>(fn: () => T, fallback: T) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const getLevel = () => safe(() => localStorage.getItem(LEVEL_KEY) as Level | null, null);
export const setLevel = (l: Level) => safe(() => localStorage.setItem(LEVEL_KEY, l), undefined);

export const getTour = () => safe<TourState | null>(() => JSON.parse(localStorage.getItem(TOUR_KEY) ?? "null"), null);
export function setTour(s: TourState | null) {
  safe(() => (s ? localStorage.setItem(TOUR_KEY, JSON.stringify(s)) : localStorage.removeItem(TOUR_KEY)), undefined);
  window.dispatchEvent(new Event(TOUR_EVENT));
}

export function resetOnboarding() {
  safe(() => {
    localStorage.removeItem(LEVEL_KEY);
    localStorage.removeItem(TOUR_KEY);
  }, undefined);
}

export function matchesPath(step: TourStep, pathname: string) {
  return step.path.endsWith("/") && step.path !== "/"
    ? pathname.startsWith(step.path) && pathname.length > step.path.length
    : pathname === step.path;
}
