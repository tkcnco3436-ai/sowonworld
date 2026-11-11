import fs from "node:fs";
import path from "node:path";
import type { Program } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "programs.json");

// 승인된 공고만 들어 있는 파일. 수집 결과는 data/inbox.json에 쌓이고 `npm run review`로 옮겨집니다.
export function getPrograms(): Program[] {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(raw) as Program[];
}

export function getProgram(id: string): Program | undefined {
  return getPrograms().find((p) => p.id === id);
}
