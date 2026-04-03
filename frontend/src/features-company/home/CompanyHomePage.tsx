import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { getCompanyJobPostings, JobPostingListResponse } from "../../api/job";
import { searchTalents, TalentSearchResponse } from "../../api/talent";

export default function CompanyHomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [myJobs, setMyJobs] = useState<JobPostingListResponse[]>([]);
  const [talents, setTalents] = useState<TalentSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTalentLoading, setIsTalentLoading] = useState(false);

  // 로그인 필요한 페이지 이동 처리
  const handleProtectedNavigation = (path: string) => {
    if (!isAuthenticated) {
      alert("로그인이 필요한 기능입니다.");
      navigate("/company/login");
      return;
    }
    navigate(path);
  };

  // 내가 올린 공고 불러오기
  useEffect(() => {
    const fetchMyJobs = async () => {
      if (!isAuthenticated || !user?.companyId) {
        return;
      }

      try {
        setIsLoading(true);
        const jobs = await getCompanyJobPostings(user.companyId);
        // 최신 3개만 표시
        setMyJobs(jobs.slice(0, 3));
      } catch (error) {
        console.error("공고 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyJobs();
  }, [isAuthenticated, user]);

  // 인재 검색 불러오기
  useEffect(() => {
    const fetchTalents = async () => {
      if (!isAuthenticated || !user?.companyId) {
        return;
      }

      try {
        setIsTalentLoading(true);
        const response = await searchTalents({
          page: 0,
          size: 3,
          companyUserId: user.companyId,
        });
        setTalents(response.content);
      } catch (error) {
        console.error("인재 검색 실패:", error);
      } finally {
        setIsTalentLoading(false);
      }
    };

    fetchTalents();
  }, [isAuthenticated, user]);

  // D-day 계산
  const calculateDday = (deadline: string): string => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "마감";
    } else if (diffDays === 0) {
      return "D-day";
    } else {
      return `D-${diffDays}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 메인 컨텐츠 */}
      <div className="px-6 py-16 mx-auto max-w-7xl">
        {/* 히어로 섹션 */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-8 mb-8">
            {/* 왼쪽 아이콘들 */}
            <div className="flex gap-4">
              <div className="transform -rotate-12">
                <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="transform rotate-6">
                <svg className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            
            {/* 중앙 타이틀 */}
            <div>
              <h1 className="text-5xl font-black text-gray-900 mb-3">
                나에게 맞춘 <span className="text-purple-600">AI 채용</span> 서비스
              </h1>
              <p className="text-xl text-black-600 font-medium"> NextEnter</p>
            </div>
            
            {/* 오른쪽 아이콘들 */}
            <div className="flex gap-4">
              <div className="transform rotate-12">
                <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="transform -rotate-6">
                <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* 메인 컨텐츠 영역 */}
        <div className="grid grid-cols-12 gap-6 mb-12">
          {/* 왼쪽: 서비스 안내 */}
          <div className="col-span-9">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">우리 회사에 딱 맞는 방식으로 채용을 시작하세요!</h2>
              
              {/* 3개 서비스 카드 */}
              <div className="grid grid-cols-3 gap-4">
                {/* 직접 공고 등록 */}
                <div
                  onClick={() => handleProtectedNavigation('/company/jobs')}
                  className="bg-blue-50 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">직접 공고 등록</h3>
                    <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    우리 회사 공고를 <span className="text-blue-600 font-bold">직접 등록</span> 할 수 있어요.<br />
                    간단한 정보를 입력하고 채용을 시작하세요.
                  </p>
                </div>
                
                {/* 지원자 관리 */}
                <div
                  onClick={() => handleProtectedNavigation('/company/applicants')}
                  className="bg-yellow-50 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-yellow-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">지원자 관리</h3>
                    <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    지원자의 이력서 및 포트폴리오!<br />
                    한눈에 알아볼 수 있는 지원자 관리 기능!
                  </p>
                </div>
                
                {/* 마이페이지 */}
                <div
                  onClick={() => handleProtectedNavigation('/company/mypage')}
                  className="bg-purple-50 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">마이페이지</h3>
                    <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    <span className="text-purple-600 font-bold">우리 회사 정보를 확인</span>하세요.<br />
                    회사 정보, 크레딧, 통계를 한눈에 관리하세요!
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 로그인 & 고객센터 */}
          <div className="col-span-3 space-y-4">
                        
            {/* 고객센터 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">고객센터</h3>
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">02-6226-5000</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-base">help@nextenter.co.kr</p>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <p className="text-gray-500 text-sm">평일 09:00 ~ 19:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 하단 섹션: 찾고 있는 채용 상품이 없다면 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 mb-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-6 mb-6">
              <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <h2 className="text-2xl font-black text-gray-900">
                찾고 있는 채용 상품이 없다면? <span className="text-purple-600">더 많은 채용 상품을</span> 구경해보세요!
              </h2>
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* 하단: 인재검색 & 공고 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 인재 검색 */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-xs mb-2">
                  TALENT SEARCH
                </div>
                <h3 className="text-xl font-black text-gray-900">인재 검색</h3>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/company/talent-search')}
                className="px-4 py-2 text-blue-600 border border-blue-300 font-semibold text-sm rounded-lg hover:bg-blue-50 transition-all"
              >
                전체보기
              </button>
            </div>

            <div className="space-y-3">
              {isTalentLoading ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600">인재를 불러오는 중...</p>
                </div>
              ) : talents.length > 0 ? (
                talents.map((talent) => (
                  <div
                    key={talent.resumeId}
                    onClick={() => navigate(`/company/talent-search/${talent.resumeId}`)}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {talent.name}
                        </h4>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">
                          {talent.jobCategory}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {talent.matchScore}점
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>📍 {talent.location}</span>
                      <span className="font-semibold text-blue-600">{talent.experienceYears}년 경력</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {talent.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm mb-4">등록된 인재가 없습니다</p>
                  <button
                    onClick={() => handleProtectedNavigation('/company/talent-search')}
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition-all"
                  >
                    인재 검색하기
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 내가 올린 공고 */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold text-xs mb-2">
                  MY JOBS
                </div>
                <h3 className="text-xl font-black text-gray-900">내가 올린 공고</h3>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/company/jobs')}
                className="px-4 py-2 text-purple-600 border border-purple-300 font-semibold text-sm rounded-lg hover:bg-purple-50 transition-all"
              >
                전체보기
              </button>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600">공고를 불러오는 중...</p>
                </div>
              ) : myJobs.length > 0 ? (
                myJobs.map((job) => (
                  <div
                    key={job.jobId}
                    onClick={() => navigate(`/company/jobs/${job.jobId}`)}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1 flex-1">
                        {job.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {job.status === 'OPEN' ? '진행중' : '마감'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>📍 {job.location}</span>
                      <span className="font-semibold text-purple-600">{calculateDday(job.deadline)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>👁️ {job.viewCount}</span>
                      <span>📝 {job.applicantCount}</span>
                      <span>⭐ {job.bookmarkCount}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm mb-4">등록된 공고가 없습니다</p>
                  <button
                    onClick={() => handleProtectedNavigation('/company/jobs')}
                    className="px-5 py-2.5 bg-purple-600 text-white font-semibold text-sm rounded-lg hover:bg-purple-700 transition-all"
                  >
                    공고 등록하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
