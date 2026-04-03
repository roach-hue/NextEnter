import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CompanyLeftSidebar from "../components/CompanyLeftSidebar";
import { useCompanyPageNavigation } from "../hooks/useCompanyPageNavigation";
import { getJobPostings, type JobPostingListResponse } from "../../api/job";

import JobSearchFilter, { SearchFilters } from "./components/CompanySearchFilter";

export default function AllJobPostingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeMenu, handleMenuClick } = useCompanyPageNavigation(
    "jobs",
    "jobs-sub-1",
  );

  const reloadParam = searchParams.get("reload");

  // 데이터 상태
  const [jobPostings, setJobPostings] = useState<JobPostingListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 필터 상태
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    regions: [],
    jobCategories: [],
    status: "전체",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  // 공고 목록 조회 API 호출
  useEffect(() => {
    const loadJobPostings = async () => {
      try {
        setLoading(true);

        const params: any = {
          page: currentPage,
          size: itemsPerPage,
        };

        // 필터 적용
        if (filters.keyword) params.keyword = filters.keyword;
        if (filters.regions.length > 0) params.regions = filters.regions.join(",");
        if (filters.jobCategories.length > 0)
          params.jobCategories = filters.jobCategories.join(",");
        if (filters.status && filters.status !== "전체") params.status = filters.status;

        const response = await getJobPostings(params);
        setJobPostings(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error("공고 목록 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJobPostings();
  }, [currentPage, filters, itemsPerPage, reloadParam]);

  // D-Day 계산 함수 (null이면 null 반환)
  const getDaysLeft = (deadline: string | null | undefined): number | null => {
    if (!deadline) return null;
    const today = new Date();
    const end = new Date(deadline);
    if (isNaN(end.getTime())) return null;
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // 공고 클릭 핸들러
  const handleJobClick = (jobId: number) => {
    navigate(`/company/jobs/${jobId}`);
  };

  // 경력 정보 포맷팅
  const formatExperience = (min?: number, max?: number) => {
    if (min === undefined && max === undefined) return "경력무관";
    if (min === 0) return "신입";
    if (max === undefined) return `${min}년 이상`;
    return `${min}~${max}년`;
  };

  // 상태 배지 컴포넌트
  const getStatusBadge = (status: string) => {
    const getStatusText = (status: string) => {
      switch (status) {
        case "ACTIVE":
          return "진행중";
        case "CLOSED":
          return "마감";
        case "EXPIRED":
          return "기간만료";
        default:
          return status;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "ACTIVE":
          return "bg-green-100 text-green-700";
        case "CLOSED":
          return "bg-gray-100 text-gray-600";
        case "EXPIRED":
          return "bg-red-100 text-red-700";
        default:
          return "bg-gray-100 text-gray-600";
      }
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
          status,
        )}`}
      >
        {getStatusText(status)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex gap-6 px-4 py-8 mx-auto max-w-7xl">
        {/* 사이드바 */}
        <div className="w-64 shrink-0">
          <CompanyLeftSidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />
        </div>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 space-y-8">
          {/* 필터 컴포넌트 */}
          <JobSearchFilter onFilterChange={handleFilterChange} />

          {/* 공고 리스트 섹션 */}
          <div className="p-8 bg-white border border-gray-300 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                전체 채용공고{" "}
                <span className="text-purple-600">{totalElements}</span>건
              </h2>
              <div className="flex items-center gap-3">
                {/* 검색창 */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setFilters({ ...filters, keyword: searchQuery });
                        setCurrentPage(0);
                      }
                    }}
                    placeholder="기업명, 공고제목 등 검색"
                    className="w-80 pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  <svg
                    className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* 개수 선택 드롭다운 */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer"
                >
                  <option value={10}>10개씩</option>
                  <option value={20}>20개씩</option>
                  <option value={30}>30개씩</option>
                  <option value={40}>40개씩</option>
                  <option value={50}>50개씩</option>
                </select>
              </div>
            </div>

            {/* 공고 리스트 */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="py-20 text-center text-gray-500 col-span-full">
                  로딩 중...
                </div>
              ) : jobPostings.length === 0 ? (
                <div className="py-20 text-center text-gray-500 col-span-full">
                  등록된 공고가 없습니다.
                </div>
              ) : (
                jobPostings.map((job) => {
                  const daysLeft = getDaysLeft(job.deadline);

                  return (
                    <div
                      key={job.jobId}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleJobClick(job.jobId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleJobClick(job.jobId);
                        }
                      }}
                      className="flex flex-col overflow-hidden transition bg-white border border-gray-300 shadow-sm cursor-pointer rounded-xl hover:shadow-xl hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {/* 로고 영역 */}
                      <div className="flex items-center justify-center h-12 bg-gradient-to-br from-gray-50 to-gray-100">
                        {job.logoUrl ? (
                          <img
                            src={job.logoUrl}
                            alt={job.companyName}
                            className="object-contain w-16 h-16"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/150?text=No+Logo";
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-gray-400 bg-white rounded-lg">
                            {job.companyName?.charAt(0) || "회"}
                          </div>
                        )}
                      </div>

                      {/* 내용 영역 */}
                      <div className="flex flex-col flex-1 p-4">
                        {/* 직무명 */}
                        <h3 className="mb-1.5 text-lg font-bold text-gray-900 line-clamp-2 hover:text-purple-600">
                          {job.title}
                        </h3>

                        {/* 회사명 */}
                        <p className="mb-2 text-sm font-medium text-gray-600">
                          {job.companyName}
                        </p>

                        {/* 썸네일 이미지 */}
                        <div className="mb-2 overflow-hidden rounded-lg">
                          {job.thumbnailUrl ? (
                            <img
                              src={job.thumbnailUrl}
                              alt={`${job.title} 썸네일`}
                              className="object-cover w-full h-48"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://via.placeholder.com/400x200?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-48 bg-gradient-to-br from-purple-50 to-blue-50">
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

                        {/* 정보 태그 */}
                        <div className="flex flex-wrap gap-2 mb-2">
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
                            {formatExperience(job.experienceMin, job.experienceMax)}
                          </span>
                          {getStatusBadge(job.status)}
                        </div>

                        {/* 통계 정보 */}
                        <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
                          <span>👁️ {job.viewCount}</span>
                          <span>📝 {job.applicantCount}</span>
                          <span>⭐ {job.bookmarkCount}</span>
                        </div>

                        {/* 하단 정보 */}
                        <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-xs text-gray-600">
                              {job.deadline ? `~ ${job.deadline}` : "마감일 미정"}
                            </span>
                          </div>

                          {/* D-Day 배지 */}
                          {daysLeft !== null && (
                          <div
                            className={`px-3 py-1 text-xs font-bold rounded-lg ${
                              daysLeft <= 0
                                ? "bg-gray-100 text-gray-500"
                                : daysLeft <= 7
                                  ? "bg-red-50 text-red-600"
                                  : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {daysLeft > 0
                              ? `D-${daysLeft}`
                              : daysLeft === 0
                                ? "D-Day"
                                : `D+${Math.abs(daysLeft)}`}
                          </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {"<<"}
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                {(() => {
                  const pages = [];
                  const maxShow = 10;
                  let start = Math.max(0, currentPage - Math.floor(maxShow / 2));
                  let end = Math.min(totalPages - 1, start + maxShow - 1);
                  if (end - start < maxShow - 1) {
                    start = Math.max(0, end - maxShow + 1);
                  }
                  for (let i = start; i <= end; i++) pages.push(i);
                  return pages.map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        currentPage === p
                          ? "bg-purple-600 text-white font-bold"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {p + 1}
                    </button>
                  ));
                })()}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  다음
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {">>"}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
