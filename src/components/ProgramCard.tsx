import Link from "next/link";
import { formatPeriod } from "@/lib/status";
import { kindInfo, kindOf } from "@/lib/kinds";
import type { Program, Status } from "@/lib/types";
import { KindBadge } from "./KindIcon";

export function StatusChip({ status }: { status: Status }) {
  return <span className={`chip chip-${status.kind}`}>{status.label}</span>;
}

export function ProgramCard({ program, status }: { program: Program; status: Status }) {
  const kind = kindOf(program);
  return (
    <Link href={`/board/${program.id}`} className={`pcard pcard-${kind}${status.kind === "closed" ? " closed" : ""}`}>
      <div className="row">
        <KindBadge kind={kind} label={kindInfo(kind).short} />
        <StatusChip status={status} />
        {program.categories.map((c) => (
          <span key={c} className="chip chip-tag">{c}</span>
        ))}
        {program.sample && <span className="chip chip-sample">예시</span>}
      </div>
      <h3>{program.title}</h3>
      <p className="meta">{program.agency} · {program.region}</p>
      <p className="support">{program.support}</p>
      <div className="foot">
        <span>{formatPeriod(program)}</span>
        <b>자세히 보기 →</b>
      </div>
    </Link>
  );
}
