// 사업 성격: 지원금 지원 / 역량 강화 / 기타.
// 공고 제목으로 자동 분류하고, programs.json에 "kind"를 적으면 그 값이 우선합니다.
import type { Program } from "./types";

export type Kind = "grant" | "capacity" | "etc";

export const KINDS: { key: Kind; label: string; short: string; desc: string; detail: string }[] = [
  {
    key: "grant",
    label: "지원금 지원",
    short: "지원금",
    desc: "비용·제작·설치를 지원받아요",
    detail: "선정되면 디자인 제작이나 설치 비용을 지원받는 공고예요. 자부담이 있는지 원문에서 꼭 확인하세요.",
  },
  {
    key: "capacity",
    label: "역량 강화",
    short: "역량강화",
    desc: "교육·컨설팅·멘토링을 받아요",
    detail: "전문가에게 교육·컨설팅·멘토링을 받는 공고예요. 비용 대신 노하우와 조언을 지원받아요.",
  },
  {
    key: "etc",
    label: "기타",
    short: "기타",
    desc: "판로·전시·인증 등",
    detail: "판로 개척, 전시, 인증처럼 비용·교육 외의 방식으로 돕는 공고예요.",
  },
];

// 제목에 배우는 성격의 단어가 있으면 역량 강화를 먼저 봅니다 ("콘텐츠 제작 교육"은 교육).
const CAPACITY_WORDS = ["교육", "컨설팅", "멘토링", "자문", "코칭", "아카데미", "진단"];
const GRANT_WORDS = ["지원금", "보조금", "비용", "바우처", "설치", "제작", "개발", "개선", "출품", "출원", "구입비", "임차"];

export function classify(title: string): Kind {
  if (CAPACITY_WORDS.some((w) => title.includes(w))) return "capacity";
  if (GRANT_WORDS.some((w) => title.includes(w))) return "grant";
  return "etc";
}

export const kindOf = (p: Program): Kind => p.kind ?? classify(p.title);
export const kindInfo = (k: Kind) => KINDS.find((x) => x.key === k)!;
export const isKind = (v: string | undefined): v is Kind => KINDS.some((k) => k.key === v);
