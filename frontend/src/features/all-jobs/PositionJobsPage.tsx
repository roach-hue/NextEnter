import { useState } from "react";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import { useResumeStore } from "../../stores/resumeStore";
import { useJobStore } from "../../stores/jobStore";
// ✅ [수정] LeftSidebar 사용
import LeftSidebar from "../../components/LeftSidebar";

interface PositionJobsPageProps {
  onLogoClick?: () => void;
  onNavigateToAll?: () => void;
  onNavigateToAI?: () => void;
  onNavigateToLocation?: () => void;
}

type JobListing = {
  id: number;
  company: string;
  title: string;
  requirements: string[];
  tags: string[];
  location: string;
  deadline: string;
  daysLeft: number;
  position: string;
};

// ✅ [수정] 안 쓰는 props 제거
export default function PositionJobsPage() {
  const { activeMenu, handleMenuClick } = usePageNavigation("job", "job-sub-3");

  const [selectedPosition, setSelectedPosition] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);

  // AppContext에서 데이터 가져오기
  const { resumes } = useResumeStore();
  const { jobListings, businessJobs } = useJobStore();

  // businessJobs를 JobListing 형식으로 변환
  const convertedBusinessJobs: JobListing[] = businessJobs.map((job) => {
    const deadline = new Date(job.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: job.id,
      company: "등록 기업",
      title: job.title,
      requirements: [],
      tags: [job.job_category],
      location: job.location,
      deadline: job.deadline,
      daysLeft: daysLeft > 0 ? daysLeft : 0,
      position: job.job_category, // 직무 분류
    };
  });

  // 기업 공고와 일반 공고 통합
  const allJobListings = [...jobListings, ...convertedBusinessJobs];

  const totalJobs = allJobListings.length;
  const totalPages = Math.ceil(totalJobs / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalJobs);
  const currentJobs = allJobListings;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApply = (jobId: number) => {
    if (confirm("입사지원 하시겠습니까?")) {
      setSelectedJobId(jobId);
      setShowResumeModal(true);
    }
  };

  const handleResumeSelect = (resumeId: number) =>
    setSelectedResumeId(resumeId);

  const handleFinalSubmit = () => {
    if (!selectedResumeId) {
      alert("이력서를 선택해주세요.");
      return;
    }
    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    if (confirm(`"${selectedResume?.title}"로 지원하시겠습니까?`)) {
      console.log(
        `공고 ${selectedJobId}에 이력서 ${selectedResumeId}로 지원하기`,
      );
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

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const positions = [
    "전체",
    "프론트엔드",
    "백엔드",
    "풀스택",
    "디자이너",
    "PM",
    "AI 엔지니어",
  ];

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

      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-8 mx-auto max-w-7xl">
          {/* ✅ [수정] 제목(h1) 제거 (사이드바 title로 이동) */}

          {/* ✅ [수정] items-start 추가 (Sticky 적용) */}
          <div className="flex items-start gap-6">
            {/* ✅ [수정] JobsSidebar -> LeftSidebar 교체 & Title 적용 */}
            <LeftSidebar
              title="채용정보"
              activeMenu={activeMenu}
              onMenuClick={handleMenuClick}
            />

            {/* 메인 컨텐츠 */}
            <div className="flex-1 space-y-8">
              <section className="p-8 bg-white border-2 border-gray-200 rounded-2xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">직무별 채용정보</h2>
                </div>

                <div className="p-4 mb-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {positions.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setSelectedPosition(pos)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition ${
                          selectedPosition === pos
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <p className="text-lg text-gray-600">
                    총{" "}
                    <span className="font-bold text-blue-600">{totalJobs}</span>
                    건
                  </p>
                </div>

                <div className="space-y-4">
                  {currentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-6 transition bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2 space-x-2">
                            <span className="text-sm font-medium text-gray-600">
                              {job.company}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded border border-blue-100">
                              {job.position}
                            </span>
                          </div>
                          <h3 className="mb-3 text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                            {job.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{job.location}</span>
                            <span>{job.deadline}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <button
                            onClick={() => handleApply(job.id)}
                            className="px-6 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            입사지원
                          </button>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium text-blue-600">
                              D-{job.daysLeft}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center mt-8 space-x-2">
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white font-bold"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
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
