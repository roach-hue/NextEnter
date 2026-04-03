import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import CompanyHoverMenu from "../navigation-menu/components/CompanyHoverMenu";
import CompanyDropdownMenu from "../navigation-menu/components/CompanyDropdownMenu";
import { useAuthStore } from "../../stores/authStore";
import { logout as logoutApi } from "../../api/auth";
import { checkNavigationBlocked } from "../../utils/navigationBlocker";
import { getUnreadCount } from "../../api/notification";
import { websocketService, NotificationMessage } from "../../services/websocket";

const MENU_CLOSE_DELAY = 150;

const LOGIN_REQUIRED_MENUS = ["jobs", "applicants", "talent", "ads", "credit"];

export default function CompanyHeader() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 알림 개수 가져오기 및 웹소켓 연결
  useEffect(() => {
    if (isLoading) {
      console.log('⏳ AuthContext 로딩 중...');
      return;
    }
    
    console.log('CompanyHeader useEffect 실행 - isAuthenticated:', isAuthenticated, 'user:', user);
    console.log('user.userId:', user?.userId);
    
    const fetchUnreadCount = async () => {
      if (isAuthenticated && user?.userId) {
        try {
          const count = await getUnreadCount('company', user.userId);
          console.log('기업 알림 개수 로드 성공:', count);
          setUnreadCount(count);
        } catch (error) {
          console.error('기업 알림 개수 로드 실패:', error);
          setUnreadCount(0);
        }
      } else {
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    
    const handleNotificationRead = () => {
      console.log('🔔 기업 알림 읽음 이벤트 감지 - 알림 개수 다시 로드');
      fetchUnreadCount();
    };
    window.addEventListener('notification-read', handleNotificationRead);
    
    if (isAuthenticated && user?.userId) {
      console.log('✅ 기업 웹소켓 연결 조건 충족 - userId:', user.userId);
      websocketService.connect(user.userId, 'company', handleNewNotification);
    } else {
      console.log('❌ 기업 웹소켓 연결 조건 미충족 - isAuthenticated:', isAuthenticated, 'userId:', user?.userId);
    }
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notification-read', handleNotificationRead);
      console.log('CompanyHeader 언마운트 - 웹소켓 연결 해제');
      websocketService.disconnect();
    };
  }, [isAuthenticated, user, isLoading]);

  // 새 알림 수신 시 처리
  const handleNewNotification = (notification: NotificationMessage) => {
    console.log('기업 새 알림 도착!', notification);
    setUnreadCount(prev => prev + 1);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.content,
        icon: '/favicon.ico',
        tag: `notification-${notification.id}`
      });
    }
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/company/jobs")) return "jobs";
    if (path.startsWith("/company/applicants")) return "applicants";
    if (path.startsWith("/company/talent-search")) return "talent";
    if (path.startsWith("/company/mypage")) return "companyMy";
    if (path.startsWith("/company/credit")) return "credit";
    return "";
  };

  const activeTab = getActiveTab();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("검색:", searchQuery);
  };

  const handleMouseEnter = (tabId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredTab(tabId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredTab(null);
    }, MENU_CLOSE_DELAY);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    if (checkNavigationBlocked()) return;

    try {
      await logoutApi();
    } catch (error) {
      console.error("로그아웃 API 오류:", error);
    } finally {
      logout();
      setIsUserMenuOpen(false);
      window.location.href = "/company";
    }
  };

  const handleMenuClick = (tabId: string, menuId?: string) => {
    if (checkNavigationBlocked()) return;
  
    const checkTabId = menuId ? menuId.split("-sub-")[0] : tabId;
    if (LOGIN_REQUIRED_MENUS.includes(checkTabId) && !isAuthenticated) {
      alert("로그인이 필요한 기능입니다.");
      navigate("/company/login");
      return;
    }
  
    const defaultSubMenus: { [key: string]: string } = {
      jobs: "jobs-sub-1",
      applicants: "applicants-sub-1",
      talent: "talent-sub-1",
      companyMy: "companyMy-sub-1",
      credit: "credit-sub-1",
    };
  
    const baseRoutes: { [key: string]: string } = {
      jobs: "/company/jobs/all",
      applicants: "/company/applicants",
      talent: "/company/talent-search",
      companyMy: "/company/mypage",
      credit: "/company/credit",
    };
  
    const separateRoutes: { [key: string]: string } = {
      "jobs-sub-2": "/company/jobs",
      "credit-sub-2": "/company/credit/charge",
      "applicants-sub-2": "/company/applicants/1/compatibility",
      "talent-sub-2": "/company/scrap-talent",
    };
  
    const targetMenuId = menuId || defaultSubMenus[tabId];
    const targetPath = separateRoutes[targetMenuId] || baseRoutes[tabId];
  
    const currentMenu = searchParams.get("menu");
    if (currentMenu === targetMenuId) {
      const timestamp = Date.now();
      navigate(`${targetPath}?menu=${targetMenuId}&reload=${timestamp}`);
      return;
    }
  
    if (targetPath) {
      navigate(`${targetPath}?menu=${targetMenuId}`);
    }
  };

  const handleLogoClick = () => {
    if (checkNavigationBlocked()) return;
    navigate("/company");
  };

  const navItems = [
    { id: "jobs", label: "채용 공고" },
    { id: "applicants", label: "지원자 관리" },
    { id: "talent", label: "인재 검색" },
    { id: "companyMy", label: "마이페이지" },
    { id: "credit", label: "크레딧" },
  ];

  return (
    <>
      {/* Fixed Header Container */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        {/* Top Header (Logo Area) */}
        <header className={`bg-white border-b border-gray-200 transition-all duration-300 overflow-hidden ${
          isScrolled ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'
        }`}>
          <div className="px-4 py-4 mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <button className="lg:hidden">
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <div
                  onClick={handleLogoClick}
                  className="flex items-center transition cursor-pointer hover:opacity-80"
                >
                  <span className="text-2xl font-bold text-purple-600">
                    NextEnter
                  </span>
                  <span className="ml-2 text-sm font-medium text-purple-400">
                    기업
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <form
                onSubmit={handleSearch}
                className="flex-1 max-w-md mx-auto transform -translate-x-[17.5px]"
              >
                <div className="relative">
                  <svg
                    className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="인재를 검색하세요"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500"
                  />
                </div>
              </form>


            </div>
          </div>
        </header>

        {/* Navigation Bar (Category) */}
        <nav className={`relative bg-white border-b border-purple-600 shadow-sm transition-all duration-300 ${
          isScrolled ? 'shadow-md' : ''
        }`}>
          <div className="px-4 mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
              <button
                onClick={toggleDropdown}
                className="p-4 transition hover:bg-gray-50"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isDropdownOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

              {navItems.map((item) => (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`relative py-4 px-2 font-medium transition whitespace-nowrap ${
                      activeTab === item.id
                        ? "text-purple-600"
                        : "text-gray-700 hover:text-purple-600"
                    }`}
                  >
                    {item.label}
                    {activeTab === item.id && (
                      <span className="absolute -bottom-[1px] left-0 w-full h-0.5 bg-purple-600" />
                    )}
                  </button>
                  {hoveredTab === item.id && (
                    <CompanyHoverMenu
                      tabId={item.id}
                      onSubMenuClick={(tabId, subId) =>
                        handleMenuClick(tabId, subId)
                      }
                      onClose={() => setHoveredTab(null)}
                    />
                  )}
                </div>
              ))}
              </div>
              
              {/* Right Buttons */}
              <div className="flex items-center space-x-4">
                {/* 알림 아이콘 */}
                {isAuthenticated && (
                  <button
                    onClick={() => navigate("/company/notifications")}
                    className="relative p-2 text-gray-700 transition hover:text-purple-600 hover:bg-gray-100 rounded-full"
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
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
                      )}
                    </button>
                )}
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center px-4 py-2 space-x-2 text-gray-700 transition hover:text-purple-600"
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span className="font-medium">
                        {user?.name || "기업"}님
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isUserMenuOpen ? "rotate-180" : ""
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

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999]">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            if (!checkNavigationBlocked())
                              navigate("/company/credit");
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 transition hover:bg-gray-50"
                        >
                          크레딧 관리
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-red-600 transition hover:bg-gray-50"
                        >
                          로그아웃
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/company/login")}
                      className="px-4 py-2 text-gray-700 transition hover:text-purple-600"
                    >
                      로그인
                    </button>
                    <button
                      onClick={() => navigate("/company/signup")}
                      className="px-4 py-2 text-gray-700 transition hover:text-purple-600"
                    >
                      회원가입
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="relative z-[45]">
          <CompanyDropdownMenu
            isOpen={isDropdownOpen}
            onMenuClick={(menuId) => {
              setIsDropdownOpen(false);
              const tabId = menuId.split("-sub-")[0];
              handleMenuClick(tabId, menuId);
            }}
          />
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed header */}
      <div className={`transition-all duration-300 ${
        isScrolled ? 'h-[57px]' : 'h-[137px]'
      }`}></div>
    </>
  );
}
