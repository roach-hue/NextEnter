import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useResumeStore } from "../../stores/resumeStore";
import { getUserProfile, UserProfile } from "../../api/user";
import { getMyApplies, ApplyListResponse } from "../../api/apply";
import { getBookmarkedJobs, BookmarkedJobDto } from "../../api/bookmark";
import { getJobPostings, JobPostingListResponse } from "../../api/job";
import { getReceivedOffers } from "../../api/interviewOffer";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import LeftSidebar from "../../components/LeftSidebar";

interface MyPageProps {
  onNavigate?: (page: string, subMenu?: string) => void;
  onEditProfile?: () => void;
  initialMenu?: string;
}

interface ActivityStats {
  appliedJobs: number;
  receivedOffers: number;
  bookmarkedJobs: number;
}

export default function ImprovedMyPage({
  onNavigate,
  onEditProfile,
  initialMenu,
}: MyPageProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { resumes } = useResumeStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applies, setApplies] = useState<ApplyListResponse[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkedJobDto[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<
    JobPostingListResponse[]
  >([]);
  const [recentJobs, setRecentJobs] = useState<JobPostingListResponse[]>([]);

  const { activeMenu, handleMenuClick } = usePageNavigation(
    "mypage",
    initialMenu || "mypage-sub-1",
    onNavigate,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<ActivityStats>({
    appliedJobs: 0,
    receivedOffers: 0,
    bookmarkedJobs: 0,
  });

  // 프로필 정보 불러오기
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.userId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await getUserProfile(user.userId);
        if (response.success && response.data) {
          setProfile(response.data);
        }
      } catch (err: any) {
        console.error("프로필 로드 오류:", err);
        setError("프로필을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      loadProfile();
    }
  }, [user?.userId]);

  // ✅✅✅ 활동 데이터 불러오기
  useEffect(() => {
    const loadActivityData = async () => {
      if (!user?.userId) {
        console.log("❌ userId가 없습니다");
        return;
      }

      console.log("📊 [START] 활동 데이터 로드 시작 - userId:", user.userId);

      try {
        // 지원 내역 조회
        console.log("🔍 [1/3] 지원 내역 조회 중...");
        const appliesData = await getMyApplies(user.userId);
        console.log("✅ [1/3] 지원 내역:", appliesData.length, "건");
        setApplies(appliesData);

        // 북마크 조회
        console.log("🔍 [2/3] 북마크 조회 중...");
        const bookmarksData = await getBookmarkedJobs(user.userId, 0, 10);
        console.log("✅ [2/3] 북마크 전체 데이터:", bookmarksData);
        console.log(
          "✅ [2/3] 북마크 totalElements:",
          bookmarksData.totalElements,
        );
        console.log(
          "✅ [2/3] 북마크 content 길이:",
          bookmarksData.content?.length,
        );
        setBookmarks(bookmarksData.content);

        // 기업의 요청 조회
        console.log("🔍 [3/3] 기업의 요청 조회 중...");
        let receivedOffersCount = 0;
        try {
          const offersData = await getReceivedOffers(user.userId);
          receivedOffersCount = offersData.length;
          console.log("✅ [3/3] 기업의 요청:", receivedOffersCount, "건");
        } catch (err) {
          console.error("❌ [3/3] 기업 요청 조회 실패:", err);
        }

        // 추천 공고 조회
        const jobsData = await getJobPostings({
          page: 0,
          size: 12,
          status: "ACTIVE",
        });
        setRecommendedJobs(jobsData.content);

        // 최근 본 공고
        const recentJobsData = await getJobPostings({
          page: 0,
          size: 6,
          status: "ACTIVE",
        });
        setRecentJobs(recentJobsData.content);

        // 통계 업데이트
        const newStats = {
          appliedJobs: appliesData.length,
          receivedOffers: receivedOffersCount,
          bookmarkedJobs:
            bookmarksData.totalElements || bookmarksData.content?.length || 0,
        };

        console.log("📊 [FINAL] 최종 통계 객체:", newStats);
        console.log("📊 [FINAL] 지원 현황:", newStats.appliedJobs);
        console.log("📊 [FINAL] 기업의 요청:", newStats.receivedOffers);
        console.log("📊 [FINAL] 스크랩:", newStats.bookmarkedJobs);

        setStats(newStats);

        console.log("✅ [END] 모든 데이터 로드 완료");
      } catch (err: any) {
        console.error("❌ [ERROR] 활동 데이터 로드 오류:", err);
      }
    };

    if (user?.userId) {
      loadActivityData();
    }
  }, [user?.userId]);

  const handleClick = (item: string) => {
    switch (item) {
      case "매칭 리포트":
        handleMenuClick("matching-sub-1");
        break;
      case "매칭 히스토리":
        handleMenuClick("matching-sub-2");
        break;
      case "모의 면접 시작":
        handleMenuClick("interview-sub-1");
        break;
      case "면접 히스토리":
        handleMenuClick("interview-sub-2");
        break;
      case "스크랩 현황":
        handleMenuClick("mypage-sub-5");
        break;
      default:
        break;
    }
  };

  const handleJobClick = (jobId: number) => {
    navigate(`/user/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="flex gap-6">
          {/* 좌측 사이드바 */}
          <LeftSidebar
            title="마이페이지"
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
          />

          {/* 메인 컨텐츠 */}
          <main className="flex-1 space-y-6">
            {/* 활동 통계 대시보드 */}
            <div className="p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏰</span>
                  <h2 className="text-lg font-bold text-gray-900">
                    지원현황과 관심 공고를 관리하세요
                  </h2>
                </div>
                <button
                  onClick={() => handleMenuClick("mypage-sub-3")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  더보기 &gt;
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <button
                  onClick={() => handleMenuClick("mypage-sub-2")}
                  className="p-5 text-center transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:shadow-md hover:border-blue-400 cursor-pointer"
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full">
                      <span className="text-2xl">👤</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    내 정보
                  </div>
                </button>

                <button
                  onClick={() => handleMenuClick("mypage-sub-3")}
                  className="p-5 text-center transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:shadow-md hover:border-blue-400 cursor-pointer"
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full">
                      <span className="text-2xl">📝</span>
                    </div>
                  </div>
                  <div className="mb-1 text-sm font-medium text-gray-600">
                    지원 현황
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.appliedJobs}
                  </div>
                </button>

                <button
                  onClick={() => handleMenuClick("mypage-sub-4")}
                  className="p-5 text-center transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:shadow-md hover:border-blue-400 cursor-pointer"
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full">
                      <span className="text-2xl">🏢</span>
                    </div>
                  </div>
                  <div className="mb-1 text-sm font-medium text-gray-600">
                    기업의 요청
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.receivedOffers}
                  </div>
                </button>

                <button
                  onClick={() => handleMenuClick("mypage-sub-5")}
                  className="p-5 text-center transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:shadow-md hover:border-blue-400 cursor-pointer"
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full">
                      <span className="text-2xl">⭐</span>
                    </div>
                  </div>
                  <div className="mb-1 text-sm font-medium text-gray-600">
                    스크랩
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.bookmarkedJobs}
                  </div>
                </button>
              </div>
            </div>

            {/* ✅ 구직/매칭 섹션 */}
            <div className="p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-5">
                
                {/* 아이콘과 텍스트를 하나의 flex 컨테이너로 묶어 한 줄로 만듭니다 */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💼</span>
                  <h2 className="text-lg font-bold text-gray-900">구직/매칭</h2>
                </div>

              </div>
              <div className="grid grid-cols-4 gap-4">
                {/* 1. 매칭결과 리포트 */}
                <button
                  onClick={() => handleClick("매칭결과 리포트")}
                  className="flex flex-col items-center p-6 transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:shadow-md hover:border-blue-500 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center w-16 h-16 mb-3 bg-gray-100 rounded-lg">
                    <svg
                      className="w-8 h-8 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    매칭결과 리포트
                  </span>
                </button>

                {/* 2. 매칭 히스토리 */}
                <button
                  onClick={() => handleClick("매칭 히스토리")}
                  className="flex flex-col items-center p-6 transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:shadow-md hover:border-blue-500 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center w-16 h-16 mb-3 bg-gray-100 rounded-lg">
                    <svg
                      className="w-8 h-8 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    매칭 히스토리
                  </span>
                </button>

                {/* 3. 모의 면접 시작 */}
                <button
                  onClick={() => handleClick("모의 면접 시작")}
                  className="flex flex-col items-center p-6 transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:shadow-md hover:border-blue-500 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center w-16 h-16 mb-3 bg-gray-100 rounded-lg">
                    <svg
                      className="w-8 h-8 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    모의 면접 시작
                  </span>
                </button>

                {/* 4. 면접 히스토리 */}
                <button
                  onClick={() => handleClick("면접 히스토리")}
                  className="flex flex-col items-center p-6 transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:shadow-md hover:border-blue-500 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center w-16 h-16 mb-3 bg-gray-100 rounded-lg">
                    <svg
                      className="w-8 h-8 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    면접 히스토리
                  </span>
                </button>
              </div>
            </div>

            {/* 스크랩한 공고 섹션 */}
            <div className="p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <h2 className="text-lg font-bold text-gray-900">
                    스크랩한 공고
                  </h2>
                </div>
                <button
                  onClick={() => handleClick("스크랩 현황")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  더보기 &gt;
                </button>
              </div>

              {bookmarks.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="mb-4 text-5xl">⭐</div>
                  <p className="mb-4 text-gray-600 font-medium">
                    스크랩한 공고가 없습니다.
                  </p>
                  <button
                    onClick={() => handleMenuClick("job-sub-1")}
                    className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    공고 둘러보기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {bookmarks.slice(0, 4).map((bookmark) => (
                    <div
                      key={bookmark.bookmarkId}
                      onClick={() => handleJobClick(bookmark.jobPostingId)}
                      className="flex gap-4 p-4 transition-all duration-200 bg-white border border-gray-300 rounded-lg cursor-pointer hover:shadow-md hover:border-blue-500"
                    >
                      <div className="flex-1">
                        <h3 className="mb-2 font-bold text-gray-900">
                          {bookmark.title}
                        </h3>
                        <p className="mb-2 text-sm text-gray-600">
                          {bookmark.companyName}
                        </p>
                        <div className="flex gap-2 mb-2">
                          <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded">
                            {bookmark.location}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded">
                            {bookmark.experienceLevel}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          마감 {bookmark.deadline}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 내 이력서 섹션 */}
            <div className="p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📁</span>
                  <h3
                    className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => handleMenuClick("resume-sub-1")}
                  >
                    내 이력서 ({resumes.length}개)
                  </h3>
                </div>
                <button
                  onClick={() => handleMenuClick("resume-sub-1")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  더보기 &gt;
                </button>
              </div>

              <div className="space-y-4">
                {resumes.length === 0 ? (
                  <div className="p-12 text-center bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="mb-4 text-5xl">📄</div>
                    <p className="mb-4 font-medium text-gray-600">
                      등록된 이력서가 없습니다.
                    </p>
                    <button
                      onClick={() => handleMenuClick("resume-sub-1")}
                      className="px-6 py-2 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      이력서 작성하기
                    </button>
                  </div>
                ) : (
                  resumes.slice(0, 3).map((resume) => (
                    <div
                      key={(resume as any).id}
                      className="p-4 transition-all duration-200 bg-white border border-gray-300 rounded-lg hover:shadow-md hover:border-blue-500"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="mb-1 text-lg font-bold text-gray-900">
                            {(resume as any).title}
                          </h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMenuClick("resume-sub-1")}
                            className="px-4 py-2 text-sm font-medium text-gray-700 transition bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleMenuClick("resume-sub-1")}
                            className="px-6 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            이력서 공개
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 추천 공고 섹션 - 3개 */}
            <div className="p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏷️</span>
                  <h2 className="text-lg font-bold text-gray-900">추천 공고</h2>
                </div>
                <button
                  onClick={() => handleMenuClick("job-sub-1")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  더보기 &gt;
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {recommendedJobs.slice(0, 3).map((job) => {
                  const formatExperience = (min?: number, max?: number) => {
                    if (min === undefined && max === undefined) return "경력무관";
                    if (min === 0) return "신입";
                    if (max === undefined) return `${min}년 이상`;
                    return `${min}~${max}년`;
                  };

                  return (
                    <div
                      key={job.jobId}
                      onClick={() => handleJobClick(job.jobId)}
                      className="flex flex-col overflow-hidden transition bg-white border border-gray-300 shadow-sm cursor-pointer rounded-xl hover:shadow-xl hover:border-blue-400"
                    >
                      <div className="flex items-center justify-center h-16 bg-gradient-to-br from-gray-50 to-gray-100">
                        {job.logoUrl ? (
                          <img
                            src={job.logoUrl}
                            alt={job.companyName}
                            className="object-contain w-20 h-20"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/150?text=No+Logo";
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-20 h-20 text-2xl font-bold text-gray-400 bg-white rounded-lg">
                            {job.companyName?.charAt(0) || "회"}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col flex-1 p-5">
                        <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600">
                          {job.title}
                        </h3>

                        <p className="mb-3 text-sm font-medium text-gray-600">
                          {job.companyName}
                        </p>

                        <div className="mb-3 overflow-hidden rounded-lg">
                          {job.thumbnailUrl ? (
                            <img
                              src={job.thumbnailUrl}
                              alt={`${job.title} 썸네일`}
                              className="object-cover w-full h-40"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://via.placeholder.com/400x200?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-32 bg-gradient-to-br from-purple-50 to-blue-50">
                              <svg
                                className="w-12 h-12 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {job.location}
                          </span>

                          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {formatExperience(
                              (job as any).experienceMin,
                              (job as any).experienceMax,
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>👁️ {job.viewCount}</span>
                          <span>⭐ {job.bookmarkCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
