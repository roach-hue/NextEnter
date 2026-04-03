import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/LeftSidebar";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import { useAuthStore } from "../../stores/authStore";
import api from "../../api/axios"; // ✅ 기존 경로 유지 (건드리지 않음)
import {
  getMyOffers,
  acceptOffer,
  rejectOffer,
  deleteOffer,
  deleteOffersBulk,
  type InterviewOfferResponse,
} from "../../api/interviewOffer";

// ✅ 공고 상세 정보 타입 정의
interface JobDetail {
  jobId: number;
  title: string;
  companyName: string;
  location: string;
  experienceLevel: string;
  salary: string;
  deadline: string;
  description: string;
  jobCategory: string;
  createdAt: string;
  requiredSkills?: string;
  preferredSkills?: string;
}

interface InterviewOfferPageProps {
  initialMenu?: string;
  onNavigate?: (page: string, subMenu?: string) => void;
}

export default function InterviewOfferPage({
  initialMenu,
  onNavigate,
}: InterviewOfferPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeMenu, handleMenuClick } = usePageNavigation(
    "offer",
    initialMenu || "offer-sub-2",
    onNavigate,
  );
  const { user } = useAuthStore();

  // 상태 관리
  const [offers, setOffers] = useState<InterviewOfferResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // ✅ 선택된 공고의 상세 정보 상태
  const [relatedJob, setRelatedJob] = useState<JobDetail | null>(null);
  const [isJobLoading, setIsJobLoading] = useState(false);

  // 페이지네이션 및 선택 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.userId) loadOffers();
  }, [user?.userId, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [filterStatus, itemsPerPage]);

  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      setSelectedOfferId(Number(idParam));
    } else {
      setSelectedOfferId(null);
      setRelatedJob(null);
    }
  }, [searchParams]);

  // ✅ 제안을 클릭했을 때, 해당 공고의 상세 정보를 서버에서 가져오는 로직
  useEffect(() => {
    const fetchJobInfo = async () => {
      if (selectedOfferId && offers.length > 0) {
        const offer = offers.find((o) => o.offerId === selectedOfferId);
        if (offer && offer.jobId) {
          setIsJobLoading(true);
          try {
            const response = await api.get(`/api/jobs/${offer.jobId}`);
            setRelatedJob(response.data);
          } catch (error) {
            console.error("공고 정보 로드 실패:", error);
          } finally {
            setIsJobLoading(false);
          }
        }
      }
    };
    fetchJobInfo();
  }, [selectedOfferId, offers]);

  const loadOffers = async () => {
    if (!user?.userId) return;
    const scrollPosition = listContainerRef.current?.scrollTop || 0;
    setIsLoading(true);
    try {
      const includeDeleted = filterStatus === "DELETED" ? true : undefined;
      const data = await getMyOffers(user.userId, includeDeleted);
      setOffers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (listContainerRef.current)
          listContainerRef.current.scrollTop = scrollPosition;
      }, 0);
    }
  };

  const handleOfferClick = (id: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("id", id.toString());
    setSearchParams(newParams);
  };

  const handleBackToList = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("id");
    setSearchParams(newParams);
  };

  // 핸들러들
  const handleAccept = async (offerId: number) => {
    if (!user?.userId) return;
    if (window.confirm("면접 제안을 수락하시겠습니까?")) {
      try {
        await acceptOffer(offerId, user.userId);
        alert("수락했습니다.");
        loadOffers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleReject = async (offerId: number) => {
    if (!user?.userId) return;
    if (window.confirm("면접 제안을 거절하시겠습니까?")) {
      try {
        await rejectOffer(offerId, user.userId);
        alert("거절했습니다.");
        loadOffers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDelete = async (offerId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.userId) return;
    if (window.confirm("삭제하시겠습니까?")) {
      try {
        await deleteOffer(offerId, user.userId);
        alert("삭제되었습니다.");
        loadOffers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!user?.userId || selectedIds.length === 0) return;
    if (window.confirm(`선택한 ${selectedIds.length}개를 삭제하시겠습니까?`)) {
      try {
        await deleteOffersBulk(selectedIds, user.userId);
        alert("일괄 삭제되었습니다.");
        setSelectedIds([]);
        loadOffers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const toggleSelect = (offerId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(offerId)
        ? prev.filter((id) => id !== offerId)
        : [...prev, offerId],
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentIds = currentOffers.map((o) => o.offerId);
      setSelectedIds(Array.from(new Set([...selectedIds, ...currentIds])));
    } else {
      const currentIds = currentOffers.map((o) => o.offerId);
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    }
  };

  // ✅ 데이터 가공 (최신순 정렬: ID 역순)
  const filteredOffers = offers
    .filter((offer) => {
      if (filterStatus === "DELETED") return offer.deleted === true;
      if (filterStatus === "ALL") return offer.deleted !== true;
      return offer.interviewStatus === filterStatus && offer.deleted !== true;
    })
    .sort((a, b) => b.offerId - a.offerId);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOffers = filteredOffers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    listContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const selectedOffer = offers.find((o) => o.offerId === selectedOfferId);

  // 헬퍼 함수
  const getStatusText = (status: string, finalResult?: string) => {
    switch (status) {
      case "OFFERED":
        return "면접 제안됨";
      case "ACCEPTED":
        return "면접 수락";
      case "REJECTED":
        return "거절함";
      case "SCHEDULED":
        return "결과 대기";
      case "COMPLETED":
        return finalResult === "PASSED"
          ? "합격"
          : finalResult === "REJECTED"
            ? "불합격"
            : "면접완료";
      case "CANCELED":
        return "제안취소";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string, finalResult?: string) => {
    switch (status) {
      case "OFFERED":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "ACCEPTED":
        return "text-green-700 bg-green-50 border-green-200";
      case "REJECTED":
        return "text-red-700 bg-red-50 border-red-200";
      case "SCHEDULED":
        return "text-purple-700 bg-purple-50 border-purple-200";
      default:
        return "text-gray-500 bg-gray-100 border-gray-200";
    }
  };

  // 기존 날짜 포맷 (리스트용)
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}. ${month}. ${day}. ${hour}:${minute}`;
  };

  // ✅ "공고 정보" 카드용 날짜 포맷 (YYYY. MM. DD)
  const formatYMD = (dateString?: string) => {
    if (!dateString) return "-";
    return dateString.split("T")[0].replace(/-/g, ". ");
  };

  const getDday = (deadline?: string) => {
    if (!deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / 86400000,
    );
    if (diff < 0) return { text: "마감", color: "text-gray-500" };
    if (diff <= 3)
      return {
        text: `D-${diff === 0 ? "day" : diff}`,
        color: "text-red-600 font-bold",
      };
    return { text: `D-${diff}`, color: "text-gray-600" };
  };

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <div className="flex gap-6">
        <LeftSidebar
          title="제안 현황"
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
        />
        <div className="flex-1">
          {selectedOfferId && selectedOffer ? (
            // 🟦 상세 화면
            <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-[600px] flex flex-col">
              {/* 헤더 */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToList}
                    className="p-2 -ml-2 text-gray-400 transition-colors rounded-full hover:text-gray-600 hover:bg-gray-100"
                    title="목록으로"
                  >
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedOffer.companyName}
                      </h2>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded border ${getStatusColor(selectedOffer.interviewStatus, selectedOffer.finalResult)}`}
                      >
                        {getStatusText(
                          selectedOffer.interviewStatus,
                          selectedOffer.finalResult,
                        )}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      {selectedOffer.jobTitle}{" "}
                      <span className="mx-2 text-gray-300">|</span>{" "}
                      {selectedOffer.jobCategory}
                    </p>
                  </div>
                </div>
                {selectedOffer.deadline && (
                  <div className="text-right">
                    <span className="block mb-1 text-xs text-gray-400">
                      모집 마감일
                    </span>
                    <span
                      className={`text-lg font-bold ${getDday(selectedOffer.deadline)?.color}`}
                    >
                      {selectedOffer.deadline}{" "}
                      <span className="text-sm font-normal text-gray-500">
                        ({getDday(selectedOffer.deadline)?.text})
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* 본문 */}
              <div className="flex-1 p-8 overflow-y-auto">
                {/* 1. 면접 제안 메시지 */}
                <div className="p-6 mb-10 border border-blue-100 bg-blue-50/50 rounded-xl">
                  <h3 className="flex items-center gap-2 mb-3 font-bold text-blue-800">
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    면접 제안 메시지
                  </h3>
                  <p className="leading-relaxed text-gray-700 whitespace-pre-line">
                    안녕하세요, {selectedOffer.companyName}입니다.
                    <br />
                    귀하의 프로필을 인상 깊게 보았으며,{" "}
                    <strong>{selectedOffer.jobTitle}</strong> 포지션의 면접
                    기회를 제안드리고 싶습니다.
                    <br />
                    {selectedOffer.offerType === "FROM_APPLICATION"
                      ? "지원해주신 내역을 검토한 결과, 긍정적인 평가를 받아 면접을 요청드립니다."
                      : "저희가 찾고 있는 인재상과 부합하여 기업의 제안을 드립니다."}
                  </p>
                </div>

                {/* 2. ✅ 공고 정보 (API 데이터) */}
                <div className="mb-10">
                  {/* 공고 정보 헤더 & 바로가기 버튼 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-purple-100 text-purple-600 rounded-md">
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
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </span>
                      <h4 className="text-lg font-bold text-gray-900">
                        공고 정보
                      </h4>
                    </div>
                    {/* ✅ [수정] 바로가기 버튼: 파란색 버튼 스타일로 변경 & 페이지 이동 적용 */}
                    {relatedJob && (
                      <button
                        onClick={() =>
                          navigate(`/user/jobs/${relatedJob.jobId}`)
                        }
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition-all bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md"
                      >
                        원문 공고 보러가기
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {isJobLoading ? (
                    <div className="flex items-center justify-center h-40 text-gray-400 bg-gray-50 rounded-xl">
                      공고 정보를 불러오는 중...
                    </div>
                  ) : relatedJob ? (
                    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* 회사명 */}
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                          <div className="p-2 text-purple-600 bg-white rounded shadow-sm">
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
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-medium text-gray-400">
                              회사명
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {relatedJob.companyName}
                            </p>
                          </div>
                        </div>
                        {/* 직무 */}
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                          <div className="p-2 text-blue-600 bg-white rounded shadow-sm">
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
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-medium text-gray-400">
                              직무
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {relatedJob.jobCategory}
                            </p>
                          </div>
                        </div>
                        {/* 근무지 */}
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                          <div className="p-2 text-green-600 bg-white rounded shadow-sm">
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
                          <div>
                            <p className="mb-1 text-xs font-medium text-gray-400">
                              근무지
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {relatedJob.location || "회사 내규에 따름"}
                            </p>
                          </div>
                        </div>
                        {/* 경력 */}
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                          <div className="p-2 text-indigo-600 bg-white rounded shadow-sm">
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-medium text-gray-400">
                              경력
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {relatedJob.experienceLevel || "무관"}
                            </p>
                          </div>
                        </div>
                        {/* 급여 */}
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                          <div className="p-2 text-yellow-600 bg-white rounded shadow-sm">
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
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-medium text-gray-400">
                              급여
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {relatedJob.salary || "회사 내규에 따름"}
                            </p>
                          </div>
                        </div>
                        {/* 등록/마감일 */}
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                          <div className="p-2 text-gray-600 bg-white rounded shadow-sm">
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-medium text-gray-400">
                              등록일 / 마감일
                            </p>
                            {/* ✅ [유지] formatYMD 함수로 날짜 포맷 적용 */}
                            <div className="text-sm font-bold text-gray-900">
                              {formatYMD(relatedJob.createdAt)} ~{" "}
                              {relatedJob.deadline || "채용시 마감"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 공고 설명 */}
                      <div className="mt-8">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </span>
                          <h4 className="text-lg font-bold text-gray-900">
                            공고 설명
                          </h4>
                        </div>
                        <div className="p-6 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap border border-gray-100 rounded-lg bg-gray-50">
                          {relatedJob.description || "상세 설명이 없습니다."}
                        </div>
                      </div>

                      {/* ✅ 스킬 정보 (필수/우대) */}
                      {(relatedJob.requiredSkills ||
                        relatedJob.preferredSkills) && (
                        <div className="mt-6 space-y-4">
                          {/* 1. 필수 스킬 */}
                          {relatedJob.requiredSkills && (
                            <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-red-50 text-red-500 rounded-full border border-red-100">
                                  <svg
                                    className="w-4 h-4"
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
                                <h4 className="text-base font-bold text-gray-900">
                                  필수 스킬
                                </h4>
                                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100">
                                  Required
                                </span>
                              </div>
                              <div className="p-4 text-sm font-medium leading-relaxed text-gray-800 border rounded-lg bg-red-50/30 border-red-50">
                                {relatedJob.requiredSkills}
                              </div>
                            </div>
                          )}

                          {/* 2. 우대 스킬 */}
                          {relatedJob.preferredSkills && (
                            <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-green-50 text-green-500 rounded-full border border-green-100">
                                  <svg
                                    className="w-4 h-4"
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
                                <h4 className="text-base font-bold text-gray-900">
                                  우대 스킬
                                </h4>
                                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100">
                                  Preferred
                                </span>
                              </div>
                              <div className="p-4 text-sm font-medium leading-relaxed text-gray-800 border rounded-lg bg-green-50/30 border-green-50">
                                {relatedJob.preferredSkills}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 text-gray-400 border border-gray-300 border-dashed bg-gray-50 rounded-xl">
                      공고 정보를 찾을 수 없습니다. (삭제되었거나 만료됨)
                    </div>
                  )}
                </div>

                {/* 3. 제안 상세 정보 (요약) */}
                <h4 className="pb-2 mb-4 text-lg font-bold text-gray-900 border-b border-gray-200">
                  제안 상세 정보
                </h4>
                <div className="grid grid-cols-2 text-sm gap-y-6 gap-x-12">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-400">제안 일시</span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatDate(selectedOffer.offeredAt)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-400">
                      직무 카테고리
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {selectedOffer.jobCategory}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-400">제안 유형</span>
                    <span className="text-base font-semibold text-gray-900">
                      {selectedOffer.offerType === "FROM_APPLICATION"
                        ? "일반 지원"
                        : "기업의 제안"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-400">
                      현재 진행 상태
                    </span>
                    <span
                      className={`font-bold text-base ${getStatusColor(selectedOffer.interviewStatus, selectedOffer.finalResult).split(" ")[0]}`}
                    >
                      {getStatusText(
                        selectedOffer.interviewStatus,
                        selectedOffer.finalResult,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* 하단 액션 버튼 */}
              <div className="sticky bottom-0 flex justify-end gap-3 px-8 py-5 border-t border-gray-200 bg-gray-50">
                {selectedOffer.interviewStatus === "OFFERED" ? (
                  <>
                    <button
                      onClick={() => handleReject(selectedOffer.offerId)}
                      className="px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                    >
                      거절하기
                    </button>
                    <button
                      onClick={() => handleAccept(selectedOffer.offerId)}
                      className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-all"
                    >
                      수락하기
                    </button>
                  </>
                ) : (
                  <span className="py-2 text-sm text-gray-400">
                    * 이미{" "}
                    {getStatusText(
                      selectedOffer.interviewStatus,
                      selectedOffer.finalResult,
                    )}{" "}
                    처리된 제안입니다.
                  </span>
                )}
              </div>
            </section>
          ) : (
            // 🟦 목록 화면
            <section
              ref={listContainerRef}
              className="bg-white border border-gray-200 rounded-xl flex flex-col justify-between overflow-hidden min-h-[600px] shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between w-full">
                    {/* 전체 선택 */}
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-bold text-blue-600">
                        받은 면접 제안{" "}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          총 {filteredOffers.length}건
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
                      {currentOffers.length > 0 && (
                        <label className="flex items-center gap-1.5 cursor-pointer select-none mr-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
                            checked={
                              currentOffers.length > 0 &&
                              currentOffers.every((o) =>
                                selectedIds.includes(o.offerId),
                              )
                            }
                            onChange={handleSelectAll}
                          />
                          <span className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            전체 선택
                          </span>
                        </label>
                      )}
                      <select
                        value={itemsPerPage}
                        onChange={(e) =>
                          setItemsPerPage(Number(e.target.value))
                        }
                        className="px-2 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      >
                        <option value={10}>10개씩</option>
                        <option value={20}>20개씩</option>
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-2 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      >
                        <option value="ALL">전체 상태</option>
                        <option value="OFFERED">대기중</option>
                        <option value="ACCEPTED">수락함</option>
                        <option value="REJECTED">거절함</option>
                        <option value="DELETED">휴지통</option>
                      </select>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-gray-200 rounded-full border-t-blue-600 animate-spin"></div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {currentOffers.length === 0 ? (
                      <div className="py-24 text-center">
                        <p className="text-gray-500">
                          해당하는 제안이 없습니다.
                        </p>
                      </div>
                    ) : (
                      currentOffers.map((offer) => (
                        <div
                          key={offer.offerId}
                          onClick={() => handleOfferClick(offer.offerId)}
                          onMouseEnter={() => setHoveredId(offer.offerId)}
                          onMouseLeave={() => setHoveredId(null)}
                          className={`group flex items-center px-5 py-4 cursor-pointer transition-all duration-200 ${
                            hoveredId === offer.offerId
                              ? "bg-blue-50/50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center pr-5"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
                              checked={selectedIds.includes(offer.offerId)}
                              onChange={(e) =>
                                toggleSelect(offer.offerId, e as any)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <div className="flex items-center flex-1 min-w-0 gap-6">
                              <div className="flex-shrink-0 w-20">
                                <span
                                  className={`inline-flex items-center justify-center w-full px-2.5 py-1 text-xs font-medium rounded-md border whitespace-nowrap ${getStatusColor(offer.interviewStatus, offer.finalResult)}`}
                                >
                                  {getStatusText(
                                    offer.interviewStatus,
                                    offer.finalResult,
                                  )}
                                </span>
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-base font-bold text-gray-900 truncate transition-colors group-hover:text-blue-700">
                                    {offer.companyName}
                                  </span>
                                  <span className="text-xs text-gray-300">
                                    |
                                  </span>
                                  <span className="text-sm text-gray-600 truncate">
                                    {offer.jobTitle}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{offer.jobCategory}</span>
                                  <span className="w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
                                  <span>
                                    {offer.offerType === "FROM_APPLICATION"
                                      ? "지원 후 제안"
                                      : "기업의 제안"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 ml-4">
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-700">
                                  {formatDate(offer.offeredAt).split(". ")[1]}.
                                  {formatDate(offer.offeredAt).split(". ")[2]}
                                  <span className="ml-1 text-xs font-normal text-gray-400">
                                    {formatDate(offer.offeredAt).split(" ")[3]}
                                  </span>
                                </div>
                                {offer.deadline && getDday(offer.deadline) && (
                                  <div
                                    className={`text-xs mt-0.5 ${getDday(offer.deadline)?.color}`}
                                  >
                                    마감 {getDday(offer.deadline)?.text}
                                  </div>
                                )}
                              </div>

                              {!offer.deleted && (
                                <button
                                  onClick={(e) =>
                                    handleDelete(offer.offerId, e)
                                  }
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
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {filteredOffers.length > 0 && (
                <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    이전
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[28px] h-7 flex items-center justify-center text-xs font-medium rounded transition-colors ${
                            currentPage === page
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    다음
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
