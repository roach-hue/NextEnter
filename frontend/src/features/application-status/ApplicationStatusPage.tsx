import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import { useAuthStore } from "../../stores/authStore";
import {
  getMyApplications,
  ApplicationSummaryResponse,
} from "../../api/application";
import LeftSidebar from "../../components/LeftSidebar";
import { cancelApply } from "../../api/apply";

interface ApplicationStatusPageProps {
  initialMenu?: string;
  onNavigate?: (page: string, subMenu?: string) => void;
}

export default function ApplicationStatusPage({
  initialMenu: _initialMenu,
  onNavigate: _onNavigate,
}: ApplicationStatusPageProps) {
  const [searchParams] = useSearchParams();
  const menuFromUrl = searchParams.get("menu") || "mypage-sub-3";

  const { activeMenu, handleMenuClick } = usePageNavigation(
    "mypage",
    _initialMenu || menuFromUrl,
    _onNavigate,
  );

  const { user } = useAuthStore();
  const [applications, setApplications] = useState<
    ApplicationSummaryResponse[]
  >([]);
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const loadApplications = async () => {
      if (!user?.userId) return;

      try {
        setLoading(true);
        // 백엔드에서 이제 '일반 지원'만 내려줍니다.
        const data = await getMyApplications(user.userId);
        setApplications(data);
      } catch (error) {
        console.error("지원 내역 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [user?.userId]);

  // 날짜 포맷 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const datePart = dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;
    return datePart.replace(/-/g, ". ");
  };

  // ✅ [수정] 면접 제안(INTERVIEW_OFFER) 관련 상태 로직 삭제 -> 오직 지원(APPLICATION) 상태만 처리
  const getApplicationStatus = (app: ApplicationSummaryResponse): string => {
    const { status, documentStatus, finalStatus } = app;

    if (finalStatus === "PASSED") return "합격";
    if (finalStatus === "REJECTED") return "불합격";
    if (finalStatus === "CANCELED") return "지원취소";

    // 일반 지원 상태 처리
    if (documentStatus === "PASSED") return "서류합격";
    if (documentStatus === "REJECTED") return "서류불합격";
    if (documentStatus === "REVIEWING") return "서류검토중";
    if (documentStatus === "PENDING") return "서류심사 대기";

    // 레거시 상태 처리
    if (status === "ACCEPTED") return "합격";
    if (status === "REJECTED") return "불합격";
    if (status === "CANCELED") return "지원취소";

    return "서류심사 중";
  };

  // 필터 상태들
  const [period, setPeriod] = useState("3개월");
  const [status, setStatus] = useState("전체");
  const [businessType, setBusinessType] = useState("전체");
  const [industry, setIndustry] = useState("전체");
  const [startDate, setStartDate] = useState("2025-10-09");
  const [endDate, setEndDate] = useState("2026-01-07");
  const [searchKeyword, setSearchKeyword] = useState("");

  const stats = useMemo(() => {
    const total = applications.length;
    const documentPass = applications.filter(
      (app) => app.documentStatus === "PASSED",
    ).length;
    const pass = applications.filter(
      (app) => app.finalStatus === "PASSED" || app.status === "ACCEPTED",
    ).length;
    const fail = applications.filter(
      (app) =>
        app.finalStatus === "REJECTED" ||
        app.status === "REJECTED" ||
        app.documentStatus === "REJECTED",
    ).length;

    return { total, documentPass, pass, fail };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (status !== "전체") {
        const appStatus = getApplicationStatus(app);
        if (appStatus !== status) return false;
      }
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        const matchCompany =
          app.companyName?.toLowerCase().includes(keyword) || false;
        const matchPosition =
          app.jobTitle?.toLowerCase().includes(keyword) || false;
        if (!matchCompany && !matchPosition) return false;
      }
      return true;
    });
  }, [applications, status, searchKeyword]);

  const handleSearch = () => console.log("검색 실행");

  // ✅ [수정] '일반 지원 취소' 로직만 남김
  const handleCancel = async (id: number) => {
    if (!user?.userId) return;
    if (!window.confirm("정말 취소하시겠습니까?")) return;

    try {
      console.log(`🚀 [Front] 지원 취소 요청: applyId=${id}`);
      await cancelApply(id, user.userId);

      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                status: "CANCELED",
                finalStatus: "CANCELED",
                documentStatus: "CANCELED",
              }
            : app,
        ),
      );
      alert("취소되었습니다.");
    } catch (error) {
      console.error("취소 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  // ✅ [수정] '일반 지원' 취소 버튼만 렌더링
  const renderCancelButton = (app: ApplicationSummaryResponse) => {
    // 대기 상태일 때만 취소 가능
    if (app.status === "PENDING" || app.documentStatus === "PENDING") {
      return (
        <button
          onClick={() => handleCancel(app.id)}
          className="text-sm text-red-600 underline hover:text-red-700 whitespace-nowrap"
        >
          지원취소
        </button>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="flex gap-6">
          <LeftSidebar
            title="지원 현황"
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
          />

          <div className="flex-1">
            {/* 통계 카드 */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="flex flex-col items-center justify-center bg-white border-2 border-white p-9 rounded-2xl">
                <div className="flex items-center justify-center w-24 h-24 mb-3 text-4xl font-bold text-white bg-blue-500 rounded-full">
                  {stats.total}
                </div>
                <div className="text-lg font-semibold text-gray-700">
                  지원완료
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-white border-2 border-white p-9 rounded-2xl">
                <div className="flex items-center justify-center w-24 h-24 mb-3 text-4xl font-bold text-white bg-blue-500 rounded-full">
                  {stats.documentPass}
                </div>
                <div className="text-lg font-semibold text-gray-700">
                  서류합격
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-white border-2 border-white p-9 rounded-2xl">
                <div className="flex items-center justify-center w-24 h-24 mb-3 text-4xl font-bold text-white bg-blue-500 rounded-full">
                  {stats.pass}
                </div>
                <div className="text-lg font-semibold text-gray-700">합격</div>
              </div>
              <div className="flex flex-col items-center justify-center bg-white border-2 border-white p-9 rounded-2xl">
                <div className="flex items-center justify-center w-24 h-24 mb-3 text-4xl font-bold text-white bg-blue-500 rounded-full">
                  {stats.fail}
                </div>
                <div className="text-lg font-semibold text-gray-700">
                  불합격
                </div>
              </div>
            </div>

            {/* 검색 필터 */}
            <div className="p-6 mb-6 bg-white border-2 border-gray-200 rounded-2xl">
              <div className="flex items-center gap-4 pb-4 mb-4 border-b border-gray-200">
                <div className="w-20 font-medium text-gray-700 whitespace-nowrap">
                  조회기간
                </div>
                <div className="flex gap-2">
                  {["1주일", "1개월", "2개월", "3개월", "날짜지정"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-4 py-2 text-sm rounded-lg transition whitespace-nowrap ${period === p ? "bg-blue-600 text-white font-semibold" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="text-gray-500">~</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <label className="w-20 text-sm font-medium text-gray-700 whitespace-nowrap">
                    진행상태
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="전체">전체</option>
                    <option value="서류심사 대기">서류심사 대기</option>
                    <option value="서류합격">서류합격</option>
                    <option value="합격">합격</option>
                    <option value="불합격">불합격</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-20 text-sm font-medium text-gray-700 whitespace-nowrap">
                    마감여부
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="전체">전체</option>
                    <option value="영업중">영업중</option>
                    <option value="영업종료">영업종료</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-20 text-sm font-medium text-gray-700 whitespace-nowrap">
                    지원분야
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="전체">전체</option>
                    <option value="IT">IT</option>
                    <option value="제조">제조</option>
                    <option value="서비스">서비스</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="기업명, 채용제목"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleSearch}
                  className="px-8 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                >
                  검색
                </button>
              </div>
            </div>

            {/* 지원 내역 테이블 */}
            {loading ? (
              <div className="p-12 text-center bg-white border-2 border-gray-200 rounded-2xl">
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-12 text-center bg-white border-2 border-gray-200 rounded-2xl">
                <div className="mb-4 text-4xl">📋</div>
                <p className="mb-4 text-gray-600">지원 내역이 없습니다.</p>
                <button
                  onClick={() => handleMenuClick("job-sub-1")}
                  className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  채용공고 보러가기
                </button>
              </div>
            ) : (
              <div className="overflow-hidden bg-white border-2 border-gray-200 rounded-2xl">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50">
                    <tr className="border-b-2 border-gray-200">
                      {/* ✅ [수정] 유형 컬럼 삭제 */}
                      <th className="w-32 px-4 py-3 text-sm font-semibold text-center text-gray-700 whitespace-nowrap">
                        지원일
                      </th>
                      <th className="w-40 px-4 py-3 text-sm font-semibold text-center text-gray-700 whitespace-nowrap">
                        회사명
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                        지원내역
                      </th>
                      <th className="w-32 px-4 py-3 text-sm font-semibold text-center text-gray-700 whitespace-nowrap">
                        진행상태
                      </th>
                      <th className="w-32 px-4 py-3 text-sm font-semibold text-center text-gray-700 whitespace-nowrap">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => {
                      const appStatus = getApplicationStatus(app);
                      const statusColor =
                        appStatus === "합격"
                          ? "bg-purple-100 text-purple-700"
                          : appStatus === "서류합격"
                            ? "bg-green-100 text-green-700"
                            : appStatus.includes("불합격") ||
                                appStatus.includes("취소")
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700";

                      return (
                        <tr key={app.id} className="border-b border-gray-200">
                          {/* ✅ [수정] 유형 데이터 셀 삭제 */}
                          <td className="px-4 py-4 text-sm text-center text-gray-700 whitespace-nowrap">
                            {formatDate(app.appliedAt)}
                          </td>
                          <td className="px-4 py-4 overflow-hidden text-sm font-medium text-center text-gray-700 whitespace-nowrap text-ellipsis">
                            {app.companyName || "알 수 없음"}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {/* ✅ [수정] 줄바꿈 방지 및 말줄임 처리 */}
                            <div
                              className="mb-1 font-semibold text-gray-900 truncate"
                              title={app.jobTitle}
                            >
                              {app.jobTitle}
                            </div>
                            <div
                              className="text-xs text-gray-500 truncate"
                              title={`${app.jobCategory} | ${app.location || "미지정"}`}
                            >
                              {app.jobCategory} | {app.location || "미지정"}
                            </div>
                            <div className="text-xs text-gray-400">
                              마감: {formatDate(app.deadline) || "미지정"}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                            >
                              {appStatus}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            {renderCancelButton(app)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
