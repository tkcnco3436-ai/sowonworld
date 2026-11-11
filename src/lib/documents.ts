export type Doc = {
  id: string;
  name: string;
  issuer: string;
  url: string;
  urlLabel: string;
  note: string;
  forWho?: string;
};

// 링크와 발급 조건은 서비스 오픈 전에 다시 확인해야 합니다.
export const DOCUMENTS: Doc[] = [
  {
    id: "biz-reg",
    name: "사업자등록증명",
    issuer: "국세청 홈택스 · 정부24",
    url: "https://www.hometax.go.kr",
    urlLabel: "홈택스",
    note: "지원사업에서 가장 많이 요구하는 서류예요.",
  },
  {
    id: "sme-confirm",
    name: "소상공인 확인서",
    issuer: "중소기업현황정보시스템",
    url: "https://sminfo.mss.go.kr",
    urlLabel: "중소기업현황정보시스템",
    note: "발급까지 시간이 걸릴 수 있어 미리 신청하세요.",
  },
  {
    id: "tax-national",
    name: "국세 납세증명서",
    issuer: "국세청 홈택스 · 정부24",
    url: "https://www.hometax.go.kr",
    urlLabel: "홈택스",
    note: "세금 체납이 없다는 증명이에요.",
  },
  {
    id: "tax-local",
    name: "지방세 납세증명서",
    issuer: "위택스 · 정부24",
    url: "https://www.wetax.go.kr",
    urlLabel: "위택스",
    note: "국세 증명서와 함께 요구하는 경우가 많아요.",
  },
  {
    id: "vat-base",
    name: "부가가치세 과세표준증명",
    issuer: "국세청 홈택스",
    url: "https://www.hometax.go.kr",
    urlLabel: "홈택스",
    note: "매출 규모를 증빙할 때 써요.",
  },
  {
    id: "insurance-list",
    name: "4대보험 가입자 명부",
    issuer: "4대사회보험 정보연계센터",
    url: "https://www.4insure.or.kr",
    urlLabel: "4대사회보험 정보연계센터",
    note: "상시근로자 수를 증빙할 때 써요.",
  },
  {
    id: "corp-reg",
    name: "법인 등기사항증명서",
    issuer: "대법원 인터넷등기소",
    url: "https://www.iros.go.kr",
    urlLabel: "인터넷등기소",
    note: "법인 사업자만 해당돼요.",
    forWho: "법인",
  },
  {
    id: "plan",
    name: "신청서 · 사업계획서",
    issuer: "각 공고문 첨부 양식",
    url: "/guide#step-4",
    urlLabel: "작성 요령 보기",
    note: "공고마다 양식이 달라요. 공고문 첨부파일을 내려받아 쓰세요.",
  },
  {
    id: "photos",
    name: "현재 디자인 사진",
    issuer: "직접 촬영",
    url: "/guide#step-3",
    urlLabel: "촬영 팁 보기",
    note: "간판·로고·포장 등 바꾸고 싶은 디자인의 지금 모습을 찍어 두세요.",
  },
];

export function getDoc(id: string) {
  return DOCUMENTS.find((d) => d.id === id);
}
