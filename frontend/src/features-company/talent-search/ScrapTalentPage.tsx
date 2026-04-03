import { useState, useEffect } from "react";
import CompanyLeftSidebar from "../components/CompanyLeftSidebar";
import { useCompanyPageNavigation } from "../hooks/useCompanyPageNavigation";
import { getSavedTalents, unsaveTalent, contactTalent, TalentSearchResponse } from "../../api/talent";
import TalentResumeDetailPage from "./TalentResumeDetailPage";
import { useAuthStore } from "../../stores/authStore";
import { useSearchParams } from "react-router-dom";

export default function ScrapTalentPage() {
  const { user } = useAuthStore();
  const { activeMenu, handleMenuClick } = useCompanyPageNavigation("talent", "talent-sub-2");
  const [searchParams] = useSearchParams(); // ✅ URL 파라미터 감지

  const [talents, setTalents] = useState<TalentSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ 상세보기 상태 추가
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);

  // 스크랩한 인재 데이터 로드
  useEffect(() => {
    if (user?.userId) {
      loadScrapedTalents();
    }
  }, [user?.userId]);

  // ✅ URL reload 파라미터 변경 감지 - 같은 메뉴 클릭 시 새로고침
  useEffect(() => {
    const reloadParam = searchParams.get("reload");
    if (reloadParam && user?.userId) {
      loadScrapedTalents();
    }
  }, [searchParams.get("reload"), user?.userId]);

  const loadScrapedTalents = async () => {
    if (!user?.userId) return;
    
    setIsLoading(true);
    try {
      const response = await getSavedTalents(user.userId);
      setTalents(response.content);
    } catch (error) {
      console.error("스크랩 인재 조회 오류:", error);
      setTalents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = async (talentId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // ✅ 카드 클릭 이벤트 방지
    
    if (!user?.userId) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    const message = prompt("인재에게 보낼 메시지를 입력하세요:");
    if (!message) return;
    
    try {
      const response = await contactTalent(talentId, message, user.userId);
      if (response.success) {
        alert("연락 요청이 전송되었습니다!");
      }
    } catch (error: any) {
      console.error("연락 요청 오류:", error);
      alert(error.response?.data?.message || "연락 요청에 실패했습니다.");
    }
  };

  const handleUnsave = async (talentId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // ✅ 카드 클릭 이벤트 방지
    
    if (!user?.userId) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    if (!confirm("이 인재를 스크랩에서 삭제하시겠습니까?")) {
      return;
    }
    
    try {
      const response = await unsaveTalent(talentId, user.userId);
      if (response.success) {
        alert("스크랩이 취소되었습니다.");
        loadScrapedTalents(); // 목록 새로고침
      }
    } catch (error: any) {
      console.error("스크랩 취소 오류:", error);
      alert(error.response?.data?.message || "스크랩 취소에 실패했습니다.");
    }
  };
  
  // ✅ 인재 클릭 시 상세보기
  const handleTalentClick = (resumeId: number) => {
    setSelectedResumeId(resumeId);
  };
  
  // ✅ 상세보기에서 돌아오기
  const handleBackToList = () => {
    setSelectedResumeId(null);
    loadScrapedTalents(); // 목록 새로고침
  };
  
  // ✅ 상세보기 페이지 표시
  if (selectedResumeId) {
    return <TalentResumeDetailPage resumeId={selectedResumeId} onBack={handleBackToList} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex px-4 py-8 mx-auto max-w-7xl">
        {/* 왼쪽 사이드바 */}
        <CompanyLeftSidebar
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
        />

        {/* 메인 컨텐츠 */}
        <div className="flex-1 pl-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">스크랩 인재</h1>
            <p className="mt-2 text-gray-600">스크랩한 인재 목록을 확인하세요</p>
          </div>

          {/* 인재 목록 */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : talents.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="mb-2 text-lg">스크랩한 인재가 없습니다.</p>
              <p className="text-sm">인재 검색에서 마음에 드는 인재를 스크랩해보세요.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                총 <span className="font-semibold text-purple-600">{talents.length}</span>명의 인재를 스크랩했습니다.
              </div>
              <div className="space-y-4">
                {talents.map((talent) => (
                  <div
                    key={talent.resumeId}
                    onClick={() => handleTalentClick(talent.resumeId)}
                    className="p-6 transition bg-white border border-gray-200 cursor-pointer rounded-xl hover:shadow-lg hover:border-purple-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold">{talent.name}</h3>
                          <span className="px-3 py-1 text-sm font-medium text-purple-600 bg-purple-100 rounded">
                            {talent.jobCategory}
                          </span>
                          {talent.contactStatus === "ACCEPTED" ? (
                            <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded">
                              면접 요청이 수락되었습니다
                            </span>
                          ) : talent.contactStatus === "PENDING" ? (
                            <span className="px-3 py-1 text-sm font-medium text-yellow-600 bg-yellow-100 rounded">
                              연락 대기중
                            </span>
                          ) : talent.contactStatus === "REJECTED" ? (
                            <span className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded">
                              연락 거절됨
                            </span>
                          ) : null}

                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">경력:</span>
                            <span className="ml-2 font-medium">
                              {talent.experienceYears === 0 ? '신입' : `${talent.experienceYears}년`}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">지역:</span>
                            <span className="ml-2 font-medium">
                              {talent.location || '미지정'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">희망연봉:</span>
                            <span className="ml-2 font-medium">{talent.salaryRange || '협의'}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {talent.skills && talent.skills.length > 0 ? (
                            talent.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 text-sm text-purple-700 bg-purple-50 rounded-full"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">기술 스택 정보 없음</span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>조회수: {talent.viewCount}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-4 ml-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {Math.round(talent.matchScore)}
                          </div>
                          <div className="text-sm text-gray-500">매칭 점수</div>
                        </div>

                        <div className="flex flex-col w-32 gap-2">
                          {/* ✅ 연락 상태에 따라 버튼 표시/비활성화 */}
                          {!talent.contactStatus || talent.contactStatus === "" ? (
                            // 연락하지 않은 경우 - 연락하기 버튼 표시
                            <button
                              onClick={(e) => handleContact(talent.resumeId, e)}
                              className="px-4 py-2 text-white transition bg-purple-600 rounded-lg hover:bg-purple-700"
                            >
                              연락하기
                            </button>
                          ) : talent.contactStatus === "ACCEPTED" ? (
                            // 수락된 경우 - 비활성화된 버튼
                            <button
                              disabled
                              className="px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                            >
                              수락됨
                            </button>
                          ) : talent.contactStatus === "PENDING" ? (
                            // 대기중인 경우 - 비활성화된 버튼
                            <button
                              disabled
                              className="px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                            >
                              대기중
                            </button>
                          ) : talent.contactStatus === "REJECTED" ? (
                            // 거절된 경우 - 비활성화된 버튼
                            <button
                              disabled
                              className="px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                            >
                              거절됨
                            </button>
                          ) : null}
                          <button
                            onClick={(e) => handleUnsave(talent.resumeId, e)}
                            className="px-4 py-2 text-red-600 transition bg-red-50 rounded-lg hover:bg-red-100"
                          >
                            스크랩 취소
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
