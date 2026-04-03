export default function Sidebar() {
  return (
    <aside className="sticky top-24 w-80 space-y-6 h-fit">
      {/* 오늘의 한줄 꿀팁 */}
      <div className="bg-white border-2 border-blue-500 rounded-2xl p-8 shadow-lg">
        <h3 className="font-bold text-2xl mb-4 text-blue-600">
          오늘의 한줄 꿀팁
        </h3>
        <p className="text-gray-700 mb-6 leading-relaxed text-base">
          왜 경쟁자는 합격하고,
          <br />
          나는 탈락할까?
          <br />그 이유를 알고 싶다면?
        </p>
        <button className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-md">
          확인하기
        </button>
      </div>

      {/* AI 분석 */}
      <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-8 text-white shadow-lg">
        <h3 className="font-bold text-xl mb-4">AI 이력서 분석</h3>
        <p className="text-sm mb-6 leading-relaxed">
          AI가 당신의 이력서를 분석하고
          <br />
          개선점을 제안해드립니다
        </p>
        <button className="w-full px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition">
          분석 시작
        </button>
      </div>

      {/* 내 프로필 */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
            나
          </div>
          <div>
            <h3 className="font-bold text-lg">내 프로필</h3>
            <p className="text-sm text-gray-500">완성도: 60%</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-blue-500 h-3 rounded-full"
            style={{ width: "60%" }}
          ></div>
        </div>
        <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
          프로필 완성하기
        </button>
      </div>

      {/* 추천 서비스 */}
      <div className="bg-white border-2 border-green-500 rounded-2xl p-8 shadow-lg">
        <h3 className="font-bold text-xl mb-4 text-green-600">
          🎯 추천 서비스
        </h3>
        <ul className="space-y-4">
          <li className="flex items-center space-x-3">
            <span className="text-2xl">📝</span>
            <span className="text-sm text-gray-700">자기소개서 작성</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="text-2xl"></span>
            <span className="text-sm text-gray-700">포트폴리오 제작</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="text-2xl">🎤</span>
            <span className="text-sm text-gray-700">면접 코칭</span>
          </li>
        </ul>
      </div>

      {/* 최근 본 공고 */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
        <h3 className="font-bold text-xl mb-4">최근 본 공고</h3>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
            <p className="font-semibold text-sm">프론트엔드 개발자</p>
            <p className="text-xs text-gray-500">테크 컴퍼니</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
            <p className="font-semibold text-sm">백엔드 개발자</p>
            <p className="text-xs text-gray-500">스타트업</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
            <p className="font-semibold text-sm">풀스택 개발자</p>
            <p className="text-xs text-gray-500">IT 기업</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
