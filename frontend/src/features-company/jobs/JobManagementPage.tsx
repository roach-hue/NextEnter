import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import CompanyLeftSidebar from "../components/CompanyLeftSidebar";
import { useCompanyPageNavigation } from "../hooks/useCompanyPageNavigation";
import {
  getJobPostings,
  updateJobPostingStatus,
  deleteJobPosting,
  type JobPostingListResponse,
} from "../../api/job";

// ✅ 페이지 크기 상수
const PAGE_SIZE = 20;
const MAX_PAGES_TO_LOAD = 5;

const cacheKey = (companyId: number) => `company_job_cache_v1_${companyId}`;
const deletedKey = (companyId: number) => `company_job_deleted_v1_${companyId}`;

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// ✅ 캐시용 간소화된 타입 정의
interface CachedJob {
  jobId: number;
  title: string;
  status: string;
  location: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  applicantCount?: number;
  viewCount?: number;
  bookmarkCount?: number;
  createdAt: string;
  companyId: number;
}

// ✅ 전체 객체를 간소화된 객체로 변환
function simplifyJob(job: JobPostingListResponse): CachedJob {
  return {
    jobId: job.jobId,
    title: job.title,
    status: job.status,
    location: job.location,
    experienceMin: job.experienceMin,
    experienceMax: job.experienceMax,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    applicantCount: job.applicantCount,
    viewCount: job.viewCount,
    bookmarkCount: job.bookmarkCount,
    createdAt: job.createdAt,
    companyId: job.companyId,
  };
}

function loadCachedJobs(companyId: number): CachedJob[] {
  return safeParse<CachedJob[]>(
    localStorage.getItem(cacheKey(companyId)),
    [],
  );
}

// ✅ 캐시 저장 시 try-catch로 감싸고 용량 초과 시 기존 캐시 삭제
function saveCachedJobs(companyId: number, jobs: JobPostingListResponse[]) {
  try {
    const simplified = jobs.map(simplifyJob);
    localStorage.setItem(cacheKey(companyId), JSON.stringify(simplified));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded. Clearing cache and retrying...');
      // 기존 캐시 삭제 후 재시도
      localStorage.removeItem(cacheKey(companyId));
      try {
        const simplified = jobs.map(simplifyJob);
        localStorage.setItem(cacheKey(companyId), JSON.stringify(simplified));
      } catch (retryError) {
        console.error('Failed to save cache even after clearing:', retryError);
        // 캐시 저장 실패해도 앱은 계속 동작
      }
    } else {
      console.error('Failed to save cache:', error);
    }
  }
}

function loadDeletedIds(companyId: number): number[] {
  return safeParse<number[]>(localStorage.getItem(deletedKey(companyId)), []);
}

function saveDeletedIds(companyId: number, ids: number[]) {
  try {
    localStorage.setItem(deletedKey(companyId), JSON.stringify(ids));
  } catch (error) {
    console.error('Failed to save deleted IDs:', error);
  }
}

/**
 * 서버 + 캐시 병합 (삭제 tombstone 반영)
 */
function mergeJobs(
  serverJobs: JobPostingListResponse[],
  cachedJobs: CachedJob[],
  deletedIds: number[],
): JobPostingListResponse[] {
  const deletedSet = new Set(deletedIds);
  const map = new Map<number, JobPostingListResponse>();

  // 캐시 먼저 (삭제된 건 제외)
  for (const j of cachedJobs) {
    if (deletedSet.has(j.jobId)) continue;
    // CachedJob을 JobPostingListResponse로 변환
    map.set(j.jobId, j as any);
  }

  // 서버로 덮기 (삭제된 건 제외)
  for (const j of serverJobs) {
    if (deletedSet.has(j.jobId)) continue;

    const prev = map.get(j.jobId);
    // 캐시가 CLOSED인데 서버가 ACTIVE만 주는 상황이면 CLOSED 유지
    if (prev?.status === "CLOSED" && j.status !== "CLOSED") {
      map.set(j.jobId, { ...j, status: "CLOSED" });
    } else {
      map.set(j.jobId, j);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();
    return db - da;
  });
}

// ✅ 여러 페이지를 순차적으로 로드하는 함수
async function loadMultiplePages(
  maxPages: number,
  pageSize: number,
): Promise<JobPostingListResponse[]> {
  const allJobs: JobPostingListResponse[] = [];
  
  for (let page = 0; page < maxPages; page++) {
    try {
      let response: any;
      try {
        response = await getJobPostings({
          page,
          size: pageSize,
          status: "ALL",
        } as any);
      } catch {
        response = await getJobPostings({ page, size: pageSize });
      }
      
      const jobs = Array.isArray(response)
        ? response
        : (response.content ?? []);
      
      if (jobs.length === 0) {
        break;
      }
      
      allJobs.push(...jobs);
      
      if (!Array.isArray(response) && response.last) {
        break;
      }
    } catch (error) {
      console.error(`Failed to load page ${page}:`, error);
      break;
    }
  }
  
  return allJobs;
}

export default function JobManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const { activeMenu, handleMenuClick } = useCompanyPageNavigation(
    "jobs",
    "jobs-sub-2",
  );

  const reloadParam = searchParams.get("reload");

  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const [jobs, setJobs] = useState<JobPostingListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // 목록 로드
  useEffect(() => {
    const loadJobPostings = async () => {
      if (!user?.companyId) {
        alert("기업 정보를 찾을 수 없습니다.");
        navigate("/company/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const companyId = user.companyId;

        const cached = loadCachedJobs(companyId);
        const deletedIds = loadDeletedIds(companyId);

        // ✅ 여러 페이지를 순차적으로 로드
        const allServerJobs = await loadMultiplePages(MAX_PAGES_TO_LOAD, PAGE_SIZE);
        
        // ✅ 해당 기업의 공고만 필터링
        const myServerJobs = allServerJobs.filter(
          (job: JobPostingListResponse) => job.companyId === companyId,
        );

        const merged = mergeJobs(myServerJobs, cached, deletedIds);

        setJobs(merged);
        saveCachedJobs(companyId, merged);
      } catch (err: any) {
        console.error("공고 목록 조회 실패:", err);
        setError("공고 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadJobPostings();
  }, [user, navigate, reloadParam]);

  const handleNewJob = () => navigate("/company/jobs/create");
  const handleJobClick = (jobId: number) => navigate(`/company/jobs/${jobId}`);

  const handleApplicantsClick = (
    e: React.MouseEvent,
    job: JobPostingListResponse,
  ) => {
    e.stopPropagation();
    navigate(
      `/company/applicants?jobId=${job.jobId}&jobTitle=${encodeURIComponent(
        job.title,
      )}`,
    );
  };

  const handleEdit = (jobId: number) => navigate(`/company/jobs/edit/${jobId}`);

  const handleClose = async (jobId: number) => {
    if (!user?.companyId) return;
    const companyId = user.companyId;

    const job = jobs.find((j) => j.jobId === jobId);
    if (!job) return;

    if (job.status === "CLOSED") return alert("이미 마감된 공고입니다.");
    if (job.status === "EXPIRED") return alert("기간만료된 공고입니다.");

    const applicantCount = job.applicantCount || 0;

    const ok = window.confirm(
      `"${job.title}" 공고를 마감하시겠습니까?\n\n` +
        `현재 지원자: ${applicantCount}명\n` +
        `마감 후에는 다시 활성화할 수 없습니다.`,
    );
    if (!ok) return;

    try {
      await updateJobPostingStatus(jobId, companyId, "CLOSED");

      setJobs((prev) => {
        const next = prev.map((j) =>
          j.jobId === jobId ? { ...j, status: "CLOSED" } : j,
        );
        saveCachedJobs(companyId, next);
        return next;
      });

      alert("공고가 마감되었습니다.");
    } catch (err: any) {
      console.error("공고 마감 실패:", err);
      alert(err.response?.data?.message || "공고 마감에 실패했습니다.");
    }
  };

  /**
   * ✅ 삭제: state 제거 + 캐시 제거 + tombstone(삭제 목록) 저장
   * - 서버가 실제로 삭제가 아니라 CLOSED로 바꾸더라도, 프론트에서는 "완전 삭제처럼" 안 보이게 유지 가능
   */
  const handleDelete = async (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.companyId) return;
    const companyId = user.companyId;

    const job = jobs.find((j) => j.jobId === jobId);
    if (!job) return;

    const ok = window.confirm(
      `"${job.title}" 공고를 삭제하시겠습니까?\n\n삭제 후 목록에서 완전히 사라집니다.`,
    );
    if (!ok) return;

    try {
      await deleteJobPosting(jobId, companyId);

      // tombstone 저장 + state/캐시 제거
      const prevDeleted = loadDeletedIds(companyId);
      const nextDeleted = Array.from(new Set([...prevDeleted, jobId]));
      saveDeletedIds(companyId, nextDeleted);

      setJobs((prev) => {
        const next = prev.filter((j) => j.jobId !== jobId);
        saveCachedJobs(companyId, next);
        return next;
      });

      alert("공고가 삭제되었습니다.");
    } catch (err: any) {
      console.error("공고 삭제 실패:", err);
      alert(err.response?.data?.message || "공고 삭제에 실패했습니다.");
    }
  };

  const handleBulkDelete = async () => {
    if (!user?.companyId || selectedIds.length === 0) return;
    const companyId = user.companyId;

    const ok = window.confirm(
      `선택한 ${selectedIds.length}개의 공고를 삭제하시겠습니까?\n\n삭제 후 목록에서 완전히 사라집니다.`,
    );
    if (!ok) return;

    try {
      for (const jobId of selectedIds) {
        await deleteJobPosting(jobId, companyId);
      }

      const prevDeleted = loadDeletedIds(companyId);
      const nextDeleted = Array.from(new Set([...prevDeleted, ...selectedIds]));
      saveDeletedIds(companyId, nextDeleted);

      setJobs((prev) => {
        const next = prev.filter((j) => !selectedIds.includes(j.jobId));
        saveCachedJobs(companyId, next);
        return next;
      });

      setSelectedIds([]);
      alert("선택한 공고가 삭제되었습니다.");
    } catch (err: any) {
      console.error("공고 삭제 실패:", err);
      alert(err.response?.data?.message || "공고 삭제에 실패했습니다.");
    }
  };

  const toggleSelect = (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId],
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentIds = filteredJobs.map((j) => j.jobId);
      setSelectedIds(Array.from(new Set([...selectedIds, ...currentIds])));
    } else {
      const currentIds = filteredJobs.map((j) => j.jobId);
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    }
  };

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
        return "bg-gray-200 text-gray-700";
      case "EXPIRED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
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
    return `${min?.toLocaleString()} ~ ${max?.toLocaleString()}만원`;
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const statusMatch =
        selectedStatus === "전체" ||
        (selectedStatus === "진행중" && job.status === "ACTIVE") ||
        (selectedStatus === "마감" && job.status === "CLOSED") ||
        (selectedStatus === "기간만료" && job.status === "EXPIRED");

      const searchMatch =
        searchQuery.trim() === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [jobs, selectedStatus, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex px-4 py-8 mx-auto max-w-7xl">
        <CompanyLeftSidebar
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
        />

        <div className="flex-1 pl-6">
          {error && (
            <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* 목록 컨테이너 */}
          <section className="bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden min-h-[600px] shadow-sm">
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-bold text-purple-600">
                    내 공고 관리{" "}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      총 {filteredJobs.length}건
                    </span>
                  </h3>
                  {selectedIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 text-sm font-medium text-gray-600 transition-all bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      선택 삭제 ({selectedIds.length})
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {filteredJobs.length > 0 && (
                    <label className="flex items-center gap-1.5 cursor-pointer select-none mr-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded cursor-pointer focus:ring-purple-500"
                        checked={
                          filteredJobs.length > 0 &&
                          filteredJobs.every((j) =>
                            selectedIds.includes(j.jobId),
                          )
                        }
                        onChange={handleSelectAll}
                      />
                      <span className="text-sm font-medium text-gray-600 hover:text-gray-900">
                        전체 선택
                      </span>
                    </label>
                  )}
                  <input
                    type="text"
                    placeholder="공고명 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors w-40"
                  />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-2 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  >
                    <option value="전체">전체 상태</option>
                    <option value="진행중">진행중</option>
                    <option value="마감">마감</option>
                    <option value="기간만료">기간만료</option>
                  </select>

                  {/* ✅ [추가됨] 새 공고 등록 버튼을 여기로 이동 */}
                  <button
                    onClick={handleNewJob}
                    className="px-4 py-1.5 text-xs font-bold text-white transition bg-purple-600 rounded hover:bg-purple-700 shadow-sm whitespace-nowrap"
                  >
                    + 새 공고 등록
                  </button>
                </div>
              </div>
            </div>

            {/* 목록 */}
            <div className="flex-1 divide-y divide-gray-100">
              {filteredJobs.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="mb-4 text-4xl">📭</div>
                  <p className="text-lg font-medium text-gray-500">
                    {jobs.length === 0
                      ? "등록된 공고가 없습니다"
                      : "검색 결과가 없습니다"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {jobs.length === 0
                      ? "새 공고를 등록해주세요"
                      : "다른 조건으로 검색해보세요"}
                  </p>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isInactive =
                    job.status === "CLOSED" || job.status === "EXPIRED";

                  return (
                    <div
                      key={job.jobId}
                      onClick={() => handleJobClick(job.jobId)}
                      onMouseEnter={() => setHoveredId(job.jobId)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`group flex items-center px-5 py-4 cursor-pointer transition-all duration-200 ${
                        hoveredId === job.jobId
                          ? "bg-purple-50/50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {/* 체크박스 */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center pr-5"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded cursor-pointer focus:ring-purple-500"
                          checked={selectedIds.includes(job.jobId)}
                          onChange={(e) => toggleSelect(job.jobId, e as any)}
                        />
                      </div>

                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <div className="flex items-center flex-1 min-w-0 gap-6">
                          {/* 상태 배지 */}
                          <div className="flex-shrink-0 w-20">
                            <span
                              className={`inline-flex items-center justify-center w-full px-2.5 py-1 text-xs font-medium rounded-md border whitespace-nowrap ${
                                job.status === "ACTIVE"
                                  ? "text-green-700 bg-green-50 border-green-200"
                                  : job.status === "CLOSED"
                                    ? "text-gray-700 bg-gray-100 border-gray-200"
                                    : "text-red-700 bg-red-50 border-red-200"
                              }`}
                            >
                              {getStatusText(job.status)}
                            </span>
                          </div>

                          {/* 공고 정보 */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-base font-bold text-gray-900 truncate transition-colors group-hover:text-purple-700">
                                {job.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{job.location}</span>
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
                              <span>
                                {formatExperience(
                                  job.experienceMin,
                                  job.experienceMax,
                                )}
                              </span>
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
                              <span>
                                {formatSalary(job.salaryMin, job.salaryMax)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 오른쪽: 통계 + 버튼 */}
                        <div className="flex items-center gap-6 ml-4">
                          {/* 통계 정보 */}
                          <div className="flex items-center gap-4 text-sm">
                            <button
                              onClick={(e) => handleApplicantsClick(e, job)}
                              className="text-center transition group/stat hover:scale-105"
                            >
                              <div className="font-bold text-purple-600 group-hover/stat:text-purple-700">
                                {job.applicantCount || 0}
                              </div>
                              <div className="text-xs text-gray-500 group-hover/stat:text-purple-600">
                                지원자
                              </div>
                            </button>

                            <div className="text-center">
                              <div className="font-bold text-gray-700">
                                {job.viewCount || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                조회수
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="font-bold text-gray-700">
                                {job.bookmarkCount || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                북마크
                              </div>
                            </div>
                          </div>

                          {/* 액션 버튼 */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(job.jobId);
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 transition bg-gray-100 rounded hover:bg-gray-200"
                            >
                              수정
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClose(job.jobId);
                              }}
                              disabled={isInactive}
                              className={`px-3 py-1.5 text-xs font-medium text-white transition rounded ${
                                isInactive
                                  ? "bg-gray-300 cursor-not-allowed"
                                  : "bg-red-500 hover:bg-red-600"
                              }`}
                            >
                              마감
                            </button>

                            {/* 휴지통 아이콘 */}
                            <button
                              onClick={(e) => handleDelete(job.jobId, e)}
                              className="p-2 text-gray-300 transition-all rounded-full hover:text-red-600 hover:bg-red-50"
                              title="삭제"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}