// 기업마당 지원사업정보 API에서 새 공고를 가져와 data/inbox.json(검수 대기)에 쌓습니다.
// 사용법: .env.local에 BIZINFO_API_KEY=발급받은키 를 적고 npm run collect
// 인증키는 기업마당(bizinfo.go.kr)에서 API 이용 신청 후 발급받습니다.
// 첫 응답 2건을 data/raw-sample.json에 남기니, 필드명이 normalize()와 맞는지 확인하세요.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INBOX = path.join(ROOT, "data", "inbox.json");
const PROGRAMS = path.join(ROOT, "data", "programs.json");
const ENDPOINT = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";

// 분야 분류용. '홍보', '온라인', '패키지'처럼 흔한 단어는 분류에만 쓰고 관련성 판단에는 쓰지 않습니다.
const KEYWORDS = {
  브랜드: ["브랜드 개발", "브랜드 디자인", "브랜딩", "로고", "BI", "CI", "상표"],
  간판: ["간판", "시설개선", "시설환경개선", "점포환경개선", "노후점포", "인테리어"],
  포장: ["포장디자인", "포장 디자인", "패키지디자인", "패키지 디자인", "포장재", "라벨"],
  온라인: ["상세페이지", "콘텐츠 제작", "홍보 콘텐츠", "홍보물", "SNS", "온라인 판로"],
};
// 제목에 있으면 관련 공고로 봅니다.
const STRONG_TITLE = ["디자인", "간판", "브랜딩", "브랜드 개발", "로고", "상세페이지", "콘텐츠 제작", "홍보 콘텐츠", "홍보물", "시설개선", "시설환경개선", "점포환경개선", "노후점포", "포장재"];
// 본문에만 있을 때는 이 단어들일 때만 관련 공고로 봅니다.
const STRONG_BODY = ["디자인", "간판", "상세페이지", "브랜딩", "로고"];
// 디자인 단어가 나와도 디자인 지원이 아닌 공고 유형.
const EXCLUDE_TITLE = ["포상", "정보보호", "특례보증", "임차료", "카드수수료", "무역사절단", "주관기관", "전시회", "상담회", "인증제", "유공"];
const GENERIC_AGENCY = ["기초자치단체", "광역자치단체", "지방자치단체"];
const REGIONS = ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];

const ENV_FILE = path.join(ROOT, ".env.local");
if (!process.env.BIZINFO_API_KEY && fs.existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
const key = process.env.BIZINFO_API_KEY;
if (!key) {
  console.error("BIZINFO_API_KEY가 없습니다. platform/.env.local 파일에 BIZINFO_API_KEY=발급받은키 를 적어 주세요.");
  process.exit(1);
}

const pick = (o, ...names) => names.map((n) => o[n]).find((v) => v != null && v !== "") ?? "";
const stripHtml = (s) => String(s).replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const toDate = (s) => (s ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : null);
const read = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : []);

async function fetchList() {
  const url = new URL(ENDPOINT);
  url.searchParams.set("crtfcKey", key);
  url.searchParams.set("dataType", "json");
  url.searchParams.set("searchCnt", "2000"); // 게시 중인 공고 전체 (2026년 11월 기준 약 1,400건)
  const res = await fetch(url, { headers: { "User-Agent": "design-support-board/0.1" } });
  if (!res.ok) throw new Error(`기업마당 응답 오류: ${res.status}`);
  const body = await res.json();
  if (body.reqErr) throw new Error(`기업마당 오류: ${body.reqErr}`);
  const list = body.jsonArray ?? body.items ?? body.item ?? [];
  fs.writeFileSync(path.join(ROOT, "data", "raw-sample.json"), JSON.stringify({ keys: Object.keys(body), items: list.slice(0, 2) }, null, 2) + "\n");
  return list;
}

function normalize(item) {
  const title = stripHtml(pick(item, "pblancNm", "title"));
  const summary = stripHtml(pick(item, "bsnsSumryCn", "description"));
  const hashtags = String(pick(item, "hashtags"));
  const text = `${title} ${summary}`;
  const period = stripHtml(pick(item, "reqstBeginEndDe", "reqstDt"));
  // "2026-11-09 ~ 2026-11-16" 형식. 날짜가 없으면 "예산 소진시까지" 같은 문구를 그대로 보여줍니다.
  const dates = (period.match(/\d{4}-?\d{2}-?\d{2}/g) ?? []).map((d) => d.replaceAll("-", ""));
  const bracket = title.match(/^\[([^\]]+)\]/)?.[1];
  const tagRegion = REGIONS.map((r) => [r, hashtags.indexOf(r)]).filter(([, i]) => i >= 0).sort((a, b) => a[1] - b[1])[0]?.[0];
  const link = pick(item, "pblancUrl", "link");
  const categories = Object.entries(KEYWORDS)
    .filter(([, words]) => words.some((w) => text.includes(w)))
    .map(([c]) => c);
  const exc = stripHtml(pick(item, "excInsttNm"));
  const titleHits = STRONG_TITLE.filter((w) => title.includes(w)).length;
  const bodyHits = STRONG_BODY.filter((w) => summary.includes(w)).length;
  const excluded = EXCLUDE_TITLE.some((w) => title.includes(w));
  return {
    id: "bizinfo-" + (pick(item, "pblancId") || crypto.createHash("sha1").update(link || title).digest("hex").slice(0, 12)),
    title,
    agency: exc && !GENERIC_AGENCY.includes(exc) ? exc : stripHtml(pick(item, "jrsdInsttNm", "author")),
    region: bracket ? bracket.replaceAll("ㆍ", "·") : (tagRegion ?? "전국"),
    categories: categories.length ? categories : ["기타"],
    target: stripHtml(pick(item, "trgetNm")) || "공고문 확인",
    support: summary.length > 80 ? summary.slice(0, 80).trimEnd() + "…" : summary,
    applyStart: toDate(dates[0]),
    applyEnd: toDate(dates[1] ?? null),
    ...(dates.length < 2 && period ? { periodNote: period } : {}),
    url: link.startsWith("http") ? link : `https://www.bizinfo.go.kr${link}`,
    source: "bizinfo",
    summary: summary.slice(0, 400),
    requiredDocs: ["biz-reg", "sme-confirm", "tax-national", "tax-local", "plan"],
    collectedAt: new Date().toISOString(),
    designScore: excluded ? 0 : titleHits * 2 + bodyHits,
  };
}

let items;
try {
  items = (await fetchList()).map(normalize);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const today = new Date().toISOString().slice(0, 10);
const rejected = read(path.join(ROOT, "data", "rejected.json"));
const known = new Set([...read(PROGRAMS), ...read(INBOX)].map((p) => p.id).concat(rejected));
const fresh = items
  // 점수 2 이상 = 제목에 디자인 관련 단어가 있는 공고. 본문에만 한 번 나오는 공고는 대부분 무관해서 뺍니다.
  .filter((p) => !known.has(p.id) && p.designScore >= 2 && !(p.applyEnd && p.applyEnd < today))
  .sort((a, b) => b.designScore - a.designScore);
fs.writeFileSync(INBOX, JSON.stringify([...read(INBOX), ...fresh], null, 2) + "\n");
console.log(`가져온 공고 ${items.length}건 중 디자인 관련 새 공고 ${fresh.length}건을 검수 대기열에 넣었습니다.`);
console.log("다음 단계: npm run review");
