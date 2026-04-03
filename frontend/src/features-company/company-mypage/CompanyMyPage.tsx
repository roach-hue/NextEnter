import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import {
  getCompanyProfile,
  updateCompanyProfile,
  changeCompanyPassword,
} from "../../api/company";
import { getCreditBalance, getCreditHistory } from "../../api/credit";
import { useCompanyPageNavigation } from "../hooks/useCompanyPageNavigation";
import CompanyLeftSidebar from "../components/CompanyLeftSidebar";
import CompanyProfile from "./components/CompanyProfile";
import CompanyProfileView from "./components/CompanyProfileView";
import AccountSecurity from "./components/AccountSecurity";
import PaymentCredits from "./components/PaymentCredits";
import NotificationSettings from "./components/NotificationSettings";

interface CompanyMyPageProps {
  initialMenu?: string;
}

interface CreditHistoryItem {
  id: number;
  date: string;
  type: string;
  content: string;
  amount: string;
}

export default function CompanyMyPage({
  initialMenu = "companyMy-sub-1",
}: CompanyMyPageProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchParams] = useSearchParams();

  const reloadParam = searchParams.get('reload');

  const { activeMenu, handleMenuClick } = useCompanyPageNavigation(
    "companyMy",
    initialMenu,
  );
  
  // activeMenu가 변경되면 편집 모드 초기화
  useEffect(() => {
    setIsEditingProfile(false);
  }, [activeMenu]);

  const [currentCredit, setCurrentCredit] = useState<number>(0);
  const [creditHistory, setCreditHistory] = useState<CreditHistoryItem[]>([]);
  const [creditLoading, setCreditLoading] = useState(false);
  
  // 상세보기/수정 모드 상태
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [companyLogo, setCompanyLogo] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [businessNumber, setBusinessNumber] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [companySize, setCompanySize] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [ceoName, setCeoName] = useState<string>("");
  const [shortIntro, setShortIntro] = useState<string>("");
  const [snsUrl, setSnsUrl] = useState<string>("");
  const [detailAddress, setDetailAddress] = useState<string>("");
  const [managerDepartment, setManagerDepartment] = useState<string>("");

  const [managerName, setManagerName] = useState<string>("");
  const [managerPhone, setManagerPhone] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // ✅ 크레딧 정보 로드 함수 분리
  const loadCreditInfo = async () => {
    if (!user?.companyId) {
      console.log('❌ companyId가 없습니다:', user);
      return;
    }
    
    console.log('🔄 크레딧 정보 로드 시작 - companyId:', user.companyId);
    setCreditLoading(true);
    
    try {
      // 크레딧 잔액 조회
      console.log('📞 크레딧 잔액 API 호출...');
      const creditBalance = await getCreditBalance(user.companyId);
      console.log('✅ 크레딧 잔액 조회 성공:', creditBalance);
      setCurrentCredit(creditBalance.balance);

      // 크레딧 이용 내역 조회
      console.log('📞 크레딧 이용 내역 API 호출...');
      const historyResponse = await getCreditHistory(user.companyId, 0, 20);
      console.log('✅ 크레딧 이용 내역 조회 성공:', historyResponse);
      
      // 백엔드 데이터를 UI 형식으로 변환
      const formattedHistory: CreditHistoryItem[] = historyResponse.content.map((item) => ({
        id: item.creditHistoryId,
        date: new Date(item.createdAt).toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: item.transactionType === 'CHARGE' ? '충전' : '사용',
        content: item.description,
        amount: item.transactionType === 'CHARGE' 
          ? `+${item.amount.toLocaleString()} C` 
          : `-${item.amount.toLocaleString()} C`,
      }));

      console.log('✅ 포맷된 크레딧 내역:', formattedHistory);
      setCreditHistory(formattedHistory);
    } catch (error: any) {
      console.error('❌ 크레딧 정보 조회 실패:', error);
      console.error('❌ 에러 상세:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      // 404 에러가 아니면 기본값 유지, 404면 빈 배열
      if (error.response?.status === 404) {
        console.log('ℹ️ 크레딧 내역이 없습니다 (404)');
        setCreditHistory([]);
      } else {
        // 다른 에러의 경우 사용자에게 알림
        console.error('크레딧 로드 중 오류 발생');
      }
    } finally {
      setCreditLoading(false);
    }
  };

  // ✅ activeMenu가 크레딧 탭으로 변경될 때마다 크레딧 정보 로드
  useEffect(() => {
    if (activeMenu === "companyMy-sub-3" && user?.companyId) {
      console.log('🔄 크레딧 탭 활성화 - 크레딧 정보 로드');
      loadCreditInfo();
    }
  }, [activeMenu, user?.companyId, reloadParam]);

  // 초기 데이터 로드
  useEffect(() => {
    const loadCompanyProfile = async () => {
      if (!user?.companyId) return;
      setLoading(true);
      setError(null);
      try {
        const profile = await getCompanyProfile(user.companyId);
        setCompanyLogo(profile.logoUrl || "");
        setCompanyName(profile.companyName || "");
        setBusinessNumber(profile.businessNumber || "");
        setDescription(profile.description || "");
        setWebsite(profile.website || "");
        setIndustry(profile.industry || "");
        setCompanySize(profile.companySize || "");
        setAddress(profile.address || "");
        setEmployeeCount(profile.employeeCount || 0);
        setManagerName(profile.managerName || "");
        setManagerPhone(profile.managerPhone || "");
        setCeoName(profile.ceoName || "");
        setShortIntro(profile.shortIntro || "");
        setSnsUrl(profile.snsUrl || "");
        setDetailAddress(profile.detailAddress || "");
        setManagerDepartment(profile.managerDepartment || "");
      } catch (err: any) {
        console.error("기업 프로필 로드 오류:", err);
        setError("기업 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    loadCompanyProfile();
  }, [user?.companyId, reloadParam]);

  const handleSaveCompanyProfile = async () => {
    if (!user?.companyId) return;
    setLoading(true);
    try {
      let calculatedEmployeeCount = employeeCount;
      if (companySize) {
        if (companySize === "1-10명") calculatedEmployeeCount = 10;
        else if (companySize === "11-50명") calculatedEmployeeCount = 50;
        else if (companySize === "51-200명") calculatedEmployeeCount = 200;
        else if (companySize === "201-500명") calculatedEmployeeCount = 500;
        else if (companySize === "501-1000명") calculatedEmployeeCount = 1000;
        else if (companySize === "1000명 이상") calculatedEmployeeCount = 1001;
      }
      await updateCompanyProfile(user.companyId, {
        logoUrl: companyLogo,
        description,
        website,
        industry,
        employeeCount: calculatedEmployeeCount,
        address,
        managerName,
        managerPhone,
        ceoName,
        shortIntro,
        snsUrl,
        detailAddress,
        managerDepartment,
      });
      alert("기업 정보가 저장되었습니다.");
      setIsEditingProfile(false); // 저장 후 상세보기 모드로 전환
    } catch (err: any) {
      alert("기업 정보 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("비밀번호 변경의 모든 칸을 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!user?.companyId) return;
    setLoading(true);
    try {
      await changeCompanyPassword(user.companyId, currentPassword, newPassword);
      alert("비밀번호가 변경되었습니다.\n보안을 위해 다시 로그인 해주세요.");
      logout();
      navigate("/company/login");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "비밀번호 변경에 실패했습니다.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !companyName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 mt-4 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold">기업 마이페이지</h1>
        <div className="flex gap-6">
          <CompanyLeftSidebar
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
          />
          <main className="flex-1">
            <div className="p-8 bg-white border-2 border-purple-500 rounded-lg">
              {activeMenu === "companyMy-sub-1" && (
                <CompanyProfile
                  loading={loading}
                  companyLogo={companyLogo}
                  setCompanyLogo={setCompanyLogo}
                  companyName={companyName}
                  ceoName={ceoName}
                  setCeoName={setCeoName}
                  businessNumber={businessNumber}
                  description={description}
                  setDescription={setDescription}
                  shortIntro={shortIntro}
                  setShortIntro={setShortIntro}
                  website={website}
                  setWebsite={setWebsite}
                  snsUrl={snsUrl}
                  setSnsUrl={setSnsUrl}
                  industry={industry}
                  setIndustry={setIndustry}
                  companySize={companySize}
                  setCompanySize={setCompanySize}
                  address={address}
                  setAddress={setAddress}
                  detailAddress={detailAddress}
                  setDetailAddress={setDetailAddress}
                  onSave={handleSaveCompanyProfile}
                />
              )}
              {activeMenu === "companyMy-sub-2" && (
                <AccountSecurity
                  email={user?.email || ""}
                  managerName={managerName}
                  setManagerName={setManagerName}
                  managerPhone={managerPhone}
                  setManagerPhone={setManagerPhone}
                  managerDepartment={managerDepartment}
                  setManagerDepartment={setManagerDepartment}
                  currentPassword={currentPassword}
                  setCurrentPassword={setCurrentPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  onChangePassword={onChangePassword}
                />
              )}
              {activeMenu === "companyMy-sub-3" && (
                <>
                  
                  
                  <PaymentCredits
                    currentCredit={currentCredit}
                    creditHistory={creditHistory}
                    creditLoading={creditLoading}
                  />
                </>
              )}
              {activeMenu === "companyMy-sub-4" && user?.companyId && (
                <NotificationSettings
                  companyId={user.companyId}
                  onSave={() => console.log('알림 설정 저장 완료')}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
