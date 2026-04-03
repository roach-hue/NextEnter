import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useCreditStore } from "../../stores/creditStore";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import LeftSidebar from "../../components/LeftSidebar";
import { getCreditBalance } from "../../api/credit";

interface LocationState {
  amount: number;
  credits: number;
  bonus: number;
  newBalance?: number;
}

export default function PaymentCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { creditBalance, setCreditBalance } = useCreditStore();
  const { activeMenu, handleMenuClick } = usePageNavigation(
    "credit",
    "credit-sub-1",
  );

  // ✅ location.state에서 결제 정보 가져오기
  const paymentInfo = location.state as LocationState | null;

  // 결제 정보가 없으면 크레딧 페이지로 리다이렉트
  useEffect(() => {
    if (!paymentInfo) {
      navigate("/user/credit");
    }
  }, [paymentInfo, navigate]);

  // ✅ 결제 완료 후 최신 크레딧 잔액 조회
  useEffect(() => {
    const refreshCreditBalance = async () => {
      if (user?.userId && paymentInfo) {
        try {
          const balance = await getCreditBalance(user.userId);
          setCreditBalance(balance.balance);
          localStorage.setItem(
            "nextenter_credit_balance",
            balance.balance.toString(),
          );
          console.log("최신 크레딧 잔액:", balance.balance);
        } catch (error) {
          console.error("크레딧 잔액 조회 실패:", error);
        }
      }
    };

    refreshCreditBalance();
  }, [user?.userId, paymentInfo, setCreditBalance]);

  const handleGoToCredit = () => {
    navigate("/user/credit");
  };

  const handleGoToCharge = () => {
    navigate("/user/credit/charge");
  };

  if (!paymentInfo) {
    return null;
  }

  const { amount, credits, bonus } = paymentInfo;
  const totalCredits = credits + bonus;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="flex gap-6">
          {/* 왼쪽 사이드바 */}
          <LeftSidebar
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
          />

          {/* 메인 컨텐츠 */}
          <div className="flex-1">
            <div className="max-w-2xl mx-auto">
              {/* 결제 완료 카드 */}
              <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
                {/* 헤더 */}
                <div className="p-8 text-center text-white bg-gradient-to-r from-blue-500 to-purple-500">
                  <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-white rounded-full">
                    <span className="text-4xl">😊</span>
                  </div>
                  <h1 className="mb-2 text-3xl font-bold">결제 완료</h1>
                  <p className="text-lg opacity-90">
                    크레딧 충전이 완료되었습니다!
                  </p>
                </div>

                {/* 결제 정보 */}
                <div className="p-8">
                  <div className="p-6 mb-6 border-2 border-blue-100 rounded-xl bg-blue-50">
                    <div className="mb-4 text-center">
                      <div className="mb-2 text-sm text-gray-600">
                        충전된 크레딧
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-5xl font-bold text-blue-600">
                          {totalCredits}
                        </span>
                        <span className="text-2xl">💰</span>
                      </div>
                      {bonus > 0 && (
                        <div className="mt-2 text-sm text-orange-600">
                          (기본 {credits} + 보너스 {bonus})
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">결제 금액</span>
                      <span className="text-xl font-bold text-gray-900">
                        {amount.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">현재 보유 크레딧</span>
                      <span className="text-xl font-bold text-blue-600">
                        {creditBalance} 💰
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-600">결제 일시</span>
                      <span className="text-gray-900">
                        {new Date().toLocaleString("ko-KR")}
                      </span>
                    </div>
                  </div>

                  {/* 안내 메시지 */}
                  <div className="p-4 mb-6 rounded-lg bg-gray-50">
                    <h3 className="mb-2 font-semibold text-gray-900">
                      💡 크레딧 사용 안내
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• AI 이력서 분석 및 개선 제안</li>
                      <li>• 매칭 분석 서비스 이용</li>
                      <li>• AI 모의 면접 진행</li>
                    </ul>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="space-y-3">
                    <button
                      onClick={handleGoToCredit}
                      className="w-full px-6 py-4 text-lg font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      내 크레딧 확인하기
                    </button>
                    <button
                      onClick={handleGoToCharge}
                      className="w-full px-6 py-4 text-lg font-semibold text-blue-600 transition bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      추가 충전하기
                    </button>
                  </div>
                </div>
              </div>

              {/* 다음 단계 안내 */}
              <div className="p-6 mt-6 bg-white border-2 border-gray-200 rounded-2xl">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  🎯 다음 단계
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/user/resume")}
                    className="flex items-center justify-between w-full p-4 text-left transition border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div>
                      <div className="mb-1 font-semibold text-gray-900">
                        이력서 작성하기
                      </div>
                      <div className="text-sm text-gray-600">
                        나만의 이력서를 작성하고 AI 분석을 받아보세요
                      </div>
                    </div>
                    <span className="text-2xl">→</span>
                  </button>
                  <button
                    onClick={() => navigate("/user/matching")}
                    className="flex items-center justify-between w-full p-4 text-left transition border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div>
                      <div className="mb-1 font-semibold text-gray-900">
                        매칭 분석 시작하기
                      </div>
                      <div className="text-sm text-gray-600">
                        AI가 추천하는 맞춤 공고를 확인해보세요
                      </div>
                    </div>
                    <span className="text-2xl">→</span>
                  </button>
                  <button
                    onClick={() => navigate("/user/interview")}
                    className="flex items-center justify-between w-full p-4 text-left transition border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div>
                      <div className="mb-1 font-semibold text-gray-900">
                        모의 면접 시작하기
                      </div>
                      <div className="text-sm text-gray-600">
                        AI 면접관과 실전 연습을 해보세요
                      </div>
                    </div>
                    <span className="text-2xl">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
