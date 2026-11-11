"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/board", label: "실시간 공고" },
  { href: "/guide", label: "신청 가이드" },
  { href: "/docs", label: "서류 발급처" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="nav" aria-label="주요 메뉴">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
