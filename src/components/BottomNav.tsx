"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileCheck, Home, Megaphone, Sparkles } from "./Icons";

const TABS = [
  { href: "/", label: "홈", Icon: Home },
  { href: "/board", label: "공고", Icon: Megaphone },
  { href: "/guide", label: "가이드", Icon: BookOpen },
  { href: "/docs", label: "서류", Icon: FileCheck },
  { href: "/portfolio", label: "포트폴리오", Icon: Sparkles },
];

// 휴대폰에서만 보이는 하단 탭 메뉴 (엄지로 누르기 쉬운 위치)
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      {TABS.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
