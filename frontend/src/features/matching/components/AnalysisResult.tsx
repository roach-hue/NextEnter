import { useNavigate } from 'react-router-dom';
import { CompanyInfo } from '../../../api/ai';
import ActionButtons from './ActionButtons';

interface AnalysisResultProps {
  recommendedCompanies: CompanyInfo[];
  aiReport: string;
  grade: string;
  score: number;
  experienceLevel: string;
  onReanalyze: () => void;
  onEditResume: () => void;
}

export default function AnalysisResult({
  recommendedCompanies = [],
  aiReport = "",
  grade = "B",
  score = 0,
  experienceLevel = "JUNIOR",
  onReanalyze,
  onEditResume,
}: AnalysisResultProps) {
  const navigate = useNavigate();

  const getGradeColor = (g: string) => {
    switch (g) {
      case 'S': return 'from-yellow-400 to-orange-500';
      case 'A': return 'from-green-400 to-emerald-600';
      case 'B': return 'from-blue-400 to-blue-600';
      case 'C': return 'from-gray-400 to-gray-600';
      case 'F': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getGradeText = (g: string) => {
    switch (g) {
      case 'S': return '최우수';
      case 'A': return '우수';
      case 'B': return '보통';
      case 'C': return '미흡';
      case 'F': return '부적합';
      default: return '분석중';
    }
  };
  const getMatchLevelColor = (level: string) => {
    switch (level) {
      case 'BEST':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'HIGH':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'GAP':
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getMatchLevelText = (level: string) => {
    switch (level) {
      case 'BEST':
        return '최적 매칭';
      case 'HIGH':
        return '충분하다';
      case 'GAP':
        return '스킬 보완 필요';
    }
  };

  return (
    <div className="space-y-6">
      {/* 이력서 등급 카드 */}
      <div className={`p-6 bg-gradient-to-r ${getGradeColor(grade)} rounded-2xl`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-1 text-lg font-semibold text-white/90">이력서 종합 등급</h3>
            <p className="text-white/70 text-sm">AI가 분석한 이력서 경쟁력 등급입니다</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full font-bold text-sm ${
              experienceLevel === "SENIOR"
                ? "bg-amber-400 text-amber-900"
                : "bg-white/20 text-white"
            }`}>
              {experienceLevel === "SENIOR" ? "시니어" : "주니어"}
            </div>
            <div className="text-center">
              <div className="text-6xl font-black text-white drop-shadow-lg">{grade}</div>
              <div className="text-sm font-bold text-white/90 mt-1">{getGradeText(grade)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 추천 결과 헤더 */}
      <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
        <h3 className="mb-2 text-2xl font-bold text-white">
          AI 기업 추천 결과
        </h3>
        <p className="text-blue-100">
          이력서를 분석하여 가장 적합한 기업 {recommendedCompanies?.length || 0}곳을 추천합니다
        </p>
      </div>

      {/* 추천 기업 카드 */}
      <div className="space-y-4">
        {recommendedCompanies.map((company, idx) => (
          <div
            key={idx}
            className="p-6 bg-white border-2 border-gray-200 transition hover:border-blue-400 hover:shadow-lg rounded-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-blue-600">
                    #{idx + 1}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {company.company_name}
                  </h3>
                </div>
                <p className="text-lg text-gray-600 mb-3">{company.role}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-4 py-2 rounded-full border-2 font-bold text-sm ${getMatchLevelColor(company.match_level)}`}>
                  {getMatchLevelText(company.match_level)}
                </span>
                {company.is_exact_match && (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-bold">
                    ⭐ 완벽 매칭
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                <span className="text-2xl font-bold text-white">
                  {company.score}
                </span>
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">매칭 점수</p>
                <p className="text-2xl font-bold text-blue-900">{company.score}점</p>
              </div>
            </div>

            {/* 부족한 스킬 표시 (GAP인 경우에만) */}
            {company.match_level === 'GAP' && company.missing_skills && company.missing_skills.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                <p className="mb-2 text-sm font-bold text-red-700">보완 필요 스킬</p>
                <div className="flex flex-wrap gap-2">
                  {company.missing_skills.map((skill, skillIdx) => (
                    <span
                      key={skillIdx}
                      className="px-3 py-1 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 지원하기 버튼 */}
            {company.job_id && company.job_id > 0 && (
              <div className="mt-4 flex justify-end">
                {company.job_status === "CLOSED" ? (
                  <button
                    disabled
                    className="px-5 py-2 text-sm font-bold text-gray-500 bg-gray-200 rounded-lg cursor-not-allowed"
                  >
                    마감
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/user/jobs/${company.job_id}`)}
                    className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    지원하기
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI 리포트 */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">🤖</span>
          <h4 className="text-xl font-bold text-gray-900">AI 분석 리포트</h4>
        </div>
        <div className="p-4 bg-white rounded-xl border border-blue-100">
          <p className="whitespace-pre-line text-gray-700 leading-relaxed">
            {aiReport}
          </p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <ActionButtons
        onReanalyze={onReanalyze}
        onEditResume={onEditResume}
      />
    </div>
  );
}
