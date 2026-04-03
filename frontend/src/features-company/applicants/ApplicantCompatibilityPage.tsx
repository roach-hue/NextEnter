import { useNavigate, useParams } from "react-router-dom";
import CompanyLeftSidebar from "../components/CompanyLeftSidebar";
import { useCompanyPageNavigation } from "../hooks/useCompanyPageNavigation";

export default function ApplicantCompatibilityPage() {
  const navigate = useNavigate();
  const { applicantId } = useParams();
  const id = Number(applicantId) || 1;

  const { activeMenu, handleMenuClick } = useCompanyPageNavigation(
    "applicants",
    "applicants-sub-1"
  );

  const compatibilityData = {
    1: {
      name: "김민준",
      totalScore: 93,
      categories: [
        {
          name: "기술 스택 적합도",
          score: 95,
          weight: 30,
          details: [
            { item: "React", required: true, level: "상", match: 95 },
            { item: "TypeScript", required: true, level: "상", match: 98 },
            { item: "Node.js", required: false, level: "중", match: 90 },
            { item: "Next.js", required: false, level: "중", match: 93 },
          ],
        },
        {
          name: "직무 경험 적합도",
          score: 92,
          weight: 25,
          details: [
            {
              item: "프론트엔드 개발 경력",
              required: true,
              level: "5년",
              match: 100,
            },
            { item: "팀 리딩 경험", required: false, level: "있음", match: 85 },
            {
              item: "대규모 프로젝트 경험",
              required: true,
              level: "있음",
              match: 90,
            },
          ],
        },
        {
          name: "프로젝트 경험",
          score: 96,
          weight: 25,
          details: [
            {
              item: "전자상거래 플랫폼 개발",
              required: true,
              level: "상",
              match: 98,
            },
            {
              item: "마이크로서비스 아키텍처",
              required: false,
              level: "중",
              match: 95,
            },
            {
              item: "성능 최적화 경험",
              required: true,
              level: "상",
              match: 95,
            },
          ],
        },
        {
          name: "협업 및 커뮤니케이션",
          score: 90,
          weight: 20,
          details: [
            {
              item: "애자일/스크럼 경험",
              required: false,
              level: "있음",
              match: 92,
            },
            {
              item: "기술 문서화 능력",
              required: true,
              level: "상",
              match: 88,
            },
            {
              item: "코드 리뷰 경험",
              required: false,
              level: "있음",
              match: 90,
            },
          ],
        },
      ],
      strengths: [
        "React 및 TypeScript를 활용한 실무 경험이 풍부합니다",
        "대규모 전자상거래 플랫폼 개발 경험으로 복잡한 시스템 이해도가 높습니다",
        "성능 최적화 및 사용자 경험 개선에 대한 실질적 성과가 있습니다",
      ],
      improvements: [
        "팀 리딩 경험을 더 쌓으면 시니어 개발자로 성장할 수 있습니다",
        "백엔드 기술 스택에 대한 이해도를 높이면 풀스택 개발자로 발전 가능합니다",
      ],
    },
    2: {
      name: "이서윤",
      totalScore: 88,
      categories: [
        {
          name: "기술 스택 적합도",
          score: 90,
          weight: 30,
          details: [
            { item: "Vue.js", required: true, level: "상", match: 92 },
            { item: "JavaScript", required: true, level: "상", match: 95 },
            { item: "CSS/Tailwind", required: true, level: "중", match: 88 },
            { item: "Webpack", required: false, level: "중", match: 85 },
          ],
        },
        {
          name: "직무 경험 적합도",
          score: 88,
          weight: 25,
          details: [
            {
              item: "프론트엔드 개발 경력",
              required: true,
              level: "3년",
              match: 85,
            },
            {
              item: "UI/UX 구현 경험",
              required: true,
              level: "있음",
              match: 92,
            },
            {
              item: "반응형 웹 개발",
              required: true,
              level: "있음",
              match: 88,
            },
          ],
        },
        {
          name: "프로젝트 경험",
          score: 89,
          weight: 25,
          details: [
            { item: "SPA 개발 경험", required: true, level: "상", match: 90 },
            {
              item: "디자인 시스템 구축",
              required: false,
              level: "중",
              match: 88,
            },
            {
              item: "크로스 브라우저 호환성",
              required: true,
              level: "상",
              match: 89,
            },
          ],
        },
        {
          name: "협업 및 커뮤니케이션",
          score: 85,
          weight: 20,
          details: [
            {
              item: "디자이너와 협업 경험",
              required: true,
              level: "있음",
              match: 90,
            },
            {
              item: "Git 협업 프로세스",
              required: true,
              level: "있음",
              match: 85,
            },
            {
              item: "코드 리뷰 참여",
              required: false,
              level: "있음",
              match: 80,
            },
          ],
        },
      ],
      strengths: [
        "Vue.js 생태계에 대한 깊은 이해와 실무 경험이 있습니다",
        "UI/UX에 대한 높은 관심과 구현 능력을 보유하고 있습니다",
        "디자이너와의 원활한 협업 경험이 풍부합니다",
      ],
      improvements: [
        "React 생태계에 대한 학습이 필요합니다",
        "백엔드 API 연동 경험을 더 쌓으면 좋을 것 같습니다",
      ],
    },
  };

  const data =
    compatibilityData[id as keyof typeof compatibilityData] ||
    compatibilityData[1];

  const handleBackClick = () => {
    navigate("/company/applicants");
  };

  const handleInterviewRequest = () => {
    if (window.confirm(`${data.name}님에게 면접 요청을 하시겠습니까?`)) {
      alert("면접 요청이 성공적으로 전송되었습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ 화면 폭 확장 및 레이아웃 수정 */}
      <div className="flex gap-10 px-6 py-8 mx-auto max-w-screen-2xl">
        {/* 왼쪽 사이드바 */}
        <aside className="flex-shrink-0 hidden w-64 lg:block">
          <CompanyLeftSidebar
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
          />
        </aside>

        {/* 메인 컨텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="p-8 bg-white shadow-lg rounded-2xl">
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackClick}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <span>←</span>
                  <span>목록으로</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {data.name}님의 적합성 상세 분석
                </h1>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-purple-600">
                  {data.totalScore}
                </div>
                <div className="text-sm text-gray-500">종합 점수</div>
              </div>
            </div>

            {/* 상세 분석 내용 */}
            <div className="mb-8 space-y-8">
              {data.categories.map((category, idx) => (
                <div
                  key={idx}
                  className="p-6 border-2 border-gray-200 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        가중치: {category.weight}%
                      </span>
                      <span className="px-4 py-2 text-2xl font-bold text-white bg-purple-600 rounded-lg">
                        {category.score}점
                      </span>
                    </div>
                  </div>

                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                            평가 항목
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                            필수 여부
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                            요구 수준
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                            적합도
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {category.details.map((detail, detailIdx) => (
                          <tr key={detailIdx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {detail.item}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  detail.required
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {detail.required ? "필수" : "선택"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-700">
                              {detail.level}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <div className="w-24 h-2 overflow-hidden bg-gray-200 rounded-full">
                                  <div
                                    className="h-full bg-purple-600 rounded-full"
                                    style={{ width: `${detail.match}%` }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-purple-600">
                                  {detail.match}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* 강점 및 성장 가능성 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 border-2 border-green-200 rounded-xl bg-green-50">
                <h3 className="flex items-center mb-4 text-lg font-bold text-green-900">
                  <span className="mr-2 text-2xl">✓</span>
                  주요 강점
                </h3>
                <ul className="space-y-3">
                  {data.strengths.map((strength, idx) => (
                    <li
                      key={idx}
                      className="flex items-start space-x-2 text-sm text-gray-700"
                    >
                      <span className="flex-shrink-0 mt-1 text-green-600">
                        •
                      </span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 border-2 border-orange-200 rounded-xl bg-orange-50">
                <h3 className="flex items-center mb-4 text-lg font-bold text-orange-900">
                  <span className="mr-2 text-2xl">💡</span>
                  성장 가능성
                </h3>
                <ul className="space-y-3">
                  {data.improvements.map((improvement, idx) => (
                    <li
                      key={idx}
                      className="flex items-start space-x-2 text-sm text-gray-700"
                    >
                      <span className="flex-shrink-0 mt-1 text-orange-600">
                        •
                      </span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBackClick}
                className="flex-1 px-6 py-3 font-semibold text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                목록으로
              </button>
              <button
                onClick={handleInterviewRequest}
                className="flex-1 px-6 py-3 font-semibold text-white transition bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                면접 요청
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
