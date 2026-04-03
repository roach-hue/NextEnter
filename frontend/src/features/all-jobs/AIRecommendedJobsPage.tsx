import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import { useAuthStore } from "../../stores/authStore";
import { useCreditStore } from "../../stores/creditStore";
import { getCreditBalance, deductCredit } from "../../api/credit";
import { getResumeList } from "../../api/resume";
import { getJobPostings, type JobPostingResponse } from "../../api/job";
import LeftSidebar from "../../components/LeftSidebar";

interface AIRecommendedJobsPageProps {
  onLogoClick?: () => void;
  onNavigateToAll?: () => void;
  onNavigateToPosition?: () => void;
  onNavigateToLocation?: () => void;
}

// ✅ 랜덤으로 5개 공고 선택하는 함수
const getRandomJobs = (jobs: JobPostingResponse[], count: number = 5) => {
  const shuffled = [...jobs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, jobs.length));
};

// ✅ 랜덤 매칭률 생성 (70~99%)
const getRandomMatchRate = () => {
  return Math.floor(Math.random() * 30) + 70;
};

export default function AIRecommendedJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { creditBalance, setCreditBalance } = useCreditStore();
  
  const { activeMenu, handleMenuClick } = usePageNavigation("job", "job-sub-2");

  const [hasAccess, setHasAccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<JobPostingResponse[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<(JobPostingResponse & { matchRate: number })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const CREDIT_COST = 10;

  // 크레딧 잔액 조회
  useEffect(() => {
    const fetchCreditBalance = async () => {
      if (user?.userId) {
        try {
          const balance = await getCreditBalance(user.userId);
          setCreditBalance(balance.balance);
          localStorage.setItem("nextenter_credit_balance", balance.balance.toString());
        } catch (error: any) {
          if (error.response?.status !== 401) {
            const savedBalance = localStorage.getItem("nextenter_credit_balance");
            if (savedBalance) {
              setCreditBalance(parseInt(savedBalance));
            }
          }
        }
      }
    };
    fetchCreditBalance();
  }, [user?.userId, setCreditBalance]);

  // 이력서 목록 로드
  useEffect(() => {
    const loadResumes = async () => {
      if (user?.userId) {
        try {
          const data = await getResumeList(user.userId);
          if (Array.isArray(data)) {
            const resumeList = data.map((resume) => ({
              id: resume.resumeId,
              title: resume.title,
            }));
            setResumes(resumeList);
          }
        } catch (error) {
          console.error("이력서 로드 오류:", error);
        }
      }
    };
    loadResumes();
  }, [user?.userId]);

  // 전체 공고 목록 로드
  useEffect(() => {
    const loadAllJobs = async () => {
      try {
        const response = await getJobPostings({ size: 100 });
        if (response.content && response.content.length > 0) {
          setAllJobs(response.content);
        }
      } catch (error) {
        console.error("공고 로드 오류:", error);
      }
    };
    loadAllJobs();
  }, []);

  const handleAccessRequest = () => {
    if (creditBalance < CREDIT_COST) {
      alert(`크레딧이 부족합니다! (필요: ${CREDIT_COST}, 보유: ${creditBalance})`);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmAccess = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);

    try {
      // 랜덤으로 5개 공고 선택
      const randomJobs = getRandomJobs(allJobs, 5);
      
      // 각 공고에 랜덤 매칭률 추가
      const jobsWithMatchRate = randomJobs.map((job) => ({
        ...job,
        matchRate: getRandomMatchRate(),
      }));

      // 매칭률 높은 순으로 정렬
      jobsWithMatchRate.sort((a, b) => b.matchRate - a.matchRate);

      setRecommendedJobs(jobsWithMatchRate);
      setHasAccess(true);

      // 백엔드에 크레딧 차감 요청
      if (user?.userId) {
        try {
          const deductResult = await deductCredit(
            user.userId,
            CREDIT_COST,
            "AI 추천 공고 서비스 이용"
          );
          
          if (deductResult.success && deductResult.balance) {
            setCreditBalance(deductResult.balance.balance);
            localStorage.setItem("nextenter_credit_balance", deductResult.balance.balance.toString());
          }
        } catch (creditError) {
          console.error("크레딧 차감 실패:", creditError);
        }
      }
    } catch (error) {
      console.error("공고 추천 오류:", error);
      alert("공고 추천 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAccess = () => setShowConfirmModal(false);

  const handleApply = (jobId: number) => {
    setSelectedJobId(jobId);
    setShowResumeModal(true);
  };

  const handleResumeSelect = (resumeId: number) => setSelectedResumeId(resumeId);

  const handleFinalSubmit = () => {
    if (!selectedResumeId) {
      alert("이력서를 선택해주세요.");
      return;
    }
    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    if (confirm(`"${selectedResume?.title}"로 지원하시겠습니까?`)) {
      alert("완료되었습니다");
      setShowResumeModal(false);
      setSelectedJobId(null);
      setSelectedResumeId(null);
    }
  };

  const handleCancelResume = () => {
    setShowResumeModal(false);
    setSelectedJobId(null);
    setSelectedResumeId(null);
  };

  const handleJobClick = (jobId: number) => {
    navigate(`/user/jobs/${jobId}`);
  };

  const formatExperience = (min?: number, max?: number) => {
    if (min === undefined && max === undefined) return "경력무관";
    if (min === 0) return "신입";
    if (max === undefined) return `${min}년 이상`;
    return `${min}~${max}년`;
  };

  const formatSalary = (min?: number, max?: number) => {
    if (min === undefined && max === undefined) return "협의";
    if (min === max) return `${min?.toLocaleString()}만원`;
    return `${min?.toLocaleString()}~${max?.toLocaleString()}만원`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div className="flex items-start gap-6">
            <LeftSidebar title="채용정보" activeMenu={activeMenu} onMenuClick={handleMenuClick} />
            <div className="flex-1">
              <div className="p-16 text-center bg-white border-2 border-gray-200 rounded-2xl">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 mb-2">AI가 분석 중입니다</p>
                    <p className="text-gray-500">최적의 공고를 찾고 있습니다</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-md p-8 bg-white shadow-2xl rounded-2xl">
              <h3 className="mb-2 text-xl font-bold text-center text-gray-900">
                크레딧 차감 확인
              </h3>
              <p className="mb-4 text-center text-gray-600">
                AI 추천 공고를 확인하시려면{" "}
                <span className="text-2xl font-bold text-blue-600">
                  {CREDIT_COST} 크레딧
                </span>
                이 차감됩니다
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleCancelAccess}
                  className="flex-1 px-6 py-3 font-medium text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmAccess}
                  className="flex-1 px-6 py-3 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="min-h-screen bg-white">
          <div className="px-4 py-8 mx-auto max-w-7xl">
            <div className="flex items-start gap-6">
              <LeftSidebar title="채용정보" activeMenu={activeMenu} onMenuClick={handleMenuClick} />

              <div className="flex-1 space-y-8">
                <section className="p-8 bg-white border-2 border-gray-200 rounded-2xl">
                  <div className="flex items-center justify-center min-h-[600px]">
                    <div className="max-w-2xl p-12 text-center bg-white border-2 border-blue-500 shadow-xl rounded-2xl">
                      <div className="mb-6">
                        <svg className="w-24 h-24 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h2 className="mb-4 text-3xl font-bold text-gray-900">
                        AI 맞춤 추천 공고
                      </h2>
                      <p className="mb-3 text-lg text-gray-600">
                        회원님의 이력서와 선호도를 분석하여
                      </p>
                      <p className="mb-8 text-lg text-gray-600">
                        최적의 채용공고를 추천해 드립니다
                      </p>
                      <div className="p-6 mb-8 bg-blue-50 rounded-xl">
                        <div className="flex items-center justify-center mb-4 space-x-2">
                          <span className="text-2xl font-bold text-blue-600">
                            크레딧 {CREDIT_COST}개
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          AI 추천 공고를 확인하시려면 크레딧이 필요합니다
                        </p>
                      </div>
                      <button
                        onClick={handleAccessRequest}
                        disabled={allJobs.length === 0}
                        className="px-12 py-4 text-xl font-bold text-white transition bg-blue-600 shadow-lg rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        AI 공고 보기
                      </button>
                      <p className="mt-6 text-sm text-gray-500">
                        현재 보유 크레딧: <span className="font-bold">{creditBalance}</span>
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="mb-6 text-2xl font-bold text-gray-900">
              지원할 이력서를 선택해주세요
            </h3>
            <div className="mb-6 space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => handleResumeSelect(resume.id)}
                  className={`p-5 border-2 rounded-lg cursor-pointer transition ${
                    selectedResumeId === resume.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 bg-white"
                  }`}
                >
                  <h4 className="text-lg font-bold text-gray-900">
                    {resume.title}
                  </h4>
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleCancelResume}
                className="flex-1 px-6 py-3 font-medium text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 px-6 py-3 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                지원하기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white">
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div className="flex items-start gap-6">
            <LeftSidebar title="채용정보" activeMenu={activeMenu} onMenuClick={handleMenuClick} />

            <div className="flex-1 space-y-8">
              <section className="p-8 bg-white border-2 border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">AI 추천 공고</h2>
                  <button
                    onClick={handleAccessRequest}
                    className="px-4 py-2 text-sm font-semibold text-blue-600 transition border-2 border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    🔄 다시 추천받기
                  </button>
                </div>

                <div className="space-y-4">
                  {recommendedJobs.map((job) => (
                    <div
                      key={job.jobId}
                      onClick={() => handleJobClick(job.jobId)}
                      className="relative p-6 transition bg-white border-2 border-blue-500 rounded-lg shadow-md cursor-pointer hover:shadow-xl"
                    >
                      <div className="absolute top-4 right-4">
                        <div className="flex flex-col items-center">
                          <div className={`px-4 py-2 rounded-full ${
                            job.matchRate >= 90 ? "bg-gradient-to-r from-purple-600 to-pink-600" :
                            job.matchRate >= 80 ? "bg-gradient-to-r from-blue-600 to-purple-600" :
                            "bg-gradient-to-r from-green-600 to-blue-600"
                          }`}>
                            <span className="text-xl font-bold text-white">
                              {job.matchRate}%
                            </span>
                          </div>
                          <span className="mt-1 text-xs font-medium text-gray-600">
                            AI 매칭
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start justify-between pr-24">
                        <div className="flex-1">
                          <div className="flex items-center mb-2 space-x-2">
                            <span className="text-sm font-medium text-gray-600">
                              등록 기업
                            </span>
                          </div>
                          <h3 className="mb-1 text-lg font-bold text-gray-900">
                            {job.companyName}
                          </h3>
                          <h4 className="mb-3 text-base font-semibold text-gray-800">
                            {job.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>📍 {job.location}</span>
                            <span>💰 {formatSalary(job.salaryMin, job.salaryMax)}</span>
                            <span>👥 {formatExperience(job.experienceMin, job.experienceMax)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(job.jobId);
                            }}
                            className="px-6 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            입사지원
                          </button>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium text-blue-600">
                              D-{Math.floor(Math.random() * 20) + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}