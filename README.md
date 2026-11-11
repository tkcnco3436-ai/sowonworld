# 디지월드 (디자인 지원사업 정보 월드) — 1단계 MVP

소상공인 디자인 지원사업 공고를 모아 보여주는 웹사이트입니다. 설계안의 1단계 범위(기초 가이드, 실시간 보드, 서류 발급처)를 담았습니다.

## 실행

macOS에서는 `디지월드 실행.command`를 더블클릭하면 메뉴(인증키 등록, 공고 수집, 검수, 사이트 열기)가 뜹니다. 터미널로 직접 실행하려면:

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## 페이지

| 경로 | 내용 |
|---|---|
| `/` | 검색, 메뉴 타일, 마감 임박 공고 |
| `/board` | 공고 목록 (분야·지역·상태 필터, 마감 임박순) |
| `/board/[id]` | 공고 상세, 준비 서류 체크리스트, 원문 링크 |
| `/guide` | 신청 5단계 가이드, 소상공인 자가진단, 용어 사전 |
| `/docs` | 서류 발급처 링크 모음 |

## 공고 업데이트 흐름 (사람 검수 포함)

1. 기업마당(bizinfo.go.kr)에서 지원사업정보 API 인증키를 발급받습니다.
2. `.env.local.example`을 `.env.local`로 복사하고 `BIZINFO_API_KEY=` 뒤에 키를 붙여 넣습니다. (`.env.local`은 git에 올라가지 않습니다)
3. 새 공고 수집 → 디자인 관련 공고만 `data/inbox.json`(검수 대기)에 쌓입니다.
   ```bash
   npm run collect
   ```
4. 대기 공고를 확인하고 승인하면 `data/programs.json`으로 옮겨집니다.
   ```bash
   npm run review                      # 하나씩 승인/반려
   npm run review -- --list            # 목록만 보기
   npm run review -- --approve 1,3     # 번호로 승인 (all = 전부)
   npm run review -- --reject 2        # 번호로 반려
   npm run review -- --clear-samples   # 예시 공고 지우기
   ```
4. 변경된 `data/programs.json`을 배포하면 보드에 반영됩니다. 페이지는 1시간마다 마감 상태를 다시 계산합니다.

인증키 발급 후 첫 수집 때 API 응답 필드명이 `scripts/collect-bizinfo.mjs`의 `normalize()`와 맞는지 한 번 확인하세요.

## 지금 들어 있는 데이터

`data/programs.json`의 공고 8건은 화면 확인용 **예시**(`"sample": true`)입니다. 화면에 '예시' 배지와 안내가 표시됩니다. 실제 공고를 승인해 넣은 뒤 예시 항목을 지우면 안내도 사라집니다.

## 배포 전 확인할 것

- 서류 발급처 링크(`src/lib/documents.ts`)와 소상공인 기준(`src/components/SelfCheck.tsx`)
- 푸터·상세 페이지의 `[이메일 주소]`, `[전화번호]` 자리
- 서비스 도메인

## 다음 단계

- 2단계: 기관 30~50곳 수집기, 검수 관리자 화면, 키워드 알림. 이때 데이터 저장소를 JSON 파일에서 Supabase(Postgres)로 옮깁니다.
- 3단계: 포트폴리오 제작소 + 결제
- 4단계: AI 챗봇
