import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "../../../components/LeftSidebar";
import { useAuthStore } from "../../../stores/authStore";
import { getMatchingsByUserId, MatchingHistoryDTO } from "../../../api/matching";

interface MatchingHistoryPageProps {
  onBackToMatching: () => void;
  activeMenu: string;
  onMenuClick: (menuId: string) => void;
}

/** 같은 분석 세션의 기업들을 묶은 그룹 */
interface AnalysisGroup {
  key: string;
  date: string;
  resumeId: number;
  topCompany: MatchingHistoryDTO;
  otherCompanies: MatchingHistoryDTO[];
  feedback: string | null;
}

/**
 * 같은 분석 세션의 매칭 기록을 그룹화한다.
 * 기준: 같은 resumeId + createdAt이 60초 이내
 */
function groupBySession(records: MatchingHistoryDTO[]): AnalysisGroup[] {
  if (records.length === 0) return [];

  // createdAt DESC로 정렬 (최신 순)
  const sorted = [...records].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const groups: AnalysisGroup[] = [];
  const used = new Set<number>();

  for (const record of sorted) {
    if (used.has(record.matchingId)) continue;

    const recordTime = new Date(record.createdAt).getTime();

    // 같은 세션에 속하는 레코드 수집
    const sessionRecords = sorted.filter((r) => {
      if (used.has(r.matchingId)) return false;
      if (r.resumeId !== record.resumeId) return false;
      const diff = Math.abs(new Date(r.createdAt).getTime() - recordTime);
      return diff < 60000; // 60초 이내
    });

    // 점수 높은 순 정렬 (1위가 먼저)
    sessionRecords.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    sessionRecords.forEach((r) => used.add(r.matchingId));

    const [top, ...others] = sessionRecords;
    groups.push({
      key: `${top.resumeId}-${top.createdAt}`,
      date: top.createdAt,
      resumeId: top.resumeId,
      topCompany: top,
      otherCompanies: others,
      feedback: top.feedback,
    });
  }

  return groups;
}

export default function MatchingHistoryPage({
  onBackToMatching,
  activeMenu,
  onMenuClick,
}: MatchingHistoryPageProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [matchingHistory, setMatchingHistory] = useState<MatchingHistoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchMatchingHistory = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      try {
        const userIdNum = typeof user.userId === "string"
          ? parseInt(user.userId)
          : user.userId;

        const data = await getMatchingsByUserId(userIdNum);
        setMatchingHistory(data);
      } catch (error) {
        console.error("[MatchingHistory] 조회 실패:", error);
        setMatchingHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchingHistory();
  }, [user?.userId]);

  const groups = groupBySession(matchingHistory);

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case "S": return { bg: "bg-gradient-to-r from-yellow-400 to-orange-500", text: "text-yellow-600", badge: "bg-yellow-100 text-yellow-800 border-yellow-300" };
      case "A": return { bg: "bg-gradient-to-r from-green-400 to-emerald-600", text: "text-green-600", badge: "bg-green-100 text-green-800 border-green-300" };
      case "B": return { bg: "bg-gradient-to-r from-blue-400 to-blue-600", text: "text-blue-600", badge: "bg-blue-100 text-blue-800 border-blue-300" };
      case "C": return { bg: "bg-gradient-to-r from-gray-400 to-gray-600", text: "text-gray-600", badge: "bg-gray-100 text-gray-800 border-gray-300" };
      case "F": return { bg: "bg-gradient-to-r from-red-400 to-red-600", text: "text-red-600", badge: "bg-red-100 text-red-800 border-red-300" };
      default: return { bg: "bg-gray-400", text: "text-gray-600", badge: "bg-gray-100 text-gray-800 border-gray-300" };
    }
  };

  const getGradeText = (grade: string) => {
    switch (grade) {
      case "S": return "최우수";
      case "A": return "우수";
      case "B": return "보통";
      case "C": return "미흡";
      case "F": return "부적합";
      default: return "등급 미정";
    }
  };

  const getMatchLevelText = (pros: string | null) => {
    switch (pros) {
      case "BEST": return "최적 매칭";
      case "HIGH": return "충분하다";
      case "GAP": return "스킬 보완 필요";
      default: return "";
    }
  };

  const getMatchLevelColor = (pros: string | null) => {
    switch (pros) {
      case "BEST": return "bg-green-100 text-green-700 border-green-300";
      case "HIGH": return "bg-blue-100 text-blue-700 border-blue-300";
      case "GAP": return "bg-gray-100 text-gray-700 border-gray-300";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString();
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">매칭 히스토리</h1>
          </div>
          <div className="flex gap-6">
            <LeftSidebar activeMenu={activeMenu} onMenuClick={onMenuClick} />
            <div className="flex-1">
              <div className="p-16 text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xl font-bold text-gray-500">로딩 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">매칭 히스토리</h1>
        </div>

        <div className="flex gap-6">
          <LeftSidebar activeMenu={activeMenu} onMenuClick={onMenuClick} />

          <div className="flex-1 space-y-6">
            {/* 안내 메시지 */}
            <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="mb-1 font-bold text-blue-900">
                    총 {groups.length}회의 AI 매칭 분석 기록
                  </h3>
                  <p className="text-sm text-blue-700">
                    각 분석의 추천 기업 상세를 펼쳐서 확인하세요
                  </p>
                </div>
              </div>
            </div>

            {groups.length === 0 ? (
              <div className="p-16 text-center bg-white border-2 border-gray-200 rounded-2xl">
                <div className="mb-4 text-6xl">📄</div>
                <h3 className="mb-2 text-2xl font-bold text-gray-400">
                  분석 내역이 없습니다
                </h3>
                <p className="mb-6 text-gray-500">
                  AI 매칭 분석을 시작하여 히스토리를 쌓아보세요
                </p>
                <button
                  onClick={onBackToMatching}
                  className="px-8 py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  AI 매칭 분석 시작하기
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                {groups.map((group) => {
                  const top = group.topCompany;
                  // 이력서 종합 등급 (resumeGrade 우선, 없으면 grade fallback)
                  const resumeGrade = top.resumeGrade || top.grade;
                  const resumeGradeStyle = getGradeStyle(resumeGrade);
                  const topGradeStyle = getGradeStyle(top.grade); // 기업 매칭 등급 (점수 바 색상용)
                  const isExpanded = expandedKey === group.key;

                  return (
                    <div
                      key={group.key}
                      className="bg-white border-2 border-gray-200 rounded-2xl transition hover:border-blue-400 hover:shadow-lg"
                    >
                      {/* 카드 헤더 - 이력서 등급 (항상 보임) */}
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => setExpandedKey(isExpanded ? null : group.key)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* 이력서 등급 정보 */}
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${resumeGradeStyle.bg}`}>
                                <span className="text-2xl font-black text-white">{resumeGrade}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-bold text-gray-900">
                                    이력서 등급: {getGradeText(resumeGrade)}
                                  </h3>
                                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                    top.experienceLevel === "SENIOR"
                                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                                      : "bg-sky-100 text-sky-800 border border-sky-300"
                                  }`}>
                                    {top.experienceLevel === "SENIOR" ? "시니어" : "주니어"}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  추천 기업 {1 + group.otherCompanies.length}곳
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>📅 {formatDate(group.date)}</span>
                              <span>🕐 {formatTime(group.date)}</span>
                            </div>
                          </div>

                          {/* 오른쪽: 화살표 */}
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-sm font-bold rounded-full border ${resumeGradeStyle.badge}`}>
                              {resumeGrade} 등급
                            </span>
                            <div className="text-gray-400 text-xl">
                              {isExpanded ? "▲" : "▼"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 확장 영역 - 상세 정보 */}
                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-4">
                          {/* 1위, 2위, 3위 기업 카드 (동일 형식) */}
                          {[top, ...group.otherCompanies].map((company, idx) => {
                            const companyGradeStyle = getGradeStyle(company.grade);
                            return (
                              <div
                                key={company.matchingId}
                                className="p-4 bg-gray-50 border border-gray-200 rounded-xl"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className={`text-lg font-bold ${idx === 0 ? "text-blue-600" : "text-gray-500"}`}>#{idx + 1}</span>
                                    <h4 className="text-lg font-bold text-gray-800">
                                      {company.companyName || "추천 기업"}
                                    </h4>
                                    {company.pros && (
                                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getMatchLevelColor(company.pros)}`}>
                                        {getMatchLevelText(company.pros)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {company.score > 0 && (
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                                          <span className="text-sm font-bold text-white">{company.score}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-600">점</span>
                                      </div>
                                    )}
                                    <div className={`text-2xl font-black ${companyGradeStyle.text}`}>
                                      {company.grade}
                                    </div>
                                  </div>
                                </div>

                                {/* 부족 스킬 */}
                                {company.missingSkills && (
                                  <div className="mt-3 flex flex-wrap gap-1">
                                    {company.missingSkills.split(", ").map((skill, sIdx) => (
                                      <span
                                        key={sIdx}
                                        className="px-2 py-0.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* 지원하기 버튼 */}
                                {company.jobId && company.jobId > 0 && (
                                  <div className="mt-3 flex justify-end">
                                    {company.jobStatus === "CLOSED" ? (
                                      <button
                                        disabled
                                        className="px-4 py-1.5 text-sm font-bold text-gray-500 bg-gray-200 rounded-lg cursor-not-allowed"
                                      >
                                        마감
                                      </button>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/user/jobs/${company.jobId}`);
                                        }}
                                        className="px-4 py-1.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                                      >
                                        지원하기
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* AI 피드백 */}
                          {group.feedback && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                              <p className="text-sm font-semibold text-blue-800 mb-2">AI 분석 리포트</p>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {group.feedback.length > 400
                                  ? group.feedback.slice(0, 400) + "..."
                                  : group.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {groups.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={onBackToMatching}
                  className="px-8 py-4 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  AI 매칭 분석 시작 페이지로 돌아가기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
