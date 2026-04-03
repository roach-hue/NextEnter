import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useCreditStore } from "../../stores/creditStore";
import { getCreditBalance, deductCredit } from "../../api/credit";
import { getResumeList } from "../../api/resume";
import { getJobPostings } from "../../api/job";
import { getAiRecommendation, CompanyInfo, AiRecommendRequest } from "../../api/ai";

import LeftSidebar from "../../components/LeftSidebar";
import MatchingHistoryPage from "./components/MatchingHistoryPage";
import ConfirmDialog from "./components/ConfirmDialog";
import MatchingHeader from "./components/MatchingHeader";
import TargetSelection from "./components/TargetSelection";
import EmptyAnalysis from "./components/EmptyAnalysis";
import AnalysisResult from "./components/AnalysisResult";
import { useResumeStore } from "../../stores/resumeStore";
import { useJobStore } from "../../stores/jobStore";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import { CREDIT_COST } from "./data/sampleData";


interface MatchingPageProps {
  onEditResume?: () => void;
  initialMenu?: string;
  onNavigate?: (page: string, subMenu?: string) => void;
}

export default function MatchingPage({
  onEditResume,
  initialMenu = "matching",
  onNavigate,
}: MatchingPageProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { creditBalance, setCreditBalance } = useCreditStore();

  const { activeMenu, handleMenuClick, setActiveMenu } = usePageNavigation(
    "matching",
    initialMenu || "matching-sub-1",
    onNavigate
  );

  const [selectedResume, setSelectedResume] = useState("");
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [recommendedCompanies, setRecommendedCompanies] = useState<CompanyInfo[]>([]);
  const [aiReport, setAiReport] = useState("");
  const [aiGrade, setAiGrade] = useState("");
  const [aiScore, setAiScore] = useState(0);
  const [aiExperienceLevel, setAiExperienceLevel] = useState("JUNIOR");
  const [isLoading, setIsLoading] = useState(false);

  const { resumes, setResumes } = useResumeStore();
  const { businessJobs, setBusinessJobs } = useJobStore();

  // 히스토리는 DB 기반으로 전환됨 (localStorage 자동삭제 로직 제거)

  // 크레딧 잔액 조회
  useEffect(() => {
    const fetchCreditBalance = async () => {
      if (user?.userId) {
        try {
          console.log("📡 [MatchingPage] 크레딧 잔액 조회 시작:", user.userId);
          const balance = await getCreditBalance(user.userId);
          console.log("✅ [MatchingPage] 크레딧 잔액 조회 성공:", balance);
          setCreditBalance(balance.balance);
          localStorage.setItem("nextenter_credit_balance", balance.balance.toString());
        } catch (error: any) {
          console.error("❌ [MatchingPage] 크레딧 잔액 조회 실패:", error);
          
          if (error.response?.status !== 401) {
            const savedBalance = localStorage.getItem("nextenter_credit_balance");
            if (savedBalance) {
              console.log("💾 저장된 크레딧 사용:", savedBalance);
              setCreditBalance(parseInt(savedBalance));
            } else {
              setCreditBalance(0);
              localStorage.setItem("nextenter_credit_balance", "0");
            }
          }
        }
      }
    };

    fetchCreditBalance();
  }, [user?.userId, setCreditBalance]);

  // 1. 이력서 목록 로드
  useEffect(() => {
    const loadResumes = async () => {
      if (user?.userId) {
        try {
          console.log('🔄 [MatchingPage] 이력서 목록 동기화 시작 (userId: ' + user.userId + ')');
          const data = await getResumeList(user.userId);
          if (Array.isArray(data)) {
            const contextResumes = data.map((resume) => ({
              id: resume.resumeId,
              title: resume.title,
              industry: resume.jobCategory || '미지정',
              applications: 0,
            }));
            setResumes(contextResumes);
            console.log('✅ [MatchingPage] 이력서 목록 동기화 완료:', contextResumes.length + '개');
          }
        } catch (error) {
          console.error('❌ [MatchingPage] 이력서 로드 오류:', error);
        }
      }
    };
    loadResumes();
  }, [user?.userId, setResumes]);

  // 2. 공고 목록 로드
  useEffect(() => {
    const loadJobsIfEmpty = async () => {
      if (businessJobs.length === 0) {
        try {
          const response = await getJobPostings({ size: 100 });
          if (response.content && response.content.length > 0) {
            const jobs = response.content.map((job: any) => ({
              id: job.jobId,
              title: job.title,
              status: job.status as "ACTIVE" | "CLOSED" | "EXPIRED",
              job_category: job.jobCategory,
              location: job.location,
              experience_min: job.experienceMin,
              experience_max: job.experienceMax,
              salary_min: job.salaryMin,
              salary_max: job.salaryMax,
              deadline: job.deadline,
              view_count: job.viewCount,
              applicant_count: job.applicantCount,
              bookmark_count: 0,
              created_at: job.createdAt
            }));
            setBusinessJobs(jobs);
          }
        } catch (error) {
          console.error('공고 로드 오류:', error);
        }
      }
    };
    loadJobsIfEmpty();
  }, [businessJobs.length, setBusinessJobs]);

  const resumeOptions = (resumes ?? []).map((resume) => ({
    id: String(resume.resumeId ?? resume.id ?? ""),
    name: resume.title ?? "",
  })).filter((opt) => opt.id);

  const handleAnalyze = () => {
    if (!selectedResume) {
      alert("이력서를 먼저 선택해주세요!");
      return;
    }
    
    // 크레딧 부족 체크
    if (creditBalance < CREDIT_COST) {
      alert(`크레딧이 부족합니다. (필요: ${CREDIT_COST}, 보유: ${creditBalance})`);
      return;
    }
    
    setShowConfirmDialog(true);
  };

  // 3. 실제 AI 분석 실행 함수
  const handleConfirmAnalysis = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);

    try {
      const resumeIdNum = parseInt(selectedResume);

      const userIdNum = user?.userId
        ? (typeof user.userId === 'string' ? parseInt(user.userId) : user.userId)
        : null;

      if (!userIdNum) {
        alert("로그인 정보가 올바르지 않습니다. 다시 로그인해주세요.");
        setIsLoading(false);
        return;
      }

      // AI 분석 요청
      const aiRequest: AiRecommendRequest = {
        resumeId: resumeIdNum,
        userId: userIdNum,
      };

      console.log("🚀 [Front] AI Matching Request:", aiRequest);

      const aiResult = await getAiRecommendation(aiRequest);

      setRecommendedCompanies(aiResult.companies);
      setAiReport(aiResult.ai_report);
      setAiGrade(aiResult.grade);
      setAiScore(aiResult.score);
      setAiExperienceLevel(aiResult.experience_level || "JUNIOR");
      setHasAnalysis(true);

      // ✅ AI 분석 성공 후 백엔드에 크레딧 차감 요청
      try {
        console.log("💳 [MatchingPage] 크레딧 차감 시작:", CREDIT_COST);
        const deductResult = await deductCredit(
          userIdNum,
          CREDIT_COST,
          "AI 매칭 분석 서비스 이용"
        );
        
        if (deductResult.success && deductResult.balance) {
          console.log("✅ [MatchingPage] 크레딧 차감 성공:", deductResult.balance.balance);
          // 전역 상태 업데이트 (모든 페이지에 반영됨)
          setCreditBalance(deductResult.balance.balance);
          localStorage.setItem("nextenter_credit_balance", deductResult.balance.balance.toString());
        }
      } catch (creditError) {
        console.error("❌ [MatchingPage] 크레딧 차감 실패:", creditError);
        // 크레딧 차감 실패는 알림만 하고 분석 결과는 유지
        alert("크레딧 차감 중 오류가 발생했습니다. 관리자에게 문의해주세요.");
      }

    } catch (error) {
      console.error("❌ AI 매칭 치명적 오류:", error);
      alert("AI 매칭 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAnalysis = () => setShowConfirmDialog(false);
  const handleBackToMatching = () => setActiveMenu("matching");
  const handleReanalyze = () => {
    setHasAnalysis(false);
    setRecommendedCompanies([]);
    setAiReport("");
    setAiGrade("");
    setAiScore(0);
    setAiExperienceLevel("JUNIOR");
  };

  const handleCreditClick = () => navigate('/user/credit/charge');
  const handleAddResume = () => navigate('/user/resume');
  const handleEditResume = () => navigate('/user/resume');
  const handleApply = () => navigate('/user/jobs/all');

  if (activeMenu === "history" || activeMenu === "matching-sub-2") {
    return (
      <MatchingHistoryPage
        onBackToMatching={handleBackToMatching}
        activeMenu={activeMenu}
        onMenuClick={handleMenuClick}
      />
    );
  }

  return (
    <>
      {showConfirmDialog && (
        <ConfirmDialog
          onConfirm={handleConfirmAnalysis}
          onCancel={handleCancelAnalysis}
        />
      )}

      <div className="min-h-screen bg-white">
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <h2 className="inline-block mb-6 text-2xl font-bold">AI 매칭 분석</h2>
          <div className="flex gap-6">
            <LeftSidebar
              activeMenu={activeMenu}
              onMenuClick={handleMenuClick}
            />

            <div className="flex-1">
              <MatchingHeader
                currentCredit={creditBalance}
                onCreditClick={handleCreditClick}
              />

              <TargetSelection
                resumes={resumeOptions}
                selectedResume={selectedResume}
                onResumeChange={setSelectedResume}
                onAddResume={handleAddResume}
                onAnalyze={handleAnalyze}
              />

              {isLoading ? (
                <div className="p-16 text-center bg-white border-2 border-gray-200 rounded-2xl">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800 mb-2">AI가 분석 중입니다</p>
                      <p className="text-gray-500">이력서를 분석하고 최적의 기업을 매칭하고 있습니다</p>
                      <p className="text-sm text-gray-400 mt-1">최대 1분 정도 소요될 수 있습니다</p>
                    </div>
                  </div>
                </div>
              ) : !hasAnalysis ? (
                <EmptyAnalysis />
              ) : (
                <AnalysisResult
                  recommendedCompanies={recommendedCompanies}
                  aiReport={aiReport}
                  grade={aiGrade}
                  score={aiScore}
                  experienceLevel={aiExperienceLevel}
                  onReanalyze={handleReanalyze}
                  onEditResume={handleEditResume}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}