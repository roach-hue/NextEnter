// src/features/navigation-menu/data/menuData.ts

export const navigationMenuData = {
  job: {
    id: "job",
    title: "채용정보",
    items: [
      { id: "job-sub-1", label: "전체 공고" },
      { id: "job-sub-2", label: "AI 추천 공고" },
    ],
  },
  resume: {
    id: "resume",
    title: "이력서",
    items: [
      { id: "resume-sub-1", label: "이력서 관리" },
      { id: "resume-sub-2", label: "자소서 관리" },
    ],
  },
  matching: {
    id: "matching",
    title: "매칭분석",
    items: [
      { id: "matching-sub-1", label: "AI 매칭 분석" },
      { id: "matching-sub-2", label: "매칭 히스토리" },
    ],
  },
  interview: {
    id: "interview",
    title: "모의면접",
    items: [
      { id: "interview-sub-1", label: "모의면접 시작" },
      { id: "interview-sub-3", label: "면접 결과" },
    ],
  },
  // ❌ [삭제] offer 카테고리 전체 삭제

  mypage: {
    id: "mypage",
    title: "마이페이지",
    items: [
      { id: "mypage-sub-1", label: "마이페이지" },
      { id: "mypage-sub-2", label: "내 정보" },
      { id: "mypage-sub-3", label: "지원 현황" },
      // ✅ [추가] 기업의 요청을 4번째로 이동
      { id: "mypage-sub-4", label: "기업의 요청" },
      // ✅ [변경] 스크랩 현황을 5번째로 밀어냄 (ID도 sub-5로 변경)
      { id: "mypage-sub-5", label: "스크랩 현황" },
    ],
  },
  credit: {
    id: "credit",
    title: "크레딧",
    items: [
      { id: "credit-sub-1", label: "내 크레딧" },
      { id: "credit-sub-2", label: "크레딧 충전" },
    ],
  },
};
