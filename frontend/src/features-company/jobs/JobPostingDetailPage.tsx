import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import {
  getJobPosting,
  deleteJobPosting,
  type JobPostingResponse,
} from "../../api/job";

export default function JobPostingDetailPage() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobPostingResponse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 공고 데이터 로드
  useEffect(() => {
    const loadJobPosting = async () => {
      if (!jobId) {
        alert("잘못된 접근입니다.");
        navigate("/company/jobs");
        return;
      }

      try {
        setLoading(true);
        const jobData = await getJobPosting(parseInt(jobId));
        setJob(jobData);
      } catch (error: any) {
        console.error("공고 조회 실패:", error);
        alert(
          error.response?.data?.message || "공고를 불러오는데 실패했습니다.",
        );
        navigate("/company/jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJobPosting();
  }, [jobId, navigate]);

  const handleApplicantsClick = () => {
    if (job?.jobId) {
      // 해당 공고의 지원자 목록으로 이동
      navigate(
        `/company/applicants?jobId=${job.jobId}&jobTitle=${encodeURIComponent(job.title)}`,
      );
    }
  };

  const handleBackClick = () => {
    navigate("/company/jobs");
  };

  // 헤더 삭제로 인해 사용되지 않지만 인터페이스 유지를 위해 남겨둠
  const handleLogoClick = () => {
    navigate("/company");
  };

  const handleEditClick = () => {
    if (jobId) {
      navigate(`/company/jobs/edit/${jobId}`);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobId || !user?.companyId) {
      alert("삭제 권한이 없습니다.");
      return;
    }

    try {
      await deleteJobPosting(parseInt(jobId), user.companyId);
      alert("공고가 삭제되었습니다.");
      setShowDeleteConfirm(false);
      navigate("/company/jobs");
    } catch (error: any) {
      console.error("공고 삭제 실패:", error);
      alert(error.response?.data?.message || "공고 삭제에 실패했습니다.");
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
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
        return "bg-gray-100 text-gray-700";
      case "EXPIRED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">
          공고를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
            <h3 className="mb-2 text-lg font-bold text-gray-900">공고 삭제</h3>
            <p className="mb-6 text-gray-600">
              정말로 이 공고를 삭제하시겠습니까?
              <br />
              공고 상태가 "마감"으로 변경되며, 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30">
        <div className="max-w-6xl px-4 py-8 mx-auto">
          {/* 뒤로가기 버튼 */}
          <button
            onClick={handleBackClick}
            className="flex items-center mb-6 text-gray-600 transition hover:text-purple-600 group"
          >
            <svg
              className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">목록으로 돌아가기</span>
          </button>

          {/* 헤더 카드 */}
          <div className="p-8 mb-6 bg-white shadow-lg rounded-3xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-4xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <span
                    className={`px-4 py-1.5 text-sm font-bold rounded-full ${getStatusColor(job.status)}`}
                  >
                    {getStatusText(job.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xl font-semibold text-black-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>{job.companyName}</span>
                </div>
              </div>
              <div className="flex gap-3">
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition shadow-lg rounded-xl bg-purple-600 hover:bg-gray-800"
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
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                수정
              </button>

                <button
                  onClick={handleDeleteClick}
                  disabled={job.status === "CLOSED" || job.status === "EXPIRED"}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold transition rounded-xl shadow-lg ${
                    job.status === "CLOSED" || job.status === "EXPIRED"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
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
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  삭제
                </button>

              </div>
            </div>

            {/* 주요 통계 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-6 transition bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-blue-700">
                    조회수
                  </div>
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-blue-700">
                  {job.viewCount}
                </div>
              </div>
              <button
                onClick={handleApplicantsClick}
                className="p-6 text-left transition bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl hover:shadow-md hover:from-purple-100 hover:to-purple-150"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-purple-700">
                    지원자 클릭 시 목록보기
                  </div>
                  <svg
                    className="w-5 h-5 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-purple-700">
                  {job.applicantCount}
                </div>
              </button>
              <div className="p-6 transition bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-orange-700">
                    북마크
                  </div>
                  <svg
                    className="w-5 h-5 text-orange-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-orange-700">
                  {job.bookmarkCount}
                </div>
              </div>
            </div>
          </div>

          {/* 공고 기본 정보 */}
          <div className="p-8 mb-6 bg-white shadow-md rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-xl">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">공고 정보</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 transition bg-gray-50 rounded-xl hover:bg-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <svg
                    className="w-5 h-5 text-black-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-sm font-medium text-gray-500">
                    회사명
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {job.companyName}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 transition bg-gray-50 rounded-xl hover:bg-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <svg
                    className="w-5 h-5 text-black-600"
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
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-sm font-medium text-gray-500">
                    직무
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {job.jobCategory}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 transition bg-gray-50 rounded-xl hover:bg-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <svg
                    className="w-5 h-5 text-black-600"
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
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-sm font-medium text-gray-500">
                    근무지
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {job.location}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 transition bg-gray-50 rounded-xl hover:bg-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <svg
                    className="w-5 h-5 text-black-600"
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
                <div className="flex-1">
                  <div className="mb-1 text-sm font-medium text-gray-500">
                    경력
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatExperience(job.experienceMin, job.experienceMax)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 transition bg-gray-50 rounded-xl hover:bg-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <svg
                    className="w-5 h-5 text-black-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-sm font-medium text-gray-500">
                    급여
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 transition bg-gray-50 rounded-xl hover:bg-gray-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <svg
                    className="w-5 h-5 text-black-600"
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
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-sm font-medium text-gray-500">
                    등록일 / 마감일
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {job.createdAt} ~ {job.deadline}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 공고 설명 */}
          {job.description && (
            <div className="p-8 mb-6 bg-white shadow-md rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                <h2 className="text-2xl font-bold text-gray-900">공고 설명</h2>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </div>
          )}

          {/* 홍보 이미지 */}
          {job.detailImageUrl && (
            <div className="p-8 mb-6 bg-white shadow-md rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  채용 포스터
                </h2>
              </div>
              <div className="overflow-hidden rounded-xl">
                <img
                  src={job.detailImageUrl}
                  alt="채용 포스터"
                  className="object-contain w-full"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/800x1200?text=Image+Not+Available";
                  }}
                />
              </div>
            </div>
          )}

          {/* 필수 스킬 */}
          {job.requiredSkills && (
            <div className="p-8 mb-6 bg-white shadow-md rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 rounded-xl">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">필수 스킬</h2>
                <span className="px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full">
                  Required
                </span>
              </div>
              <div className="p-6 bg-red-50 rounded-xl">
                <div className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {job.requiredSkills}
                </div>
              </div>
            </div>
          )}

          {/* 우대 스킬 */}
          {job.preferredSkills && (
            <div className="p-8 bg-white shadow-md rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">우대 스킬</h2>
                <span className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-full">
                  Preferred
                </span>
              </div>
              <div className="p-6 bg-green-50 rounded-xl">
                <div className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {job.preferredSkills}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
