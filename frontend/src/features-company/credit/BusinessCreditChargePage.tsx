import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useCreditStore } from "../../stores/creditStore";
import { useCompanyPageNavigation } from "../hooks/useCompanyPageNavigation";
import CompanyLeftSidebar from "../components/CompanyLeftSidebar";
import { chargeCredit, getCreditBalance } from "../../api/credit";
import { verifyPayment } from "../../api/payment";

interface BusinessCreditChargePageProps {
  onBack?: () => void;
  initialMenu?: string;
  onNavigate?: (page: string, subMenu?: string) => void;
  onPaymentComplete?: (amount: number, credits: number, bonus: number) => void;
}

declare global {
  interface Window {
    PortOne?: any;
  }
}

const PORTONE_CONFIG = {
  storeId: "store-c27f5e9a-df90-425f-8e56-c055caed2dbe",
  channels: {
    kakaopay: "channel-key-7cb7a748-784c-4409-843d-9f46f3b9a2fd",
    toss: "channel-key-06995bd1-82f1-4500-91da-588226c7290d",
  },
};

const BANKS = [
  { id: "shinhan", name: "신한은행", color: "bg-blue-600" },
  { id: "kookmin", name: "KB국민은행", color: "bg-yellow-600" },
  { id: "woori", name: "우리은행", color: "bg-blue-500" },
  { id: "hana", name: "하나은행", color: "bg-green-600" },
  { id: "nh", name: "NH농협은행", color: "bg-green-700" },
  { id: "ibk", name: "IBK기업은행", color: "bg-blue-700" },
  { id: "kakaobank", name: "카카오뱅크", color: "bg-yellow-400" },
  { id: "kbank", name: "케이뱅크", color: "bg-blue-400" },
  { id: "tossbank", name: "토스뱅크", color: "bg-blue-500" },
  { id: "samsung", name: "삼성카드", color: "bg-blue-800" },
  { id: "hyundai", name: "현대카드", color: "bg-black" },
  { id: "lotte", name: "롯데카드", color: "bg-red-600" },
];

export default function BusinessCreditChargePage({
  onBack,
  initialMenu,
  onNavigate,
}: BusinessCreditChargePageProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addCreditTransaction } = useCreditStore();
  const { activeMenu, handleMenuClick } = useCompanyPageNavigation(
    "credit",
    initialMenu || "credit-sub-2",
  );

  const [currentCredit, setCurrentCredit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardNumberError, setCardNumberError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCreditBalance = async () => {
      if (user?.companyId) {
        try {
          setIsLoading(true);
          const balance = await getCreditBalance(user.companyId);
          setCurrentCredit(balance.balance);
        } catch (error) {
          console.error("❌ 크레딧 잔액 조회 실패:", error);
          setCurrentCredit(0);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchCreditBalance();
  }, [user?.companyId]);

  const packages = [
    { credits: 100, price: 10000, bonus: 0 },
    { credits: 300, price: 30000, bonus: 5 },
    { credits: 500, price: 50000, bonus: 10 },
    { credits: 1000, price: 100000, bonus: 20 },
    { credits: 2000, price: 200000, bonus: 50 },
  ];

  const paymentMethods = [
    { id: "card", name: "카드결제", icon: "💳" },
    { id: "kakaopay", name: "카카오페이", imgSrc: "/images/kakaopay.png" },
    { id: "toss", name: "토스페이", imgSrc: "/images/toss.png" },
    { id: "naverpay", name: "네이버페이", imgSrc: "/images/naverpay.png" },
  ];

  const handlePackageSelect = (credits: number) => {
    setSelectedPackage(credits);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    if (methodId !== "card") {
      setSelectedBank("");
      setCardNumber("");
      setCardNumberError("");
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1-");
    setCardNumber(formatted);
    setCardNumberError("");
  };

  const validateCardNumber = (): boolean => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length === 0) {
      setCardNumberError("카드번호를 입력해주세요.");
      return false;
    }
    if (digits.length !== 16) {
      setCardNumberError("카드번호 16자리를 입력해주세요.");
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!selectedPackage || !selectedPaymentMethod || !agreeTerms) {
      alert("항목을 모두 선택하고 약관에 동의해주세요.");
      return;
    }
    if (selectedPaymentMethod === "card" && (!selectedBank || !validateCardNumber())) return;

    if (!user?.companyId) return;

    const pkg = packages.find((p) => p.credits === selectedPackage);
    if (!pkg) return;

    try {
      setIsProcessing(true);
      if (selectedPaymentMethod === "kakaopay" || selectedPaymentMethod === "toss") {
        if (!window.PortOne) {
          alert("결제 모듈 로딩 중...");
          setIsProcessing(false);
          return;
        }
        const totalCredits = pkg.credits + pkg.bonus;
        const paymentId = `credit_${user.companyId}_${Date.now()}`;
        let channelKey = selectedPaymentMethod === "kakaopay" 
          ? PORTONE_CONFIG.channels.kakaopay 
          : PORTONE_CONFIG.channels.toss;
        let easyPayProvider = selectedPaymentMethod === "kakaopay" ? "KAKAOPAY" : "TOSSPAY";

        const response = await window.PortOne.requestPayment({
          storeId: PORTONE_CONFIG.storeId,
          channelKey: channelKey,
          paymentId: paymentId,
          orderName: `크레딧 ${pkg.credits} 충전`,
          totalAmount: pkg.price,
          currency: "KRW",
          payMethod: "EASY_PAY",
          easyPay: { easyPayProvider },
          customer: {
            customerId: user.companyId.toString(),
            fullName: user?.name,
            email: user?.email,
          },
        });

        if (response.code != null) {
          alert(`실패: ${response.message}`);
          setIsProcessing(false);
          return;
        }

        const verifyResult = await verifyPayment(user.companyId, {
          paymentId: response.paymentId,
          transactionId: response.transactionId || response.paymentId,
          amount: pkg.price,
          credits: totalCredits,
        });

        if (verifyResult.success) {
          addCreditTransaction({
            date: new Date().toLocaleDateString(),
            amount: totalCredits,
            type: "충전",
            description: `크레딧 ${pkg.credits} + 보너스 ${pkg.bonus}`,
          });
          navigate("/company/credit");
        }
        setIsProcessing(false);
        return;
      }

      const response = await chargeCredit(user.companyId, {
        amount: pkg.credits + pkg.bonus,
        paymentMethod: selectedPaymentMethod,
        description: `크레딧 ${pkg.credits} + 보너스 ${pkg.bonus}`,
      });

      if (response.success) {
        navigate("/company/credit");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedPackage = () => packages.find((p) => p.credits === selectedPackage);

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="flex items-start gap-6">
          {/* ✅ 기업용 사이드바 */}
          <CompanyLeftSidebar
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
          />

          <div className="flex-1 pb-20 space-y-8">
            {/* 상단 돌아가기 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={() => onBack ? onBack() : navigate("/company/credit")}
                className="text-sm font-bold transition-colors text-slate-400 hover:text-slate-600"
              >
                돌아가기
              </button>
            </div>

            {/* Current Balance Card */}
            <div className="relative p-8 overflow-hidden text-white shadow-xl bg-slate-900 rounded-2xl">
              <div className="relative z-10">
                <p className="mb-2 text-sm font-bold tracking-widest uppercase text-slate-400" style={{ paddingLeft: "30px" }}>
                  My Balance
                </p>
                <div className="flex items-baseline gap-2" style={{ paddingLeft: "30px" }}>
                  {isLoading ? (
                    <div className="w-32 h-10 rounded bg-slate-800 animate-pulse"></div>
                  ) : (
                    <>
                      <span className="text-5xl font-black tracking-tighter">
                        {currentCredit.toLocaleString()}
                      </span>
                      <span className="text-xl font-bold text-blue-400">CREDIT</span>
                    </>
                  )}
                </div>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] text-[120px] opacity-70 rotate-12" style={{ paddingRight: "30px" }}>
                💰
              </div>
            </div>

            {/* Step 1: Package Selection */}
            <section className="mb-10">
              <h3 className="flex items-center mb-5 text-lg font-bold text-slate-800">
                <span className="flex items-center justify-center w-6 h-6 mr-2 text-xs text-white bg-blue-600 rounded-full">1</span>
                충전 금액 선택
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                {packages.map((pkg) => (
                  <button
                    key={pkg.credits}
                    onClick={() => handlePackageSelect(pkg.credits)}
                    className={`group relative p-5 rounded-xl border-2 transition-all ${
                      selectedPackage === pkg.credits
                        ? "border-blue-600 bg-white shadow-lg translate-y-[-4px]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {pkg.bonus > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                        +{pkg.bonus} BONUS
                      </span>
                    )}
                    <div className="text-center">
                      <p className="mb-1 text-xs font-bold text-slate-400">CREDIT</p>
                      <p className={`text-2xl font-black mb-4 ${selectedPackage === pkg.credits ? "text-blue-600" : "text-slate-800"}`}>
                        {pkg.credits}
                      </p>
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-sm font-bold text-slate-900">{pkg.price.toLocaleString()}원</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 2: Payment Methods */}
            <section className="mb-10">
              <h3 className="flex items-center mb-5 text-lg font-bold text-slate-800">
                <span className="flex items-center justify-center w-6 h-6 mr-2 text-xs text-white bg-blue-600 rounded-full">2</span>
                결제 수단 선택
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                    className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all h-32 ${
                      selectedPaymentMethod === method.id
                        ? "border-slate-900 bg-slate-900 text-white shadow-md"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {method.imgSrc ? (
                      <div className="flex items-center justify-center w-12 h-12 mb-3 overflow-hidden">
                        <img
                          src={method.imgSrc}
                          alt={method.name}
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/48?text=PAY";
                          }}
                        />
                      </div>
                    ) : (
                      <span className="mb-3 text-3xl">{method.icon}</span>
                    )}
                    <span className={`text-s font-bold ${selectedPaymentMethod === method.id ? "text-white" : "text-slate-700"}`}>
                      {method.name}
                    </span>
                  </button>
                ))}
              </div>

              {(selectedPaymentMethod === "kakaopay" || selectedPaymentMethod === "toss") && (
                <div className="flex items-center gap-3 p-4 mt-4 border border-blue-100 bg-blue-50 rounded-xl">
                  <span className="text-xl text-blue-600">🛡️</span>
                  <p className="text-sm font-medium text-blue-800">
                    포트원 보안 결제 시스템을 통해 안전하게 실결제가 진행됩니다.
                  </p>
                </div>
              )}

              {selectedPaymentMethod === "card" && (
                <div className="p-8 mt-6 bg-white border shadow-sm border-slate-200 rounded-2xl">
                  <h4 className="mb-4 font-bold text-slate-800">카드 정보 입력</h4>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {BANKS.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className={`py-2 text-xs font-bold rounded-md border transition-all ${
                          selectedBank === bank.id
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-500 border-slate-200"
                        }`}
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000-0000-0000-0000"
                    className="w-full p-4 font-mono text-lg transition-all border outline-none bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  {cardNumberError && (
                    <p className="mt-2 text-xs font-bold text-red-500">{cardNumberError}</p>
                  )}
                </div>
              )}
            </section>

            {/* Step 3: Summary & Terms */}
            <section className="p-8 bg-white border shadow-sm border-slate-200 rounded-2xl">
              <div className="flex flex-col items-center justify-between pb-8 mb-8 border-b sm:flex-row border-slate-100">
                <div className="mb-4 sm:mb-0">
                  <p className="mb-1 text-sm font-bold text-slate-400">최종 결제 금액</p>
                  <h4 className="text-3xl font-black text-slate-900">
                    {selectedPackage ? `${getSelectedPackage()?.price.toLocaleString()}원` : "금액을 선택해주세요"}
                  </h4>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">
                    {selectedPackage ? `${(getSelectedPackage()!.credits + getSelectedPackage()!.bonus).toLocaleString()} 크레딧 충전 예정` : ""}
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 mb-8 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 mt-1 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm leading-relaxed transition-colors text-slate-500 group-hover:text-slate-700">
                  (필수) 상품 금액 및 유효기간(1년)을 확인하였으며, 서비스 결제 정책 및 약관에 동의합니다. 충전된 크레딧은 정책에 따라 사용 후 환불이 제한될 수 있습니다.
                </span>
              </label>

              <button
                onClick={handlePayment}
                disabled={!selectedPackage || !selectedPaymentMethod || !agreeTerms || isProcessing}
                className={`w-full py-5 rounded-xl text-lg font-black transition-all shadow-lg ${
                  selectedPackage && selectedPaymentMethod && agreeTerms && !isProcessing
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isProcessing ? "결제 처리 중..." : "충전하기"}
              </button>
            </section>

            {/* Footer Notice */}
            <div className="p-6 mt-10 bg-slate-100 rounded-xl">
              <p className="text-xs leading-6 text-slate-500">
                • 크레딧 유효기간은 충전일로부터 1년입니다.<br />
                • 이벤트로 지급된 보너스 크레딧은 우선 소멸될 수 있습니다.<br />
                • 결제 관련 문의는 고객센터(1588-XXXX)를 이용해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}