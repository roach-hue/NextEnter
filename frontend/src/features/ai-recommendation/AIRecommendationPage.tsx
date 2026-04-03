import { useState } from "react";
import LeftSidebar from "../../components/LeftSidebar";
import { usePageNavigation } from "../../hooks/usePageNavigation";

interface AIRecommendationPageProps {
  initialMenu?: string;
  onNavigate?: (page: string, subMenu?: string) => void;
}

export default function AIRecommendationPage({
  initialMenu,
  onNavigate,
}: AIRecommendationPageProps) {
  // ✅ 커스텀 훅 사용으로 변경
  const { activeMenu, handleMenuClick } = usePageNavigation(
    "ai-recommend",
    initialMenu,
    onNavigate
  );

  const [selectedResume, setSelectedResume] = useState("");
  const [currentCredit, setCurrentCredit] = useState(200);
  const [hasRecommendations, setHasRecommendations] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 샘플 이력서 목록
  const resumes = [
    { id: "1", name: "김유연_2025 개발자 이력서" },
    { id: "2", name: "김유연_프론트엔드 포지션" },
    { id: "3", name: "김유연_풀스택 개발자" },
    { id: "4", name: "김유연_신입 개발자 이력서" },
  ];

  const handleCreditClick = () => {
    console.log("보유 크레딧 클릭됨");
  };

  const handleAIRecommend = () => {
    console.log("AI 추천 버튼 클릭, selectedResume:", selectedResume);
    if (!selectedResume) {
      alert("이력서를 먼저 선택해주세요!");
      return;
    }
    if (currentCredit < 50) {
      alert("크레딧이 부족합니다!");
      return;
    }
    console.log("확인 다이얼로그 표시");
    // 확인 다이얼로그 표시
    setShowConfirmDialog(true);
  };

  const handleConfirmAnalysis = () => {
    console.log("AI 추천 받기 클릭됨");
    setCurrentCredit(currentCredit - 50);
    setHasRecommendations(true);
    setShowConfirmDialog(false);
    // 실제로는 API 호출
  };

  const handleCancelAnalysis = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      {/* 확인 다이얼로그 */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 mx-4 bg-white shadow-2xl rounded-2xl">
            <div className="mb-6 text-center">
              <div className="mb-4 text-5xl">💳</div>
              <h3 className="mb-4 text-2xl font-bold">
                정말 크레딧을 사용하시겠습니까?
              </h3>
              <p className="mt-2 text-gray-500">
                AI 매칭 분석에 크레딧 50이 차감됩니다.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelAnalysis}
                className="flex-1 px-6 py-3 font-semibold text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleConfirmAnalysis}
                className="flex-1 px-6 py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-8 mx-auto max-w-7xl bg-white">
        <div className="flex gap-6">
          {/* 왼쪽 사이드바 */}
          <LeftSidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />

          {/* 메인 컨텐츠 */}
          <div className="flex-1">
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-red-400">
                  🎯
                </div>
                <h1 className="text-2xl font-bold">AI 추천 공고</h1>
              </div>
              <button
                onClick={handleCreditClick}
                className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition bg-blue-600 rounded-full hover:bg-blue-700"
              >
                <span>💳</span>
                <span>보유 크레딧 : {currentCredit}</span>
              </button>
            </div>

            {/* AI 추천 카드 */}
            <div className="p-8 mb-6 bg-white border-2 border-blue-400 rounded-2xl">
              <h2 className="mb-6 text-xl font-bold">이력서 선택</h2>

              <div className="flex items-end gap-4 mb-6">
                {/* 이력서 드롭다운 */}
                <div className="flex-1">
                  <select
                    value={selectedResume}
                    onChange={(e) => setSelectedResume(e.target.value)}
                    className="w-full p-4 text-gray-700 bg-white border-2 border-gray-300 outline-none cursor-pointer rounded-xl"
                  >
                    <option value="">이력서를 선택하세요</option>
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AI 추천 받기 버튼 */}
                <button
                  onClick={handleAIRecommend}
                  className="flex items-center gap-2 px-8 py-4 font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700 whitespace-nowrap"
                >
                  <span>⭐</span>
                  <span>AI 추천 받기</span>
                  <span className="text-sm">(크레딧 50)</span>
                </button>
              </div>

              {/* 안내 메시지 */}
              <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-2 text-purple-700">
                  <span>💡</span>
                  <span className="font-medium">
                    선택하신 이력서를 기반으로 AI가 가장 적합한 공고 5개를
                    추천드립니다
                  </span>
                </div>
              </div>
            </div>

            {/* 추천 결과 영역 */}
            {!hasRecommendations ? (
              <div className="p-16 text-center bg-white border-2 border-gray-200 rounded-2xl">
                <div className="mb-4 text-6xl">📋</div>
                <h3 className="mb-2 text-2xl font-bold text-gray-400">
                  추천 공고가 없습니다
                </h3>
                <p className="text-gray-500">
                  이력서를 선택하고 AI 추천 받기를 활용해 보세요
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="mb-4 text-xl font-bold">AI 추천 공고 (5개)</h2>

                {/* 샘플 추천 공고 카드들 */}
                {[1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className="p-6 transition bg-white border-2 border-gray-200 cursor-pointer rounded-xl hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-16 h-16 text-2xl bg-blue-100 rounded-lg">
                        🏢
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full">
                            매칭률 {95 - index * 2}%
                          </span>
                          <span className="text-sm text-gray-500">
                            추천 {index}순위
                          </span>
                        </div>
                        <h3 className="mb-2 text-lg font-bold">
                          {index === 1 &&
                            "프론트엔드 개발자 (React/TypeScript)"}
                          {index === 2 && "풀스택 개발자 (Next.js)"}
                          {index === 3 && "React 개발자 (시니어급)"}
                          {index === 4 && "UI/UX 엔지니어"}
                          {index === 5 && "JavaScript 개발자"}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>📍 서울 강남구</span>
                          <span>💰 연봉 4,000~6,000만원</span>
                          <span>👥 경력 3~5년</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
