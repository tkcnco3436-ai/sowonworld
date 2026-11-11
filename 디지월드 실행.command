#!/bin/bash
# 디지월드 — 실행 메뉴 (Finder에서 더블클릭하면 터미널에서 열립니다)

cd "$(dirname "$0")" || exit 1
ENV_FILE=".env.local"

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js가 설치되어 있지 않습니다. https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행하세요."
  read -r -p "Enter를 누르면 닫힙니다."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "처음 실행이라 필요한 패키지를 설치합니다. (1~2분)"
  npm install || { read -r -p "설치에 실패했습니다. Enter를 누르면 닫힙니다."; exit 1; }
fi

key_status() {
  if [ -f "$ENV_FILE" ] && grep -q '^BIZINFO_API_KEY=.\+' "$ENV_FILE"; then
    echo "등록됨"
  else
    echo "없음"
  fi
}

set_key() {
  echo
  echo "기업마당에서 발급받은 인증키를 붙여 넣고 Enter를 누르세요."
  echo "(입력한 글자는 화면에 보이지 않습니다. 취소하려면 그냥 Enter)"
  read -r -s -p "인증키: " KEY
  echo
  KEY="$(echo "$KEY" | tr -d '[:space:]')"
  if [ -z "$KEY" ]; then
    echo "취소했습니다."
    return
  fi
  printf '# 기업마당 지원사업정보 API 인증키\nBIZINFO_API_KEY=%s\n' "$KEY" > "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "인증키를 저장했습니다. 이제 2번(공고 수집)을 실행하세요."
}

pause() {
  echo
  read -r -p "Enter를 누르면 메뉴로 돌아갑니다."
}

while true; do
  clear
  echo "=========================================="
  echo "   디지월드 — 실행 메뉴"
  echo "=========================================="
  echo "   인증키: $(key_status)"
  echo
  echo "   1) 인증키 등록·변경"
  echo "   2) 새 공고 수집 (기업마당)"
  echo "   3) 검수 대기 목록 보기"
  echo "   4) 하나씩 검수하기 (승인 y / 반려 n)"
  echo "   5) 예시 공고 지우기"
  echo "   6) 사이트 열기 (http://localhost:3000)"
  echo "   0) 종료"
  echo
  read -r -p "번호를 고르세요: " CHOICE
  case "$CHOICE" in
    1) set_key; pause ;;
    2) echo; npm run --silent collect; pause ;;
    3) npm run --silent review -- --list; pause ;;
    4) npm run --silent review; pause ;;
    5)
      read -r -p "예시 공고를 모두 지울까요? (y/N): " YN
      if [ "$YN" = "y" ] || [ "$YN" = "Y" ]; then npm run --silent review -- --clear-samples; else echo "취소했습니다."; fi
      pause ;;
    6)
      echo
      echo "사이트를 켭니다. 브라우저가 열리지 않으면 http://localhost:3000 으로 접속하세요."
      echo "끄려면 이 창에서 Control + C 를 누르세요."
      (sleep 5 && open "http://localhost:3000") &
      npm run dev
      pause ;;
    0) exit 0 ;;
    *) echo "0~6 중에서 골라 주세요."; sleep 1 ;;
  esac
done
