// src/features-company/navigation-menu/data/companyMenuData.ts

export const companyNavigationMenuData = {
  jobs: {
    id: "jobs",
    title: "채용 관리",
    items: [
      { id: "jobs-sub-1", label: "전체 공고 목록" },
      { id: "jobs-sub-2", label: "내 공고 관리" },
    ],
  },
  applicants: {
    id: "applicants",
    title: "지원자 관리",
    items: [
      { id: "applicants-sub-1", label: "지원자 목록" },
      // { id: "applicants-sub-2", label: "적합도 분석" },
    ],
  },
  talent: {
    id: "talent",
    title: "인재 검색",
    items: [
      { id: "talent-sub-1", label: "인재 검색" },
      { id: "talent-sub-2", label: "스크랩 인재" },
    ],
  },
  companyMy: {
    id: "companyMy",
    title: "마이페이지",
    items: [
      { id: "companyMy-sub-1", label: "나의 회사 정보" },
      { id: "companyMy-sub-2", label: "계정 및 보안" },
      { id: "companyMy-sub-3", label: "결제 및 크레딧" },
      { id: "companyMy-sub-4", label: "알림 설정" },
    ],
  },
  credit: {
    id: "credit",
    title: "크레딧",
    items: [
      { id: "credit-sub-1", label: "크레딧 관리" },
      { id: "credit-sub-2", label: "크레딧 충전" },
    ],
  },
};
