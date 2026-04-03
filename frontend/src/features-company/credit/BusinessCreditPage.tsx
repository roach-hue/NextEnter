import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import CompanyLeftSidebar from "../components/CompanyLeftSidebar";
import { useCompanyPageNavigation } from "../hooks/useCompanyPageNavigation";
import { getCreditBalance } from "../../api/credit";
import { searchTalents, type TalentSearchResponse } from "../../api/talent";
import { getJobPostings, type JobPostingListResponse } from "../../api/job";
import { getApplies, type ApplyListResponse } from "../../api/apply";

export default function BusinessCreditPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const { activeMenu, handleMenuClick } = useCompanyPageNavigation(
    "credit",
    "credit-sub-1",
  );

  const reloadParam = searchParams.get("reload");

  const [currentCredit, setCurrentCredit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedApplicants, setRecommendedApplicants] = useState<
    TalentSearchResponse[]
  >([]);
  const [myJobPostings, setMyJobPostings] = useState<JobPostingListResponse[]>(
    [],
  );
  const [appliedCandidates, setAppliedCandidates] = useState<
    ApplyListResponse[]
  >([]);

  // [로직 유지]
  useEffect(() => {
    const fetchCreditBalance = async () => {
      if (user?.companyId) {
        try {
          const balance = await getCreditBalance(user.companyId);
          setCurrentCredit(balance.balance);
        } catch (error) {
          console.error("❌ 크레딧 잔액 조회 실패:", error);
          setCurrentCredit(0);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchCreditBalance();
  }, [user?.companyId, reloadParam]);

  useEffect(() => {
    const fetchRecommendedApplicants = async () => {
      if (user?.companyId) {
        try {
          const result = await searchTalents({
            page: 0,
            size: 4,
            companyUserId: user.companyId,
          });
          setRecommendedApplicants(result.content);
        } catch (error) {
          console.error("추천 지원자 조회 실패:", error);
        }
      }
    };
    fetchRecommendedApplicants();
  }, [user?.companyId, reloadParam]);

  useEffect(() => {
    const fetchMyJobPostings = async () => {
      if (user?.companyId) {
        try {
          const res = await getJobPostings({ page: 0, size: 20 });
          const postings = res?.content ?? [];
          const activePostings = postings
            .filter(
              (p) => p.status === "ACTIVE" && p.companyId === user.companyId,
            )
            .slice(0, 3);
          setMyJobPostings(activePostings);
        } catch (error) {
          console.error("공고 목록 조회 실패:", error);
        }
      }
    };
    fetchMyJobPostings();
  }, [user?.companyId, reloadParam]);

  useEffect(() => {
    const fetchAppliedCandidates = async () => {
      if (user?.companyId) {
        try {
          const result = await getApplies(user.companyId, {
            page: 0,
            size: 2,
          });
          setAppliedCandidates(result.content);
        } catch (error) {
          console.error("지원자 목록 조회 실패:", error);
        }
      }
    };
    fetchAppliedCandidates();
  }, [user?.companyId, reloadParam]);

  const handleChargeClick = () => {
    navigate("/company/credit/charge");
  };

  const formatExperience = (years: number) => {
    if (years === 0) return "신입";
    if (years < 0) return "경력무관";
    return `${years}년`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex px-6 py-10 mx-auto max-w-7xl">
        <CompanyLeftSidebar
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
        />

        <div className="flex-1 pl-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">보유 크레딧</h1>
            <button
              onClick={handleChargeClick}
              className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-sm"
            >
              + 충전하기
            </button>
          </div>

          {/* Credit Card Section: 이미지의 숫자 박스 스타일 보존 */}
          <div className="p-10 mb-10 bg-gradient-to-r bg-slate-800 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-xl font-medium opacity-90">
                  {user?.name || "관리자"}님의 현재 사용 가능 크레딧
                </p>
              </div>
              
              {/* 이미지 부분 보존: 화이트 알약형 박스 */}
              <div className="flex items-center px-10 py-5 space-x-6 bg-white rounded-full shadow-lg">
                {isLoading ? (
                  <span className="text-3xl text-gray-300 animate-pulse">Loading...</span>
                ) : (
                  <>
                    <span className="text-[54px] font-black text-[#1e2329] leading-none">
                      {currentCredit.toLocaleString()}
                    </span>
                    {/* 이미지 내 코인 아이콘 형태 재현 */}
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-[#fcd34d] to-[#f59e0b] shadow-inner border-2 border-[#fbbf24]">
                       <span className="text-white text-2xl font-bold">🪙</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dashboard Grid: 대기업 스타일 (정갈한 보더와 폰트) */}
          <div className="grid grid-cols-2 gap-8">
            
            {/* 추천 지원자 */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">추천 지원자 현황</h2>
              </div>
              <div className="flex-1">
                {recommendedApplicants.length > 0 ? (
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100">
                      {recommendedApplicants.map((candidate, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => navigate("/company/talent-search")}
                        >
                          <td className="px-6 py-4 font-bold text-slate-800 text-sm">{candidate.name}</td>
                          <td className="px-6 py-4 text-slate-500 text-sm">{candidate.jobCategory} · {formatExperience(candidate.experienceYears)}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 rounded">매칭 {candidate.matchScore}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-sm">데이터가 없습니다.</div>
                )}
              </div>
            </div>

            {/* 내 공고 보기 */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">진행 중인 채용 공고</h2>
                <button onClick={() => navigate("/company/jobs/create")} className="text-slate-400 hover:text-slate-900 text-lg font-light">+</button>
              </div>
              <div className="p-4 space-y-3 flex-1">
                {myJobPostings.map((job) => (
                  <div
                    key={job.jobId}
                    className="p-4 border border-slate-100 rounded hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group"
                    onClick={() => navigate(`/company/jobs/${job.jobId}`)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600">{job.title}</h3>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
                    </div>
                    <p className="text-[11px] text-slate-400">📍 {job.location} | 지원자 {job.applicantCount}명</p>
                  </div>
                ))}
                <button onClick={() => navigate("/company/jobs")} className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 border-t border-slate-50 mt-2">전체 공고 보기</button>
              </div>
            </div>

            {/* 크레딧 안내 */}
            <div className="p-8 bg-[#1e2329] rounded-lg shadow-sm text-white">
              <h3 className="text-lg font-bold mb-5 border-l-4 border-blue-500 pl-4">크레딧 사용 가이드</h3>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex items-center space-x-3">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>인재 검색 및 상세 이력서 열람</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>채용 공고 프리미엄 노출 서비스</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>적합한 지원자 대상 직접 채용 제안</span>
                </li>
              </ul>
            </div>

            {/* 지원한 인재 */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">최근 지원 인재</h2>
              </div>
              <div className="flex-1 divide-y divide-slate-100">
                {appliedCandidates.map((candidate, idx) => (
                  <div
                    key={idx}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/company/applicants/${candidate.applyId}`)}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{candidate.userName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{candidate.jobTitle}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-400">{candidate.userAge}세</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}