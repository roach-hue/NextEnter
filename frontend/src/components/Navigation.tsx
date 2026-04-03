interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const navItems = [
  { id: "job", label: "채용정보" },
  { id: "resume", label: "이력서" },
  { id: "ai-recommend", label: "AI 추천 공고" },
  { id: "matching", label: "매칭분석" },
  { id: "interview", label: "면접준비" },
  { id: "mypage", label: "마이페이지" },
  { id: "credit", label: "크레딧" },
];

export default function Navigation({
  activeTab,
  onTabChange,
}: NavigationProps) {
  return (
    <nav className="bg-white border-b-2 border-blue-600">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex items-center space-x-8">
          <button className="p-4 hover:bg-gray-50">
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
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`py-4 px-2 font-medium transition whitespace-nowrap ${
                activeTab === item.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
