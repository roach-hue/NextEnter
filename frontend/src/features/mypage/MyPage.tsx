import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useResumeStore } from "../../stores/resumeStore";
import { getUserProfile, UserProfile } from "../../api/user";
import { usePageNavigation } from "../../hooks/usePageNavigation";
// ✅ [수정] LeftSidebar 사용
import LeftSidebar from "../../components/LeftSidebar";

interface MyPageProps {
  onNavigate?: (page: string, subMenu?: string) => void;
  onEditProfile?: () => void;
  initialMenu?: string;
}

export default function MyPage({
  onNavigate,
  onEditProfile,
  initialMenu,
}: MyPageProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { resumes } = useResumeStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const { activeMenu, handleMenuClick } = usePageNavigation(
    "mypage",
    initialMenu || "mypage-sub-1",
    onNavigate,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 프로필 정보 불러오기
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.userId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await getUserProfile(user.userId);
        if (response.success && response.data) {
          setProfile(response.data);
        }
      } catch (err: any) {
        console.error("프로필 로드 오류:", err);
        setError("프로필을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      loadProfile();
    }
  }, [user?.userId]);

  const handleClick = (item: string) => {
    switch (item) {
      case "입사 지원 현황":
        handleMenuClick("application-status");
        break;
      case "모의 면접":
        handleMenuClick("interview-sub-1");
        break;
      case "이력서 열람":
        handleMenuClick("resume-sub-1");
        break;
      case "AI 맞춤 공고":
        handleMenuClick("job-sub-2");
        break;
      case "스크랩 현황":
        alert("스크랩 현황 기능은 준비 중입니다.");
        break;
      case "관심 기업":
        alert("관심 기업 기능은 준비 중입니다.");
        break;
      default:
        break;
    }
  };

  const mainCards = [
    { id: 1, title: "입사\n지원\n현황", icon: "📋" },
    { id: 2, title: "모의 면접", icon: "🎤" },
    { id: 3, title: "이력서\n열람", icon: "📄" },
    { id: 4, title: "AI\n맞춤 공고", icon: "🔔" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
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
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="px-4 py-8 mx-auto max-w-7xl">
          {/* ✅ [수정] h1 태그 삭제 (사이드바 title로 이동) */}

          {/* ✅ [수정] items-start 추가 (Sticky 적용) */}
          <div className="flex items-start gap-6">
            {/* ✅ [수정] LeftSidebar 교체 및 Title 적용 */}
            <LeftSidebar
              title="마이페이지"
              activeMenu={activeMenu}
              onMenuClick={handleMenuClick}
            />

            {/* 메인 컨텐츠 영역 */}
            <div className="flex flex-1 gap-6">
              {/* 프로필 패널 */}
              <aside className="w-52">
                <div className="p-6 space-y-4 bg-white border-2 border-purple-500 rounded-lg">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <div className="flex items-center justify-center w-full h-full overflow-hidden bg-gray-200 border-2 border-blue-400 rounded-full">
                        {profile?.profileImage ? (
                          <img
                            src={profile.profileImage}
                            alt="프로필"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        )}
                      </div>
                      <button
                        onClick={() => handleMenuClick("mypage-sub-2")}
                        className="absolute bottom-0 right-0 p-1.5 bg-orange-500 rounded-full hover:bg-orange-600 transition"
                        title="내 정보 수정"
                      >
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
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="px-8 py-1 border-2 border-blue-400 rounded-full">
                      <span className="text-sm">{user?.name || "이름"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClick("스크랩 현황")}
                    className="flex items-center justify-center w-full gap-2 py-3 transition bg-white border-2 border-blue-400 rounded-lg hover:bg-blue-50"
                  >
                    <span>⭐</span>
                    <span className="font-medium">스크랩 현황</span>
                  </button>

                  <button
                    onClick={() => handleClick("관심 기업")}
                    className="flex items-center justify-center w-full gap-2 py-3 transition bg-white border-2 border-blue-400 rounded-lg hover:bg-blue-50"
                  >
                    <span>🏢</span>
                    <span className="font-medium">관심 기업</span>
                  </button>
                </div>
              </aside>

              {/* 메인 컨텐츠 */}
              <main className="flex-1">
                {/* 기본 화면 (mypage-sub-1) */}
                <div className="p-8 mb-6 bg-white border-2 border-blue-500 rounded-lg">
                  <h2 className="mb-6 text-2xl font-bold text-center">
                    이력서
                  </h2>

                  <div className="grid grid-cols-4 gap-4">
                    {mainCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() =>
                          handleClick(card.title.replace(/\n/g, " "))
                        }
                        className="flex flex-col items-center justify-center h-32 p-6 transition bg-white border-2 border-blue-400 rounded-lg cursor-pointer hover:shadow-lg"
                      >
                        <span className="mb-2 text-3xl">{card.icon}</span>
                        <span className="text-sm font-medium text-center whitespace-pre-line">
                          {card.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 내 이력서 섹션 - 실제 데이터 사용 */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📁</span>
                    <h3
                      className="text-lg font-bold cursor-pointer hover:text-blue-600"
                      onClick={() => handleMenuClick("resume-sub-1")}
                    >
                      내 이력서 ({resumes.length}개) &gt;
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {resumes.length === 0 ? (
                      <div className="p-12 text-center bg-white border-2 border-blue-400 rounded-lg">
                        <div className="mb-4 text-4xl">📄</div>
                        <p className="mb-4 text-gray-600">
                          등록된 이력서가 없습니다.
                        </p>
                        <button
                          onClick={() => handleMenuClick("resume-sub-1")}
                          className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          이력서 작성하기
                        </button>
                      </div>
                    ) : (
                      resumes.slice(0, 3).map((resume) => (
                        <div
                          key={resume.id}
                          className="p-6 transition bg-white border-2 border-blue-400 rounded-lg hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="mb-1 text-lg font-bold">
                                {resume.title}
                              </h4>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <span>산업: {resume.industry}</span>
                                <span>지원: {resume.applications}건</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMenuClick("resume-sub-1")}
                                className="px-4 py-2 text-sm transition bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleMenuClick("resume-sub-1")}
                                className="px-6 py-2 text-sm text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
                              >
                                이력서 공개
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
