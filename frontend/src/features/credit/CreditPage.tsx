import { useState, useMemo, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useCreditStore } from "../../stores/creditStore";
import { useJobStore } from "../../stores/jobStore";
import LeftSidebar from "../../components/LeftSidebar";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import {
  getActiveAdvertisements,
  Advertisement,
} from "../../api/advertisement";
import { getCreditBalance } from "../../api/credit";

interface CreditPageProps {
  onNavigate?: (page: string, subMenu?: string) => void;
  initialMenu?: string;
}

export default function CreditPage({
  onNavigate,
  initialMenu,
}: CreditPageProps) {
  const { user } = useAuthStore();
  const { activeMenu, handleMenuClick } = usePageNavigation(
    "credit",
    initialMenu || "credit-sub-1",
    onNavigate,
  );

  // ✅ AppContext에서 실제 데이터 가져오기
  const { creditBalance, setCreditBalance, creditTransactions, coupons, useCoupon } = useCreditStore();
  const { businessJobs } = useJobStore();

  const [activeTab, setActiveTab] = useState<"coupon" | "usage" | "mileage">(
    "coupon",
  );

  // ✅ 광고 데이터 상태
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);

  // ✅ 광고 데이터 불러오기
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        setLoadingAds(true);
        const ads = await getActiveAdvertisements();
        setAdvertisements(ads);
      } catch (error) {
        console.error("Failed to fetch advertisements:", error);
        // 에러 발생 시 기본 광고 표시
        setAdvertisements([]);
      } finally {
        setLoadingAds(false);
      }
    };

    fetchAdvertisements();
  }, []);

  // ✅ 크레딧 잔액 조회 (백엔드에서 가져오기)
  useEffect(() => {
    const fetchCreditBalance = async () => {
      if (user?.userId) {
        try {
          console.log("📡 크레딧 잔액 조회 시작:", user.userId);
          const balance = await getCreditBalance(user.userId);
          console.log("✅ 크레딧 잔액 조회 성공:", balance);
          setCreditBalance(balance.balance);
          localStorage.setItem(
            "nextenter_credit_balance",
            balance.balance.toString(),
          );
        } catch (error: any) {
          console.error("❌ 크레딧 잔액 조회 실패:", error);

          // ⚠️ 401 에러가 아니면 기존 값 유지
          if (error.response?.status !== 401) {
            const savedBalance = localStorage.getItem(
              "nextenter_credit_balance",
            );
            if (savedBalance) {
              console.log("💾 저장된 크레딧 사용:", savedBalance);
              setCreditBalance(parseInt(savedBalance));
            } else {
              setCreditBalance(0);
              localStorage.setItem("nextenter_credit_balance", "0");
            }
          }
          // 401 에러는 axios 인터셉터가 처리
        }
      }
    };

    fetchCreditBalance();
  }, [user?.userId, setCreditBalance]);

  // ✅ 사용 가능한 쿠폰만 필터링
  const availableCoupons = useMemo(() => {
    return coupons.filter((c) => !c.isUsed);
  }, [coupons]);

  // ✅ 사용한 쿠폰만 필터링
  const usedCoupons = useMemo(() => {
    return coupons.filter((c) => c.isUsed);
  }, [coupons]);

  // ✅ 충전 내역만 필터링
  const chargeTransactions = useMemo(() => {
    return creditTransactions.filter((t) => t.type === "충전");
  }, [creditTransactions]);

  // ✅ 사용 내역만 필터링
  const usageTransactions = useMemo(() => {
    return creditTransactions.filter((t) => t.type === "사용");
  }, [creditTransactions]);

  // ✅ 추천 공고 (businessJobs 중 하나를 랜덤 또는 최신 것 표시)
  const featuredJob = useMemo(() => {
    if (businessJobs.length === 0) return null;
    return businessJobs[0];
  }, [businessJobs]);

  const handleCouponClick = (id: number) => {
    if (confirm("이 쿠폰을 사용하시겠습니까?")) {
      useCoupon(id);
      alert("쿠폰이 사용되었습니다!");
    }
  };

  const handlePromote = () => {
    handleMenuClick("credit-sub-2");
  };

  const handleJobClick = () => {
    if (featuredJob) {
      handleMenuClick("job-sub-1");
    }
  };

  // ✅ 광고 클릭 핸들러
  const handleAdvertisementClick = (ad: Advertisement) => {
    if (ad.targetPage) {
      handleMenuClick(ad.targetPage);
    } else if (ad.targetUrl) {
      window.open(ad.targetUrl, "_blank");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="px-4 py-5 mx-auto max-w-7xl">
          {/* ✅ [수정] 상단 헤더(h1, button) 제거 후 구조 변경 */}

          {/* ✅ [수정] items-start 추가 (Sticky 적용) */}
          <div className="flex items-start gap-6">
            {/* ✅ [수정] 왼쪽 사이드바 Title 적용 */}
            <LeftSidebar
              title="보유 크레딧"
              activeMenu={activeMenu}
              onMenuClick={handleMenuClick}
            />

            {/* 메인 컨텐츠 */}
            <div className="flex-1">
              {/* ✅ [수정] 충전하기 버튼을 메인 컨텐츠 상단으로 이동 */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={handlePromote}
                  className="flex items-center gap-2 px-6 py-2 font-bold text-blue-600 transition border-2 border-blue-500 rounded-lg hover:bg-blue-50"
                >
                  <span>+</span>
                  <span>충전하기</span>
                </button>
              </div>

              {/* 크레딧 카드 */}
              <div className="p-8 mb-6 text-white bg-gradient-to-r bg-slate-900 via-purple-400 to-cyan-400 rounded-2xl">
                <h2 className="mb-6 text-xl">
                  {user?.name || "admin"}님의 현재 사용 가능 크레딧
                </h2>
                <div className="flex items-center justify-end gap-3 mb-4">
                  <span className="text-6xl font-bold">{creditBalance}</span>
                  <div className="flex items-center justify-center w-12 h-12 text-2xl bg-orange-400 rounded-full">
                  💰
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="px-4 py-2 text-sm text-gray-700 rounded-full bg-white/90">
                    30일 이내 소멸 가능 마일리지 0M
                  </div>
                </div>
              </div>

              {/* 탭 */}
              <div className="overflow-hidden bg-white border-2 border-gray-200 rounded-2xl">
                <div className="flex border-b-2 border-gray-200">
                  {["mileage", "coupon", "usage"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() =>
                        setActiveTab(tab as "coupon" | "usage" | "mileage")
                      }
                      className={`flex-1 py-4 font-semibold transition ${
                        activeTab === tab
                          ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {tab === "coupon" && "쿠폰 목록"}
                      {tab === "usage" && "쿠폰 이용 내역"}
                      {tab === "mileage" && "쿠폰 등록"}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* ✅ 광고 탭 (쿠폰 목록 대신) */}
                  {activeTab === "coupon" && (
                    <div className="space-y-4">
                      {loadingAds ? (
                        <div className="py-12 text-center text-gray-500">
                          <div className="mb-4 text-4xl">⏳</div>
                          <p>광고를 불러오는 중...</p>
                        </div>
                      ) : advertisements.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                          <div className="mb-4 text-4xl">📢</div>
                          <p>현재 등록된 광고가 없습니다</p>
                        </div>
                      ) : (
                        advertisements.map((ad) => (
                          <div
                            key={ad.id}
                            className={`${ad.backgroundColor} text-white rounded-xl p-6 shadow-lg cursor-pointer transition hover:shadow-xl hover:scale-[1.02]`}
                          >
                            <h3 className="mb-3 text-2xl font-bold">
                              {ad.title}
                            </h3>
                            <p className="mb-4 text-lg opacity-90">
                              {ad.description}
                            </p>
                            <button
                              onClick={() => handleAdvertisementClick(ad)}
                              className="px-6 py-3 font-semibold text-gray-900 transition bg-white rounded-lg hover:bg-gray-100"
                            >
                              {ad.buttonText}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* 쿠폰 이용 내역 탭 */}
                  {activeTab === "usage" && (
                    <div>
                      {usedCoupons.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                          사용한 쿠폰이 없습니다
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {usedCoupons.map((coupon) => (
                            <div
                              key={coupon.id}
                              className="p-4 bg-gray-100 border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">
                                  {coupon.label}
                                </span>
                                <span className="text-sm text-gray-500">
                                  사용됨
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 마일리지 내역 탭 */}
                  {activeTab === "mileage" && (
                    <div>
                      {chargeTransactions.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                          충전 내역이 없습니다
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-4 mb-4 text-center rounded-lg bg-blue-50">
                            <span className="text-gray-600">총 충전</span>
                            <span className="mx-2 text-2xl font-bold text-blue-600">
                              {chargeTransactions.reduce(
                                (sum, t) => sum + t.amount,
                                0,
                              )}
                            </span>
                            <span className="text-gray-600">크레딧</span>
                          </div>

                          {chargeTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="p-4 bg-white border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">
                                  {transaction.description}
                                </span>
                                <span className="text-lg font-bold text-blue-600">
                                  +{transaction.amount}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{transaction.date}</span>
                                <span>잔액: {transaction.balance}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* FAQ */}
              <div className="p-6 mt-6 bg-white border-2 border-gray-200 rounded-2xl">
                <div className="pl-4 mb-4 border-l-4 border-red-400">
                  <h3 className="text-lg font-bold">
                    크레딧은 어디에 쓸 수 있나요?
                  </h3>
                </div>
                <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                  <li>AI 이력서 분석 및 개선 제안</li>
                  <li>매칭 분석 서비스 이용</li>
                  <li>AI 모의 면접 진행</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
