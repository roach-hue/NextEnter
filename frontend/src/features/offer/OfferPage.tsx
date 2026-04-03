import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import OfferSidebar from "./components/OfferSidebar";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import { useOfferStore } from "../../stores/offerStore";

interface OfferPageProps {
  initialMenu?: string;
  onNavigate?: (page: string, subMenu?: string) => void;
}

export default function OfferPage({ initialMenu, onNavigate }: OfferPageProps) {
  // ✅ 1. useSearchParams 훅 사용 (URL 읽기/쓰기)
  const [searchParams, setSearchParams] = useSearchParams();

  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);

  const { activeMenu, handleMenuClick } = usePageNavigation(
    "offer",
    initialMenu || "offer-sub-1",
    onNavigate,
  );

  const { positionOffers, deletePositionOffer } = useOfferStore();

  // URL의 'id' 파라미터를 감지해서 화면 전환
  useEffect(() => {
    const offerId = searchParams.get("id");

    if (offerId) {
      setSelectedOffer(Number(offerId));
    } else {
      setSelectedOffer(null);
    }

    setIsMessageExpanded(false);
  }, [searchParams]);

  // ✅ 3. 클릭 시 URL에 id 추가
  const handleOfferClick = (id: number) => {
    // 기존 쿼리(menu 등)는 유지하고 id만 추가
    const newParams = new URLSearchParams(searchParams);
    newParams.set("id", id.toString());
    setSearchParams(newParams);
  };

  // ✅ 4. 뒤로가기 시 URL에서 id 제거
  const handleBack = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("id"); // id만 쏙 뺍니다.
    setSearchParams(newParams);
  };

  const handleAccept = () => {
    console.log("제안 수락");
  };

  const handleReject = () => {
    console.log("제안 거절");
  };

  const handleDelete = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm("정말 삭제하시겠습니까?")) {
      deletePositionOffer(id);
      // 만약 보고 있던 제안을 삭제했다면 목록으로 돌아가기
      if (selectedOffer === id) {
        handleBack();
      }
      console.log(`제안 ${id} 삭제됨`);
    }
  };

  // 세부 내용 렌더링
  if (selectedOffer !== null) {
    const detail = positionOffers.find((o) => o.id === selectedOffer);

    // 해당 ID의 데이터가 없으면(삭제됨 등) 목록으로 복귀
    if (!detail) {
      handleBack();
      return null;
    }

    return (
      <div className="px-4 py-8 mx-auto max-w-7xl ">
        <div className="flex gap-6">
          <OfferSidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />

          <div className="flex-1">
            {/* 상단 헤더 */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBack}
                className="p-2 transition rounded-full hover:bg-gray-100"
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
              <h2 className="text-2xl font-bold">받은 제안 (상세)</h2>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="mb-20 overflow-hidden bg-white border-2 border-gray-200 rounded-2xl">
              {/* Header: 발신자 정보 */}
              <div className="p-6 border-b-2 border-gray-200 bg-blue-50">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 bg-gray-300 rounded-lg">
                    <span className="text-xs text-gray-600">로고</span>
                  </div>

                  <div>
                    <h3 className="mb-1 text-xl font-bold text-gray-900">
                      {detail.company}
                    </h3>
                    <p className="mb-1 text-gray-700">
                      {detail.sender} 님이 제안을 보냈습니다.
                    </p>
                    <p className="text-sm text-gray-500">{detail.date}</p>
                  </div>
                </div>
              </div>

              {/* Body: 제안 메시지 */}
              <div className="p-6 border-b-2 border-gray-200">
                <div className="mb-2 font-semibold text-blue-600">
                  "귀하의 경험이 인상적입니다."
                </div>
                <div className="text-gray-700 whitespace-pre-line">
                  {isMessageExpanded
                    ? detail.message
                    : detail.message.slice(0, 150) + "..."}
                </div>
                <button
                  onClick={() => setIsMessageExpanded(!isMessageExpanded)}
                  className="flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  {isMessageExpanded ? "접기" : "더보기"}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isMessageExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Card: 직무 정보 */}
              <div className="p-6">
                <h4 className="mb-4 text-lg font-bold text-gray-900">
                  {detail.jobTitle}
                </h4>

                <div className="mb-4 space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">연봉:</span> {detail.salary}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">지역:</span>{" "}
                    {detail.location}
                  </p>
                </div>

                <div className="flex gap-2 mb-6">
                  {detail.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {detail.jobId && (
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href="#"
                      className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
                    >
                      공고 상세보기
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Footer: 고정 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-gray-200 shadow-lg">
              <div className="flex justify-end gap-4 mx-auto max-w-7xl">
                <button
                  onClick={handleReject}
                  className="px-8 py-3 font-semibold text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  거절하기
                </button>
                <button
                  onClick={handleAccept}
                  className="px-8 py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  수락하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 목록 페이지
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl">
      <h2 className="inline-block mb-6 text-2xl font-bold">제안 현황</h2>

      <div className="flex items-start gap-6">
        {/* 왼쪽 사이드바 */}
        <OfferSidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />

        {/* 메인 컨텐츠 */}
        <div className="flex-1">
          {/* 포지션 제안 섹션 */}
          <div className="mb-6">
            <h3 className="pb-2 mb-4 text-lg font-bold text-blue-600 border-b-2 border-blue-600">
              포지션 제안
            </h3>
            <section className="p-8 bg-white border-2 border-gray-200 rounded-2xl">
              {positionOffers.length === 0 ? (
                <div className="py-12 text-center text-gray-500 border-2 border-dashed rounded-xl">
                  받은 포지션 제안이 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {positionOffers.map((offer) => (
                    <div
                      key={offer.id}
                      onClick={() => handleOfferClick(offer.id)}
                      onMouseEnter={() => setHoveredId(offer.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`p-4 bg-white border-2 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                        hoveredId === offer.id
                          ? "border-blue-500 shadow-md transform scale-[1.01]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex-1">
                        <h4
                          className={`mb-1 transition-all ${
                            hoveredId === offer.id
                              ? "text-xl font-bold text-gray-900"
                              : "text-lg font-semibold text-gray-800"
                          }`}
                        >
                          {offer.company}
                        </h4>
                        <p className="mb-2 text-sm text-gray-600">
                          {offer.position} | 제안일 {offer.date}
                        </p>
                      </div>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={(e) => handleDelete(offer.id, e)}
                        className="p-2 text-gray-400 transition-all rounded-lg hover:text-red-600 hover:bg-red-50"
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
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
