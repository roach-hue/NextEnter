import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/LeftSidebar";
import InterviewChatPage from "./components/InterviewChatPage";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import MockInterviewResultPage from "./components/MockInterviewResultPage";
import { setNavigationBlocker } from "../../utils/navigationBlocker";

interface InterviewPageProps {
  onNavigate?: (page: string, subMenu?: string) => void;
  initialMenu?: string;
}

export default function InterviewPage({
  onNavigate,
  initialMenu,
}: InterviewPageProps) {
  const { activeMenu, handleMenuClick } = usePageNavigation(
    "interview",
    initialMenu || "interview-sub-1",
    onNavigate,
  );

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // URL에서 interviewId 읽어오기
  const interviewIdFromUrl = searchParams.get("interviewId");
  const parsedInterviewId = interviewIdFromUrl
    ? parseInt(interviewIdFromUrl)
    : null;

  const [selectedLevel, setSelectedLevel] = useState<"junior" | "senior">(
    "junior",
  );
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [currentCredit, setCurrentCredit] = useState(200);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 면접 상태에 따라 전역 방어막(Header 차단) 켜고 끄기
  useEffect(() => {
    if (isInterviewStarted) {
      setNavigationBlocker(
        true,
        "면접이 진행 중입니다. 페이지를 이동하면 진행 상황이 저장되지 않습니다. 이동하시겠습니까?",
      );
    } else {
      setNavigationBlocker(false);
    }

    // 컴포넌트가 사라질 때(언마운트) 방어막 해제 (안전장치)
    return () => setNavigationBlocker(false);
  }, [isInterviewStarted]);

  // 사이드바 클릭 시 방어 로직
  const handleSidebarMenuClick = (menuId: string) => {
    if (isInterviewStarted) {
      const confirmMove = window.confirm(
        "면접이 진행 중입니다. 페이지를 이동하면 현재 진행 상황이 저장되지 않을 수 있습니다. 이동하시겠습니까?",
      );
      if (confirmMove) {
        setIsInterviewStarted(false);
        handleMenuClick(menuId);
      }
    } else {
      handleMenuClick(menuId);
    }
  };

  const handleStartInterview = () => {
    const requiredCredit = selectedLevel === "junior" ? 10 : 20;
    if (currentCredit < requiredCredit) {
      alert("크레딧이 부족합니다!");
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmInterview = () => {
    const creditCost = selectedLevel === "junior" ? 10 : 20;
    console.log(
      `${selectedLevel} 면접 시작하기 클릭됨, 크레딧 ${creditCost} 차감`,
    );
    setCurrentCredit(currentCredit - creditCost);
    setIsInterviewStarted(true);
    setShowConfirmDialog(false);
  };

  const handleCancelInterview = () => setShowConfirmDialog(false);
  const handleLevelClick = (level: "junior" | "senior") =>
    setSelectedLevel(level);

  // 면접 완료 핸들러
  const handleInterviewComplete = (interviewId: number) => {
    console.log("🎉 면접 완료! 결과 페이지로 이동. ID:", interviewId);

    // ✅ [FIX] 면접 완료 시 모든 네비게이션 가드 즉시 해제
    setIsInterviewStarted(false);
    setNavigationBlocker(false); // 전역 블로커도 즉시 해제

    // ✅ URL 업데이트 (replace: true) 사용하여 히스토리 스택 관리 및 ID 전달
    navigate(
      `/user/interview?menu=interview-sub-3&interviewId=${interviewId}`,
      {
        replace: true,
      },
    );
  };

  // 면접 진행 중이거나 면접 채팅 페이지
  if (activeMenu === "interview-sub-2" || isInterviewStarted) {
    return (
      <InterviewChatPage
        onBack={() => {
          if (confirm("면접을 종료하시겠습니까?")) {
            setIsInterviewStarted(false);
            handleMenuClick("interview-sub-1");
          }
        }}
        level={selectedLevel}
        activeMenu={activeMenu}
        onMenuClick={handleSidebarMenuClick}
        onComplete={handleInterviewComplete}
      />
    );
  }

  // 면접 결과 페이지
  if (activeMenu === "interview-sub-3") {
    return (
      <MockInterviewResultPage
        activeMenu={activeMenu}
        onMenuClick={handleMenuClick}
        onNavigateToInterview={() => handleMenuClick("interview-sub-1")}
        initialInterviewId={parsedInterviewId}
      />
    );
  }

  // 메인 면접 시작 페이지
  return (
    <>
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
          <div className="w-full max-w-md p-8 mx-4 bg-white shadow-2xl rounded-2xl ">
            <div className="mb-6 text-center ">
              <div className="mb-4 text-5xl">💳</div>
              <h3 className="mb-4 text-2xl font-bold">
                정말 크레딧을 사용하시겠습니까?
              </h3>
              <p className="mt-2 text-gray-500">
                {selectedLevel === "junior" ? "주니어" : "시니어"} 면접에 크레딧{" "}
                {selectedLevel === "junior" ? "10" : "20"}이 차감됩니다.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelInterview}
                className="flex-1 px-6 py-3 font-semibold text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                아니요
              </button>
              <button
                onClick={handleConfirmInterview}
                className="flex-1 px-6 py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-8 mx-auto max-w-7xl bg-white">
        <div className="flex gap-6">
          <LeftSidebar
            title="모의면접"
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
          />
          <div className="flex-1">
            <div className="p-10 bg-white border-2 border-blue-400 rounded-2xl">
              <h3 className="mb-8 text-2xl font-bold">면접 설정</h3>
              <div className="grid grid-cols-2 gap-6 mb-10">
                <button
                  onClick={() => handleLevelClick("junior")}
                  className={`p-10 rounded-xl border-2 transition ${
                    selectedLevel === "junior"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                >
                  <div className="mb-3 text-2xl font-bold">주니어</div>
                  <div className="mb-2 text-base text-gray-600">0~3년 경력</div>
                  <div className="text-base text-blue-600">
                    (- 10 크레딧 차감)
                  </div>
                </button>
                <button
                  onClick={() => handleLevelClick("senior")}
                  className={`p-10 rounded-xl border-2 transition ${
                    selectedLevel === "senior"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                >
                  <div className="mb-3 text-2xl font-bold">시니어</div>
                  <div className="mb-2 text-base text-gray-600">
                    4년 이상 경력
                  </div>
                  <div className="text-base text-blue-600">
                    (- 20 크레딧 차감)
                  </div>
                </button>
              </div>
              <div className="p-12 text-center text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                <div className="mb-6">
                  <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-white/20">
                    <span className="text-5xl">💬</span>
                  </div>
                </div>
                <p className="mb-8 text-xl leading-relaxed">
                  AI 면접관과 실전 같은 면접을 경험하세요
                  <br />
                  난이도를 선택하고 시작 버튼을 눌러주세요
                </p>
                <button
                  onClick={handleStartInterview}
                  className="px-10 py-4 text-xl font-bold text-blue-600 transition bg-white rounded-full hover:bg-blue-50"
                >
                  면접 시작하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
