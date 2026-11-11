import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 공고 데이터(data/programs.json)를 서버에서 읽으므로 배포 결과물에 함께 포함시킵니다.
  outputFileTracingIncludes: {
    "/**": ["./data/programs.json"],
  },
};

export default nextConfig;
