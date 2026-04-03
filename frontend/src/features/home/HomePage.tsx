import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";
import { getJobPostings, JobPostingListResponse } from "../../api/job";

type JobCategory = {
  id: number;
  icon: string;
  label: string;
  color: string;
};

interface HomePageProps {
  onLoginClick?: () => void;
}

// ✅ 광고 이미지 배열 (public/images 폴더)
const advertisementImages = [
  "/images/ad1.png",
  "/images/ad2.png",
  "/images/ad3.png",
];

// ✅ 카드 상단 그라데이션 색상 배열
const cardBorderColors = [
  "from-purple-400 to-purple-600", // 보라색
  "from-blue-400 to-blue-600",     // 파란색
  "from-green-400 to-green-600",   // 초록색
  "from-lime-400 to-lime-600",     // 연두색
];

export default function HomePage({ onLoginClick }: HomePageProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // ✅ 실제 공고 데이터 상태
  const [recommendedJobs, setRecommendedJobs] = useState<JobPostingListResponse[]>([]);
  const [moreJobs, setMoreJobs] = useState<JobPostingListResponse[]>([]);
  const [allJobs, setAllJobs] = useState<JobPostingListResponse[]>([]); // ✅ 모든 공고
  const [isLoading, setIsLoading] = useState(true);

  // ✅ 광고 배너 슬라이드 상태
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // ✅ 호버된 카드 ID 추적
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  // ✅ 코로셀 상태
  const [currentTab, setCurrentTab] = useState<'recommended' | 'hot' | 'public'>('recommended');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // ✅ 광고 배너 자동 페이드 (3초마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % advertisementImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // ✅ 공고 데이터 가져오기
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        
        // 추천 공고 12개 (캐러셀용)
        const recommendedResponse = await getJobPostings({
          page: 0,
          size: 12,
          status: "OPEN"
        });
        setRecommendedJobs(recommendedResponse.content);

        // 더 많은 공고 3개
        const moreResponse = await getJobPostings({
          page: 0,
          size: 3,
          status: "OPEN"
        });
        setMoreJobs(moreResponse.content);

        // ✅ 모든 공고 가져오기 (최대 100개)
        const allResponse = await getJobPostings({
          page: 0,
          size: 100,
          status: "OPEN"
        });
        setAllJobs(allResponse.content);
      } catch (error) {
        console.error("공고 데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleJobClick = (jobId: number) => {
    navigate(`/user/jobs/${jobId}`);
  };

  // ✅ 소셜 로그인 핸들러
  const handleSocialLogin = (provider: "naver" | "kakao" | "google") => {
    const backendUrl = "http://localhost:8080";
    window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
  };

  const jobCategories: JobCategory[] = [
    { id: 1, icon: "/images/react.png", label: "프론트", color: "bg-purple-100" },
    { id: 2, icon: "/images/spring boot.png", label: "백엔드", color: "bg-blue-100" },
    { id: 4, icon: "/images/풀스텍.png", label: "풀스택", color: "bg-red-100" },
    { id: 6, icon: "/images/notion.png", label: "PM", color: "bg-gray-100" },
    { id: 8, icon: "/images/AI.png", label: "AI 엔지니어", color: "bg-cyan-100" },
    { id: 5, icon: "/images/Figma.png", label: "디자이너", color: "bg-orange-100" },
  ];

  // ✅ D-day 계산 함수
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

  // ✅ 회사 로고 첫 글자 추출
  const getCompanyInitial = (companyName: string): string => {
    return companyName?.charAt(0) || "C";
  };

  // ✅ 카드 색상 가져오기 (인덱스 기반)
  const getCardBorderColor = (index: number): string => {
    return cardBorderColors[index % cardBorderColors.length];
  };

  return (
    <main className="px-6 py-8 mx-auto max-w-[1600px] bg-white">
      {/* 상단 영역 */}
      <div className="flex gap-5 mb-6">
        {/* 왼쪽: 오늘의 합격 꿀팁 */}
        <aside className="w-72 space-y-3">
          {/* 꿀팁 박스 - 큰 카드 */}
          <div className="p-2 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl shadow-md">
            <div className="flex items-start mb-4">
              {/* 그라데이션 아이콘 */}
              <div className="flex items-center justify-center w-14 h-14 mr-3 bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 rounded-2xl flex-shrink-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight pt-1">
                오늘의 합격 꿀팁
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-700 mb-4">
              경쟁자는 합격하고
              <br />
              나는 탈락하는 이유, 알려드려요.
            </p>
            <button className="text-sm font-semibold text-blue-600 hover:underline">
              확인하기
            </button>
          </div>

          {/* 인적성검사 */}
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">인적성검사</h3>
            </div>
            <p className="text-sm text-gray-600 ml-13">
              서류합격률 UP
            </p>
          </div>

        </aside>

        {/* 중앙: 추천 공고 캐러셀 */}
        <div className="flex-1 max-w-4xl">
          {/* ✅ 캐러셀 공고 카드 */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">공고를 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {recommendedJobs.length > 0 ? (
                <>
                  {/* 왼쪽 화살표 */}
                  {carouselIndex > 0 && (
                    <button
                      onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all -translate-x-6"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {/* 캐러셀 컨테이너 */}
                  <div className="overflow-hidden bg-white rounded-3xl p-11 border-2 border-gray-200">
                    {/* 제목 */}
                    <div className="flex items-center mb-4">
                      <span className="mr-2 text-xl">👤</span>
                      <h3 className="text-sm font-bold">회원님을 위한 추천공고</h3>
                    </div>
                    
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ 
                        transform: `translateX(-${carouselIndex * (100 / 3)}%)`,
                      }}
                    >
                      {recommendedJobs.map((job) => (
                        <div
                          key={job.jobId}
                          className="flex-shrink-0 px-3"
                          style={{ width: 'calc(100% / 3)' }}
                        >
                            <div
                              onClick={() => handleJobClick(job.jobId)}
                              className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg h-full flex flex-col border-2 border-gray-200 px-5 py-4"
                            >
                            {/* 로고 영역 */}
                            <div className="flex items-center justify-start mb-3">
                              {job.logoUrl ? (
                                <img 
                                  src={job.logoUrl} 
                                  alt={job.companyName} 
                                  className="h-8 w-auto object-contain"
                                />
                              ) : (
                                <div className="px-3 py-1 text-sm font-bold text-gray-400">
                                  {job.companyName}
                                </div>
                              )}
                            </div>

                            {/* 공고 제목 */}
                            <h4 className="mb-3 text-lg font-bold text-gray-900 line-clamp-2 flex-grow">
                              {job.title}
                            </h4>
                            
                            {/* 회사명 */}
                            <p className="mb-3 text-sm text-gray-600">{job.companyName}</p>
                            
                            {/* 마감일 */}
                            <div className="mt-auto">
                              <p className="text-sm text-gray-400 text-right">
                                ~{new Date(job.deadline).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}({['일','월','화','수','목','금','토'][new Date(job.deadline).getDay()]})
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 오른쪽 화살표 */}
                  {carouselIndex < recommendedJobs.length - 3 && (
                    <button
                      onClick={() => setCarouselIndex(prev => prev + 1)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all translate-x-6"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  <p className="text-4xl mb-4">📭</p>
                  <p>등록된 공고가 없습니다</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 오른쪽: 광고 배너 */}
        <aside className="w-72 space-y-4">
          {/* 광고 배너들 */}
          <div className="relative h-44 p-4 overflow-hidden text-white shadow-lg bg-gradient-to-br from-teal-700 to-teal-900 rounded-xl">
            <h3 className="mb-2 text-lg font-bold">구직자 대상</h3>
            <h3 className="mb-4 text-lg font-bold">
              해외 취업 사기에 주의하세요!
            </h3>
            <button className="px-4 py-2 text-sm text-white transition bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30">
              바로가기 →
            </button>
            <div className="absolute text-xs bottom-2 right-3">5/5</div>
          </div>


          <div className="relative h-28 p-4 bg-white border border-gray-200 shadow-lg rounded-xl">
            <h3 className="mb-2 text-base font-bold">SK 하이닉스 채용 공고</h3>
            <p className="mb-3 text-xs text-gray-600">
              연봉 5500만원~7500만원
            </p>
            <div className="absolute bottom-4 right-4">
              <div className="flex items-center justify-center w-14 h-14 font-bold text-white bg-purple-600 rounded-full">
                SK
              </div>
            </div>
            <div className="absolute text-xs text-gray-500 bottom-2 right-3">
              1/6
            </div>
          </div>
        </aside>
      </div>

      {/* ✅ 하단 광고 배너 */}
      {!isLoading && (
        <div className="relative h-24 rounded-xl shadow-lg overflow-hidden bg-gray-100 mb-8">
          {advertisementImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`광고 ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-fill transition-opacity duration-1000 ${
                index === currentAdIndex ? 'opacity-100' : 'opacity-0'
              }`}
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder-ad.png";
              }}
            />
          ))}

          <div className="absolute flex gap-2 transform -translate-x-1/2 bottom-3 left-1/2 z-10">
            {advertisementImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`h-2 rounded-full transition-all ${ 
                  index === currentAdIndex
                    ? "bg-white w-6"
                    : "bg-white/50 w-2 hover:bg-white/75"
                }`}
                aria-label={`광고 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ✅ 모든 공고 카드 섹션 - 제목과 회사명을 상세 설명으로 변경 */}
      {!isLoading && allJobs.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">회원님이 꼭 봐야 할 공고 (플래티넘)</h2>
            <p className="text-sm text-gray-600">총 {allJobs.length}개의 공고</p>
          </div>

          {/* ✅ 그리드 컨테이너 */}
          <div className="grid grid-cols-4 gap-x-4 gap-y-4">
            {allJobs.map((job, index) => (
              <div
                key={job.jobId}
                className="relative"
                style={{ height: '350px' }}
              >
                <div
                  onClick={() => handleJobClick(job.jobId)}
                  onMouseEnter={() => setHoveredCardId(job.jobId)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className={`
                    absolute top-0 left-0 right-0
                    rounded-3xl cursor-pointer overflow-hidden
                    transition-all duration-500 ease-in-out
                    ${hoveredCardId === job.jobId 
                      ? 'shadow-2xl h-[700px] z-50' 
                      : 'shadow-sm h-[350px] z-10'
                    }
                  `}
                >
                  {/* ✅ 기본 상태: 로고 + 상세 설명 + 썸네일 */}
                  {hoveredCardId !== job.jobId && (
                    <div className="relative w-full h-full bg-white border-2 border-gray-200 rounded-3xl overflow-hidden">
                      {/* ✅ 상단 그라데이션 테두리 */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getCardBorderColor(index)}`}></div>
                      
                      {/* 북마크 아이콘 */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // 북마크 기능 추가 예정
                        }}
                        className="absolute top-4 right-4 z-10 p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>

                      {/* 상단: 회사 로고 (동그라미 제거, 크기 축소) */}
                      <div className="flex justify-center px-5 pt-4 pb-3">

                        <div className="flex items-center justify-center h-12 max-w-[120px]">
                          {job.logoUrl ? (
                            <img 
                              src={job.logoUrl} 
                              alt={job.companyName} 
                              className="max-h-12 w-auto object-contain"
                            />
                          ) : (
                            <div className="px-3 py-1.5 text-sm font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded">
                              {job.companyName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ✅ 중간: 상세 설명 (제목과 회사명 대신) */}
                      <div className="px-6 py-4 pl-7 flex items-start justify-start" style={{ minHeight: "100px" }}>
                      <p className="text-md font-medium text-gray-800 line-clamp-3 whitespace-pre-line leading-relaxed text-left">
                        {job.description || "상세 설명이 없습니다."}
                      </p>
                    </div>

                      {/* 하단: 썸네일 이미지 */}
                      <div className="absolute bottom-0 left-0 right-0 h-[150px] rounded-b-3xl overflow-hidden">
                        {job.thumbnailUrl ? (
                          <img 
                            src={job.thumbnailUrl} 
                            alt={job.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                            <div className="text-center text-gray-400">
                              <p className="text-sm">썸네일 이미지</p>
                              <p className="text-xs">(등록 필요)</p>
                            </div>
                          </div>
                        )}
                        
                        {/* 하단 정보 오버레이 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <div className="flex items-center justify-between text-white text-xs">
                            <span className="flex items-center gap-1">
                              📍 {job.location}
                            </span>
                            <span className="px-2 py-1 bg-blue-600 rounded font-semibold">
                              {calculateDday(job.deadline)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ✅ 호버 상태: 카드 전체가 상세 이미지로 변경 */}
                  {hoveredCardId === job.jobId && (
                    <div className="relative w-full h-full rounded-3xl overflow-hidden">
                      {/* ✅ 상단 그라데이션 테두리 (호버 시에도 표시) */}
                      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${getCardBorderColor(index)} z-20`}></div>
                      
                      {/* 상세 이미지 - 카드 전체 채움 */}
                      {job.detailImageUrl ? (
                        <img 
                          src={job.detailImageUrl} 
                          alt={`${job.title} 상세`}
                          className="w-full h-auto"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <p className="text-xl font-bold mb-2">상세 이미지</p>
                          <p className="text-base">(등록 필요)</p>
                        </div>
                      </div>
                      )}

                      {/* 북마크 아이콘 */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // 북마크 기능 추가 예정
                        }}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>

                      {/* 하단 정보 오버레이 - 더 큰 영역 */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 pt-20 rounded-b-3xl">
                        <div className="text-white space-y-3">
                          {/* 회사명 + 제목 */}
                          <div>
                            <p className="text-sm font-semibold mb-1 opacity-90">{job.companyName}</p>
                            <h4 className="text-lg font-bold line-clamp-2">{job.title}</h4>
                          </div>

                          {/* 직무 + D-day */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/30">
                            <span className="text-sm font-semibold flex items-center gap-2">
                              💼 {job.jobCategory}
                            </span>
                            <span className="px-4 py-2 bg-blue-600 rounded-full font-bold text-sm">
                              {calculateDday(job.deadline)}
                            </span>
                          </div>
                          
                          {/* 통계 정보 */}
                          <div className="flex items-center gap-6 text-sm">
                            <span className="flex items-center gap-1">
                              👁️ {job.viewCount?.toLocaleString() || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              📝 {job.applicantCount?.toLocaleString() || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              ⭐ {job.bookmarkCount?.toLocaleString() || 0}
                            </span>
                          </div>

                          {/* 위치 + 경력 */}
                          <div className="space-y-1 text-sm opacity-90">
                            <p className="flex items-center gap-1">
                              📍 {job.location}
                            </p>
                            {(job.experienceMin !== undefined || job.experienceMax !== undefined) && (
                              <p className="flex items-center gap-1">
                                💼 경력: {job.experienceMin ?? 0}년 ~ {job.experienceMax ?? '제한없음'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
