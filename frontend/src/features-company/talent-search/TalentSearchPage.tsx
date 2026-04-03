import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CompanyLeftSidebar from "../components/CompanyLeftSidebar";
import { useCompanyPageNavigation } from "../hooks/useCompanyPageNavigation";
import {
  searchTalents,
  TalentSearchResponse,
  saveTalent,
} from "../../api/talent";
import {
  createInterviewOffer,
  getOfferedJobIds,
} from "../../api/interviewOffer";
import { getCompanyJobPostings, JobPostingListResponse } from "../../api/job";
import JobSelectionModal from "./components/JobSelectionModal";
import { useAuthStore } from "../../stores/authStore";
import { JOB_CATEGORIES } from "../../constants/jobConstants";

export default function TalentSearchPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { activeMenu, handleMenuClick } = useCompanyPageNavigation(
    "talent",
    "talent-sub-1",
  );
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("전체");
  const [selectedExperience, setSelectedExperience] = useState("전체");
  const [talents, setTalents] = useState<TalentSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [myJobs, setMyJobs] = useState<JobPostingListResponse[]>([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [pendingTalent, setPendingTalent] =
    useState<TalentSearchResponse | null>(null);
  const [offeredJobIds, setOfferedJobIds] = useState<number[]>([]);

  // ✅ 인재 목록 로드 함수 (useCallback으로 의존성 정리)
  const loadTalents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        size: 20,
      };

      if (user?.userId) {
        params.companyUserId = user.userId;
      }

      if (selectedPosition !== "전체") {
        params.jobCategory = selectedPosition;
      }

      if (searchQuery.trim()) {
        params.keyword = searchQuery.trim();
      }

      const response = await searchTalents(params);
      setTalents(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("인재 검색 오류:", error);
      setTalents([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedPosition, user?.userId]);

  // ✅ 필터/검색/페이지 변경 시 로드
  useEffect(() => {
    loadTalents();
  }, [loadTalents, selectedExperience]); 
  // selectedExperience는 프론트에서만 필터링하는 값이라 loadTalents에 포함되지 않지만,
  // "경력 필터 변경 시 즉시 반영"을 위해 유지(원하면 제거 가능)

  // ✅ 내 공고 로드
  useEffect(() => {
    const loadMyJobs = async () => {
      if (!user?.userId) return;

      try {
        const jobs = await getCompanyJobPostings(user.userId);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const availableJobs = jobs.filter((job) => {
          if (job.status === "CLOSED" || job.status === "EXPIRED") return false;

          if (job.deadline) {
            const deadline = new Date(job.deadline);
            deadline.setHours(0, 0, 0, 0);
            return deadline >= today;
          }
          return true;
        });

        setMyJobs(availableJobs);
      } catch (error) {
        console.error("공고 로드 실패:", error);
        setMyJobs([]);
      }
    };

    loadMyJobs();
  }, [user?.userId]);

  // ✅ reload 파라미터 처리 (의존성에 get("reload") 직접 넣지 않기)
  useEffect(() => {
    const reloadParam = searchParams.get("reload");
    if (reloadParam) {
      loadTalents();
    }
  }, [searchParams, loadTalents]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 프론트 단 필터링(경력)
  const filteredTalents = talents.filter((talent) => {
    if (selectedExperience === "전체") return true;

    const years = talent.experienceYears;

    if (selectedExperience === "신입" && years === 0) return true;
    if (selectedExperience === "3년 이하" && years > 0 && years <= 3) return true;
    if (selectedExperience === "3-5년" && years > 3 && years <= 5) return true;
    if (selectedExperience === "5년 이상" && years > 5) return true;

    return false;
  });

  const handleInterviewRequest = async (
    resumeId: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    if (!user?.userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const talent = talents.find((t) => t.resumeId === resumeId);
    if (!talent) {
      alert("인재 정보를 찾을 수 없습니다.");
      return;
    }

    if (myJobs.length === 0) {
      alert(
        "사용 가능한 공고가 없습니다.\n채용공고를 등록하거나 마감일이 지나지 않은 공고를 확인해주세요.",
      );
      return;
    }

    // ✅ 해당 인재에게 제안한 공고 목록 조회
    try {
      const offeredJobs = await getOfferedJobIds(user.userId, talent.userId);
      setOfferedJobIds(offeredJobs);
    } catch (error) {
      console.error("제안한 공고 조회 실패:", error);
      setOfferedJobIds([]);
    }

    setPendingTalent(talent);
    setShowJobModal(true);
  };

  const handleJobSelect = async (jobId: number) => {
    if (!user?.userId || !pendingTalent) return;

    try {
      // ✅ 기업의 요청 전송
      await createInterviewOffer(user.userId, {
        userId: pendingTalent.userId,
        jobId,
      });

      setOfferedJobIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));

      alert("면접 요청이 전송되었습니다!");

      setShowJobModal(false);
      setPendingTalent(null);

      loadTalents();
    } catch (error: any) {
      console.error("면접 요청 오류:", error);
      alert(error.response?.data?.message || "면접 요청에 실패했습니다.");
    }
  };

  const handleSave = async (talentId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user?.userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await saveTalent(talentId, user.userId);
      if (response.success) {
        alert("인재가 스크랩되었습니다!");
      } else {
        alert("이미 스크랩된 인재입니다.");
      }
    } catch (error: any) {
      console.error("인재 스크랩 오류:", error);
      alert(error.response?.data?.message || "인재 스크랩에 실패했습니다.");
    }
  };

  const handleTalentClick = (resumeId: number) => {
    navigate(`/company/talent-search/${resumeId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex px-4 py-8 mx-auto max-w-7xl">
        <CompanyLeftSidebar
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
        />

        <div className="flex-1 pl-6 min-h-[800px]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">인재 검색</h1>
            <p className="mt-2 text-gray-600">최적의 인재를 찾아보세요</p>
          </div>

          {/* 필터 섹션 */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                포지션
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => {
                  setSelectedPosition(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="전체">전체</option>
                {JOB_CATEGORIES.map((job) => (
                  <option key={job} value={job}>
                    {job}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                경력
              </label>
              <select
                value={selectedExperience}
                onChange={(e) => {
                  setSelectedExperience(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="전체">전체</option>
                <option value="신입">신입</option>
                <option value="3년 이하">3년 이하</option>
                <option value="3-5년">3-5년</option>
                <option value="5년 이상">5년 이상</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                검색
              </label>
              <input
                type="text"
                placeholder="기술 스택으로 검색"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* 검색 버튼 */}
          <div className="flex justify-end mb-8">
            <button
              onClick={handleSearch}
              className="px-8 py-2 text-white transition bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              검색
            </button>
          </div>

          {/* 인재 목록 */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : filteredTalents.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="mb-2 text-lg">검색 결과가 없습니다.</p>
              <p className="text-sm">다른 조건으로 검색해보세요.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                총{" "}
                <span className="font-semibold text-purple-600">
                  {filteredTalents.length}
                </span>
                명의 인재를 찾았습니다.
              </div>

              <div className="space-y-4">
                {filteredTalents.map((talent) => (
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
                          ) : null}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">경력:</span>
                            <span className="ml-2 font-medium">
                              {talent.experienceYears === 0
                                ? "신입"
                                : `${talent.experienceYears}년`}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">지역:</span>
                            <span className="ml-2 font-medium">
                              {talent.location || "미지정"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">희망연봉:</span>
                            <span className="ml-2 font-medium">
                              {talent.salaryRange || "협의"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {talent.skills && talent.skills.length > 0 ? (
                            talent.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 text-sm text-purple-700 rounded-full bg-purple-50"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">
                              기술 스택 정보 없음
                            </span>
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
                          {!talent.contactStatus || talent.contactStatus === "" ? (
                            <button
                              onClick={(e) =>
                                handleInterviewRequest(talent.resumeId, e)
                              }
                              className="px-4 py-2 text-white transition bg-purple-600 rounded-lg hover:bg-purple-700"
                            >
                              면접 요청
                            </button>
                          ) : talent.contactStatus === "ACCEPTED" ? (
                            <button
                              disabled
                              className="px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                            >
                              수락됨
                            </button>
                          ) : talent.contactStatus === "PENDING" ? (
                            <button
                              disabled
                              className="px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                            >
                              대기중
                            </button>
                          ) : talent.contactStatus === "REJECTED" ? (
                            <button
                              disabled
                              className="px-4 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                            >
                              거절됨
                            </button>
                          ) : null}

                          <button
                            onClick={(e) => handleSave(talent.resumeId, e)}
                            className="px-4 py-2 text-purple-700 transition rounded-lg bg-purple-50 hover:bg-purple-100"
                          >
                            스크랩
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                    }
                    disabled={currentPage === totalPages - 1}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 공고 선택 모달 */}
      <JobSelectionModal
        isOpen={showJobModal}
        onClose={() => {
          setShowJobModal(false);
          setPendingTalent(null);
        }}
        jobs={myJobs.map((job) => ({
          jobId: job.jobId,
          title: job.title,
          jobCategory: job.jobCategory,
          deadline: job.deadline,
          status: job.status,
        }))}
        onSelectJob={handleJobSelect}
        talentName={pendingTalent?.name || ""}
        offeredJobIds={offeredJobIds}
      />
    </div>
  );
}
