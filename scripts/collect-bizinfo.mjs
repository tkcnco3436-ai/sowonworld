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

const KEYWORDS = {
  브랜드: ["브랜드", "BI", "CI", "로고", "브랜딩", "상표"],
  간판: ["간판", "점포", "환경개선", "외관", "인테리어"],
  포장: ["포장", "패키지", "라벨"],
  온라인: ["상세페이지", "온라인", "홍보", "SNS", "콘텐츠", "쇼핑몰"],
};
const DESIGN_WORDS = ["디자인", ...Object.values(KEYWORDS).flat()];
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
  url.searchParams.set("searchCnt", "200");
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
  const text = `${title} ${summary} ${hashtags}`;
  const period = String(pick(item, "reqstBeginEndDe", "reqstDt"));
  const dates = period.match(/\d{8}/g) ?? [];
  const link = pick(item, "pblancUrl", "link");
  const categories = Object.entries(KEYWORDS)
    .filter(([, words]) => words.some((w) => text.includes(w)))
    .map(([c]) => c);
  return {
    id: "bizinfo-" + (pick(item, "pblancId") || crypto.createHash("sha1").update(link || title).digest("hex").slice(0, 12)),
    title,
    agency: stripHtml(pick(item, "excInsttNm", "jrsdInsttNm", "author")),
    region: REGIONS.find((r) => hashtags.includes(r) || title.includes(r)) ?? "전국",
    categories: categories.length ? categories : ["기타"],
    target: stripHtml(pick(item, "trgetNm")) || "공고문 확인",
    support: summary.slice(0, 80),
    applyStart: toDate(dates[0]),
    applyEnd: toDate(dates[1] ?? null),
    url: link.startsWith("http") ? link : `https://www.bizinfo.go.kr${link}`,
    source: "bizinfo",
    summary: summary.slice(0, 400),
    requiredDocs: ["biz-reg", "sme-confirm", "tax-national", "tax-local", "plan"],
    collectedAt: new Date().toISOString(),
    designScore: DESIGN_WORDS.filter((w) => text.includes(w)).length,
  };
}

let items;
try {
  items = (await fetchList()).map(normalize);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const known = new Set([...read(PROGRAMS), ...read(INBOX)].map((p) => p.id));
const fresh = items.filter((p) => !known.has(p.id) && p.designScore > 0);
fs.writeFileSync(INBOX, JSON.stringify([...read(INBOX), ...fresh], null, 2) + "\n");
console.log(`가져온 공고 ${items.length}건 중 디자인 관련 새 공고 ${fresh.length}건을 검수 대기열에 넣었습니다.`);
console.log("다음 단계: npm run review");
