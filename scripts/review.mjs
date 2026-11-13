// 검수 대기 공고(data/inbox.json)를 확인하고 승인하면 data/programs.json으로 옮깁니다.
// 사용법:
//   npm run review                         하나씩 보며 승인(y)/반려(n)/보류(Enter)
//   npm run review -- --list               대기 목록만 번호와 함께 보기
//   npm run review -- --approve 1,3,5      번호로 승인 (all 이면 전부)
//   npm run review -- --reject 2,4         번호로 반려
//   npm run review -- --clear-samples      예시 공고 삭제
// 승인 후 변경된 programs.json을 배포하면 보드에 반영됩니다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline/promises";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INBOX = path.join(ROOT, "data", "inbox.json");
const PROGRAMS = path.join(ROOT, "data", "programs.json");
const REJECTED = path.join(ROOT, "data", "rejected.json"); // 반려한 공고 id. 다음 수집 때 다시 올라오지 않게 합니다.
const read = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : []);
const rejected = read(REJECTED);
const write = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2) + "\n");
const clean = ({ designScore, ...p }) => p;

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : (args[i + 1] ?? "");
};
const inbox = read(INBOX);
const programs = read(PROGRAMS);

// 사업 성격 미리보기 (src/lib/kinds.ts와 같은 규칙). 틀리면 programs.json에 "kind"를 직접 적어 고칩니다.
const KIND_LABEL = { grant: "지원금 지원", capacity: "역량 강화", etc: "기타" };
const guessKind = (t) =>
  ["교육", "컨설팅", "멘토링", "자문", "코칭", "아카데미", "진단"].some((w) => t.includes(w))
    ? "capacity"
    : ["지원금", "보조금", "비용", "바우처", "설치", "제작", "개발", "개선", "출품", "출원", "구입비", "임차"].some((w) => t.includes(w))
      ? "grant"
      : "etc";

const show = (p, n) => {
  console.log(`\n[${n}] ${p.title}`);
  console.log(`  사업 성격: ${KIND_LABEL[p.kind ?? guessKind(p.title)]}`);
  console.log(`  기관: ${p.agency} · 지역: ${p.region} · 분야: ${p.categories.join(", ")}`);
  const period = p.applyEnd ? `${p.applyStart ?? "?"} ~ ${p.applyEnd}` : (p.periodNote ?? "상시");
  console.log(`  기간: ${period} · 디자인 관련도: ${p.designScore ?? "-"}`);
  console.log(`  원문: ${p.url}`);
};
const pickNums = (s) => (s === "all" ? inbox.map((_, i) => i + 1) : s.split(",").map((x) => Number(x.trim())).filter(Boolean));

if (args.includes("--clear-samples")) {
  const rest = programs.filter((p) => !p.sample);
  write(PROGRAMS, rest);
  console.log(`예시 공고 ${programs.length - rest.length}건을 지웠습니다.`);
  process.exit(0);
}

if (!inbox.length) {
  console.log("검수할 공고가 없습니다. 먼저 npm run collect 를 실행하세요.");
  process.exit(0);
}

if (args.includes("--list")) {
  inbox.forEach((p, i) => show(p, i + 1));
  console.log(`\n대기 ${inbox.length}건`);
  process.exit(0);
}

const approveArg = flag("--approve");
const rejectArg = flag("--reject");
if (approveArg !== null || rejectArg !== null) {
  const approve = new Set(approveArg ? pickNums(approveArg) : []);
  const reject = new Set(rejectArg ? pickNums(rejectArg) : []);
  const keep = [];
  inbox.forEach((p, i) => {
    if (approve.has(i + 1)) programs.push(clean(p));
    else if (reject.has(i + 1)) rejected.push(p.id);
    else keep.push(p);
  });
  write(PROGRAMS, programs);
  write(INBOX, keep);
  write(REJECTED, rejected);
  console.log(`승인 ${approve.size}건, 반려 ${reject.size}건. 남은 대기 ${keep.length}건.`);
  process.exit(0);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const keep = [];
let approved = 0;
for (const [i, p] of inbox.entries()) {
  show(p, `${i + 1}/${inbox.length}`);
  const a = (await rl.question("  승인(y) / 반려(n) / 나중에(Enter): ")).trim().toLowerCase();
  if (a === "y") {
    programs.push(clean(p));
    approved++;
  } else if (a === "n") {
    rejected.push(p.id);
  } else {
    keep.push(p);
  }
}
rl.close();

write(PROGRAMS, programs);
write(INBOX, keep);
write(REJECTED, rejected);
console.log(`\n승인 ${approved}건을 보드에 추가했습니다. 남은 대기 ${keep.length}건.`);
