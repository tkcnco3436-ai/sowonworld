import { SANGINWORLD_URL } from "@/lib/site";
import { ExternalLink } from "./Icons";

// 헤더 위 얇은 띠: 소원월드가 상인월드 패밀리 서비스임을 보여주고, 로고를 누르면 상인월드를 새 탭으로 엽니다.
export function FamilyBar() {
  return (
    <div className="family-bar">
      <div className="container">
        <a href={SANGINWORLD_URL} target="_blank" rel="noopener noreferrer" className="family-logo" aria-label="상인월드 (새 탭에서 열기)">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sanginworld-logo.svg" alt="상인월드" width={95} height={16} />
        </a>
        <span className="family-text">패밀리 서비스</span>
        <a href={SANGINWORLD_URL} target="_blank" rel="noopener noreferrer" className="family-go">
          상인월드 바로가기 <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
