import Link from "next/link";
import { formatPeriod } from "@/lib/status";
import type { Program, Status } from "@/lib/types";

export function StatusChip({ status }: { status: Status }) {
  return <span className={`chip chip-${status.kind}`}>{status.label}</span>;
}

export function ProgramCard({ program, status }: { program: Program; status: Status }) {
  return (
    <Link href={`/board/${program.id}`} className={`pcard${status.kind === "closed" ? " closed" : ""}`}>
      <div className="row">
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
