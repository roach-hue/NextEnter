import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../stores/authStore";

export default function BusinessServicePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [activeService, setActiveService] = useState<string>("");

  // 로그인 필요한 페이지 이동 처리
  const handleProtectedNavigation = (path: string) => {
    if (!isAuthenticated || user?.userType !== "company") {
      alert("기업 회원 로그인이 필요합니다.");
      navigate("/company/login");
      return;
    }
    navigate(path);
  };

  const services = [
    {
      id: "announcement",
      icon: "📄",
      title: "공고 관리",
      description: "채용 정보",
      features: ["지원 확인", "지원 예약", "지원 예약"],
      path: "/company/jobs",
    },
    {
      id: "talent",
      icon: "👥",
      title: "인재 검색",
      description: "지원 확인",
      features: ["지원 확인", "지원 예약", "지원 예약"],
      path: "/company/talent-search",
    },
    {
      id: "applicant",
      icon: "👥",
      title: "지원자 관리",
      description: "지원 확인",
      features: ["지원 확인", "지원 예약", "지원 예약"],
      path: "/company/applicants",
    },
    {
      id: "credit",
      icon: "💳",
      title: "크레딧",
      description: "크레딧 충전 및 관리",
      features: ["크레딧 충전", "사용 내역", "충전 혜택"],
      path: "/company/credit",
    },
  ];

  const products = [
    {
      id: 1,
      badge: "프리미엄 급구 추천",
      title: "시니어 프론트엔드 개발자",
      description: "React, TypeScript 경험 5년 이상 | 월급 500만원 이상",
      tags: [
        "5년 이상 경력 필수",
        "React, TypeScript 전문가",
        "대규모 프로젝트 경험",
        "팀 리딩 경험 우대",
        "혁신적인 UI/UX 구현 능력",
      ],
      seller: "테크 스타트업 A사",
      period: "급구 + 상시채용",
      price: "연봉 6,000만원",
    },
    {
      id: 2,
      badge: "인기 급상승",
      title: "백엔드 개발자 (Node.js)",
      description: "Node.js, Express 기반 API 개발 | 3년 이상 경력",
      tags: [
        "3년 이상 실무 경험",
        "RESTful API 설계 및 구현",
        "데이터베이스 최적화 경험",
        "MSA 아키텍처 이해",
      ],
      seller: "핀테크 기업 B사",
      period: "상시채용",
      price: "연봉 5,000만원",
    },
    {
      id: 3,
      badge: "원격근무 가능",
      title: "풀스택 개발자",
      description: "React + Spring Boot 풀스택 | 경력 무관",
      tags: [
        "신입/경력 모두 가능",
        "React 및 Spring Boot 경험",
        "원격근무 주 2일 가능",
        "유연한 근무 환경",
        "성장 지향적인 팀 문화",
      ],
      seller: "이커머스 C사",
      period: "상시채용",
      price: "연봉 4,500만원",
    },
  ];

  const handleLogoClick = () => {
    navigate("/company");
  };

  const handleJobDetailClick = (jobId: number) => {
    handleProtectedNavigation(`/company/jobs/${jobId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/company/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <div
              onClick={handleLogoClick}
              className="transition-opacity cursor-pointer hover:opacity-80"
            >
              <span className="text-2xl font-bold text-blue-600">Next </span>
              <span className="text-2xl font-bold text-blue-800">Enter</span>
            </div>

            {/* 중앙 네비게이션 */}
            <nav className="flex space-x-8">
              <button
                onClick={() => handleProtectedNavigation("/company/jobs")}
                className="px-4 py-2 text-gray-700 hover:text-blue-600"
              >
                채용공고
              </button>
              <button
                onClick={() =>
                  handleProtectedNavigation("/company/talent-search")
                }
                className="px-4 py-2 text-gray-700 hover:text-blue-600"
              >
                인재검색
              </button>
            </nav>

            {/* 오른쪽 로그인/회원가입 또는 사용자 정보 */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user?.userType === "company" ? (
                <>
                  <span className="font-medium text-gray-700">
                    {user.companyName || user.name}님
                  </span>
                  <button
                    onClick={() => navigate("/company/credit")}
                    className="px-4 py-2 text-gray-700 transition hover:text-blue-600"
                  >
                    크레딧 관리
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/company/login")}
                    className="px-4 py-2 text-gray-700 transition hover:text-blue-600"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => navigate("/company/signup")}
                    className="px-4 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    회원가입
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 배너 */}
      <div className="py-6 text-white bg-gradient-to-r from-purple-600 to-blue-500">
        <div className="px-4 mx-auto text-center max-w-7xl">
          <h1 className="text-2xl font-bold">
            더 나은 인재를 구하기 위한 플랫폼
          </h1>
        </div>
      </div>

      {/* 서비스 카드 섹션 */}
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => {
                setActiveService(service.id);
                handleProtectedNavigation(service.path);
              }}
              className={`p-6 bg-white border-2 rounded-xl hover:shadow-lg transition ${
                activeService === service.id
                  ? "border-blue-500"
                  : "border-gray-200"
              }`}
            >
              <div className="mb-2 text-4xl">{service.icon}</div>
              <h3 className="mb-1 text-lg font-bold">{service.title}</h3>
              <p className="mb-3 text-sm text-gray-600">
                {service.description}
              </p>
              <div className="space-y-1 text-xs text-left text-gray-500">
                {service.features.map((feature, idx) => (
                  <div key={idx}>{feature}</div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* 기재 공고 섹션 */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">기재 공고</h2>
          <div className="grid grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden transition bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg"
              >
                {/* 상품 배지 */}
                {product.badge && (
                  <div className="px-3 py-2 text-sm font-bold text-white bg-orange-500">
                    ⚡ {product.badge}
                  </div>
                )}

                {/* 상품 내용 */}
                <div className="p-4">
                  <h3 className="mb-2 text-lg font-bold">{product.title}</h3>

                  {/* 상품 설명 */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-700">
                      {product.description}
                    </p>
                  </div>

                  {/* 태그들 */}
                  <div className="mb-4 space-y-1">
                    {product.tags.map((tag, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 mt-1 text-blue-600">
                          •
                        </span>
                        <span className="text-xs text-gray-600">{tag}</span>
                      </div>
                    ))}
                  </div>

                  {/* 판매자 정보 */}
                  <div className="pt-3 mb-3 text-sm border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{product.seller}</span>
                      <span className="px-2 py-1 text-xs text-blue-600 rounded bg-blue-50">
                        {product.period}
                      </span>
                    </div>
                  </div>

                  {/* 가격 및 버튼 */}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      {product.price}
                    </span>
                    <button
                      onClick={() => handleJobDetailClick(product.id)}
                      className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      확인하기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
