import type { Kind } from "@/lib/kinds";
import { Banknote, GraduationCap, LayoutGrid } from "./Icons";

export function KindIcon({ kind, size = 22 }: { kind: Kind; size?: number }) {
  if (kind === "grant") return <Banknote size={size} />;
  if (kind === "capacity") return <GraduationCap size={size} />;
  return <LayoutGrid size={size} />;
}

export function KindBadge({ kind, label }: { kind: Kind; label: string }) {
  return (
    <span className={`chip kind-${kind}`}>
      <KindIcon kind={kind} size={13} />
      {label}
    </span>
  );
}
