import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import LeftSidebar from "../../components/LeftSidebar";
import { useAuthStore } from "../../stores/authStore";
import {
  getBookmarkedJobs,
  toggleBookmark,
  type BookmarkedJobDto,
} from "../../api/bookmark";

export default function ScrapStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const menuFromUrl = searchParams.get("menu") || "mypage-sub-5";

  const { activeMenu, handleMenuClick } = usePageNavigation(
    "mypage",
    menuFromUrl,
  );

  const [sortOrder, setSortOrder] = useState("스크랩일");
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [scrapJobs, setScrapJobs] = useState<BookmarkedJobDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 데이터 로드
  const loadScraps = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);

      // 1. 드롭다운 한글 값을 백엔드가 이해하는 영어로 변환
      // 마감임박 -> deadline 오름차순 (asc)
      // 스크랩일 -> createdAt 내림차순 (desc)
      const sortParam =
        sortOrder === "마감임박" ? "deadline,asc" : "createdAt,desc";

      console.log("보내는 정렬 파라미터:", sortParam); // 디버깅용 로그

      // 2. API 호출 시 4번째 인자로 sortParam을 꼭 전달해야 함!
      const data = await getBookmarkedJobs(user.userId, page, 10, sortParam);

      setScrapJobs(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("스크랩 목록 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 정렬 변경 시 재호출
  useEffect(() => {
    loadScraps();
  }, [user, page, sortOrder]);

  const handleCheckboxToggle = (jobPostingId: number) => {
    setSelectedJobs((prev) =>
      prev.includes(jobPostingId)
        ? prev.filter((id) => id !== jobPostingId)
        : [...prev, jobPostingId],
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(scrapJobs.map((job) => job.jobPostingId));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleDelete = async () => {
    if (selectedJobs.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    if (
      window.confirm(
        `선택한 ${selectedJobs.length}개의 공고를 삭제하시겠습니까?`,
      )
    ) {
      try {
        await Promise.all(
          selectedJobs.map((jobId) => toggleBookmark(user!.userId, jobId)),
        );

        alert("삭제되었습니다.");
        setSelectedJobs([]);
        loadScraps();
      } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleJobClick = (jobId: number) => {
    navigate(`/user/jobs/${jobId}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return dateString.substring(0, 10);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        {/* ✅ [수정] items-start 추가 (Sticky 적용) */}
        <div className="flex items-start gap-6">
          <LeftSidebar
            title="스크랩 공고"
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
          />

          <div className="flex-1">
            <div className="bg-white rounded-lg">
              {/* 필터 영역 */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={
                        scrapJobs.length > 0 &&
                        scrapJobs.every((job) =>
                          selectedJobs.includes(job.jobPostingId),
                        )
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <span className="text-sm">전체선택</span>
                  </label>
                  <span className="text-sm text-gray-400">|</span>
                  <button
                    onClick={handleDelete}
                    className="text-sm text-gray-600 transition hover:text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                </div>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded"
                >
                  <option value="스크랩일">스크랩일</option>
                  <option value="마감임박">마감임박</option>
                </select>
              </div>

              {/* 공고 목록 리스트 */}
              <div className="divide-y">
                {loading ? (
                  <div className="py-20 text-center text-gray-500">
                    로딩 중...
                  </div>
                ) : scrapJobs.length === 0 ? (
                  <div className="py-20 text-center text-gray-500">
                    <div className="mb-4 text-4xl">📝</div>
                    <p>스크랩한 공고가 없습니다.</p>
                  </div>
                ) : (
                  scrapJobs.map((job) => (
                    <div
                      key={job.jobPostingId}
                      className="flex items-start gap-4 p-4 transition hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 mt-1 cursor-pointer"
                        checked={selectedJobs.includes(job.jobPostingId)}
                        onChange={() => handleCheckboxToggle(job.jobPostingId)}
                      />
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <h3 className="text-sm text-gray-600">
                            {job.companyName}
                          </h3>
                          <button className="text-yellow-400 cursor-default">
                            ★
                          </button>
                        </div>
                        <h2
                          onClick={() => handleJobClick(job.jobPostingId)}
                          className="mt-1 text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                        >
                          {job.title}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[job.experienceLevel, job.location, job.jobType]
                            .filter(Boolean)
                            .map((tag, index, arr) => (
                              <span
                                key={index}
                                className="text-xs text-gray-600"
                              >
                                {tag}
                                {index < arr.length - 1 && ", "}
                              </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>마감일: {formatDate(job.deadline)}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.bookmarkedAt ? formatDate(job.bookmarkedAt) : ""}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 0 && (
                <div className="flex justify-center gap-2 py-6">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`px-4 py-2 text-sm font-medium border rounded ${
                        page === i
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 text-xs text-gray-500 rounded-b-lg bg-gray-50">
                <p>
                  • 최근 3개월 이내에 스크랩한 채용정보를 보관해드릴 수
                  있습니다.
                </p>
                <p>• 마감된 채용공고는 목록에서 자동으로 정리될 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
