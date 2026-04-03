import { useState, useEffect } from "react";
import LeftSidebar from "../../../components/LeftSidebar";
import MockInterviewHistoryPage from "./MockInterviewHistoryPage";
import { useAuthStore } from "../../../stores/authStore";
import {
  interviewService,
  InterviewHistoryDTO,
} from "../../../api/interviewService";

interface MockInterviewHistoryListPageProps {
  activeMenu: string;
  onMenuClick: (menuId: string) => void;
  onBackToInterview: () => void;
}

export default function MockInterviewHistoryListPage({
  activeMenu,
  onMenuClick,
  onBackToInterview,
}: MockInterviewHistoryListPageProps) {
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
    null,
  );

  // API로 데이터 가져오기 상태
  const [historyList, setHistoryList] = useState<InterviewHistoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Context에서 user 정보 가져오기 (userId 필요)
  const { user } = useAuthStore(); // ✅ useAuthStore 사용 (Lint fix: ID d45faedd-4ff7-409f-9848-ce8dd75fa7ab)

  // 페이지 진입 시 스크롤을 상단으로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userIdNum =
          typeof user?.userId === "string"
            ? parseInt(user.userId)
            : user?.userId || 1; // Default to 1 if missing for testing
        const data = await interviewService.getInterviewHistory(userIdNum);
        setHistoryList(data);
      } catch (error) {
        console.error("Failed to fetch interview history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-300";
    if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-300";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-300";
    return "text-red-600 bg-red-50 border-red-300";
  };

  const handleViewHistory = (id: number) => {
    setSelectedHistoryId(id);
  };

  const handleBackToList = () => {
    setSelectedHistoryId(null);
  };

  // 날짜/시간 포맷팅
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString();
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 히스토리 상세 페이지 표시
  if (selectedHistoryId !== null) {
    return (
      <MockInterviewHistoryPage
        interviewId={selectedHistoryId}
        onBack={handleBackToList}
        activeMenu={activeMenu}
        onMenuClick={onMenuClick}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div className="flex items-start gap-6">
            <LeftSidebar
              title="면접 히스토리"
              activeMenu={activeMenu}
              onMenuClick={onMenuClick}
            />

            {/* 메인 컨텐츠 */}
            <div className="flex-1 space-y-6">
              {loading ? (
                <div className="text-center p-16">로딩 중...</div>
              ) : historyList.length === 0 ? (
                /* 히스토리가 없을 때 */
                <div className="p-16 text-center bg-white border-2 border-gray-200 rounded-2xl">
                  <div className="mb-4 text-6xl">📋</div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-400">
                    면접 히스토리가 없습니다
                  </h3>
                  <p className="mb-6 text-gray-500">
                    AI 모의 면접을 시작하여 히스토리를 만들어보세요
                  </p>
                  <button
                    onClick={onBackToInterview}
                    className="px-8 py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    AI 모의 면접 시작하기
                  </button>
                </div>
              ) : (
                <>
                  {/* 히스토리 목록 - 스크롤 가능 */}
                  <div className="p-6 bg-white border-2 border-blue-400 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <h3 className="text-xl font-bold">
                          면접 히스토리 목록
                        </h3>
                        <span className="text-sm text-gray-600">
                          총 {historyList.length}개의 면접 히스토리
                        </span>
                      </div>
                      {/* 전체 삭제 버튼 제거 (Backend API 미지원) */}
                    </div>

                    {/* 스크롤 가능한 컨테이너 */}
                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                      {historyList.map((history) => (
                        <div
                          key={history.interviewId}
                          className="p-5 transition border-2 border-gray-200 cursor-pointer rounded-xl hover:border-blue-400 hover:bg-blue-50"
                          onClick={() => handleViewHistory(history.interviewId)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span
                                  className={`px-4 py-1.5 text-base font-bold rounded-lg ${
                                    history.difficulty === "JUNIOR"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-purple-100 text-purple-700"
                                  }`}
                                >
                                  {history.difficulty === "JUNIOR"
                                    ? "주니어"
                                    : "시니어"}
                                </span>
                                <span
                                  className={`px-3 py-1 text-sm font-semibold border-2 rounded-full ${getScoreColor(
                                    history.finalScore,
                                  )}`}
                                >
                                  {history.finalScore}점
                                </span>
                                <span
                                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                    history.status === "COMPLETED"
                                      ? history.finalScore >= 70
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {history.status === "COMPLETED"
                                    ? history.finalScore >= 70
                                      ? "합격"
                                      : "불합격"
                                    : "진행중"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">✓</span>
                                <span className="text-base font-semibold text-gray-900">
                                  {history.currentTurn}개의 질문-답변
                                </span>
                              </div>

                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <span>📅</span>
                                  <span>{formatDate(history.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>🕐</span>
                                  <span>{formatTime(history.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewHistory(history.interviewId);
                              }}
                              className="flex items-center gap-2 px-4 py-2 ml-4 text-blue-600 transition rounded-lg hover:bg-blue-100"
                            >
                              상세보기
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
