import { useEffect } from "react";
import MockInterviewResultPage from "./components/MockInterviewResultPage";
import { usePageNavigation } from "../../hooks/usePageNavigation";

interface InterviewResultPageProps {
  onNavigateToInterview?: () => void;
}

export default function InterviewResultPage({
  onNavigateToInterview,
}: InterviewResultPageProps) {
  // "interview" 카테고리의 "interview-sub-3"(면접 결과) 메뉴로 설정
  const { activeMenu, handleMenuClick } = usePageNavigation(
    "interview",
    "interview-sub-3"
  );

  // 페이지 진입 시 스크롤을 상단으로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <MockInterviewResultPage
      onNavigateToInterview={onNavigateToInterview}
      activeMenu={activeMenu}
      onMenuClick={handleMenuClick}
    />
  );
}
