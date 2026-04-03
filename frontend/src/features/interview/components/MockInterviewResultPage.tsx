import { useState, useEffect, useMemo } from "react";
import Footer from "../../../components/Footer";
import LeftSidebar from "../../../components/LeftSidebar";
import MockInterviewHistoryPage from "./MockInterviewHistoryPage";
// ✅ [수정] useAuth 사용
import { useAuthStore } from "../../../stores/authStore";
import {
  interviewService,
  InterviewHistoryDTO,
  InterviewResultDTO,
} from "../../../api/interviewService";

// finalFeedback JSON 파싱 결과 타입
interface ParsedFeedback {
  summary?: string;
  stats?: {
    question_count?: number;
    starr_counts?: Record<string, number>;
  };
  competencyScores?: Record<string, number>;
  strengths?: string[];
  gaps?: string[];
  isJson: boolean;
  rawText: string;
}

// finalFeedback 파싱 함수
function parseFinalFeedback(feedback: string | null | undefined): ParsedFeedback {
  if (!feedback) {
    return { isJson: false, rawText: "" };
  }

  // JSON인지 확인
  if (feedback.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(feedback);
      return {
        summary: parsed.summary,
        stats: parsed.stats,
        competencyScores: parsed.competencyScores,
        strengths: parsed.strengths,
        gaps: parsed.gaps,
        isJson: true,
        rawText: feedback,
      };
    } catch {
      // 파싱 실패 시 원문 반환
      return { isJson: false, rawText: feedback };
    }
  }

  return { isJson: false, rawText: feedback };
}

// 인간 친화적 3줄 요약 피드백 생성
function generateHumanFriendlyFeedback(parsed: ParsedFeedback): string {
  if (!parsed.isJson) {
    return parsed.rawText || "면접이 완료되었습니다.";
  }

  const lines: string[] = [];

  // 1. 강점 요약
  if (parsed.strengths && parsed.strengths.length > 0) {
    const strengthText = parsed.strengths.slice(0, 2).join(", ");
    lines.push(`✅ 강점: ${strengthText}`);
  }

  // 2. 보완점 요약
  if (parsed.gaps && parsed.gaps.length > 0) {
    const gapText = parsed.gaps.slice(0, 2).join(", ");
    lines.push(`💡 보완점: ${gapText}`);
  }

  // 3. 종합 조언
  const questionCount = parsed.stats?.question_count || 0;
  if (questionCount > 0) {
    lines.push(`📊 총 ${questionCount}개의 질문을 분석했습니다. 구체적인 사례와 결과를 포함하면 더 좋은 인상을 줄 수 있습니다.`);
  } else {
    lines.push(`📊 STARR(상황-과제-행동-결과-성찰) 요소를 더 명확히 표현해보세요.`);
  }

  if (lines.length === 0) {
    return "면접을 완료했습니다. 다음 면접에서는 구체적인 경험과 성과를 더 자세히 설명해보세요.";
  }

  return lines.join("\n");
}

interface MockInterviewResultPageProps {
  onNavigateToInterview?: () => void;
  activeMenu: string;
  onMenuClick: (menuId: string) => void;
  initialInterviewId?: number | null;
}

export default function MockInterviewResultPage({
  onNavigateToInterview,
  activeMenu,
  onMenuClick,
  initialInterviewId,
}: MockInterviewResultPageProps) {
  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(
    initialInterviewId || null,
  );

  useEffect(() => {
    if (initialInterviewId) {
      setSelectedInterviewId(initialInterviewId);
    }
  }, [initialInterviewId]);

  // API 데이터 상태
  const [historyList, setHistoryList] = useState<InterviewHistoryDTO[]>([]);
  const [latestResult, setLatestResult] = useState<InterviewResultDTO | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // User Context
  const { user } = useAuthStore();

  // 페이지 진입 시 스크롤을 상단으로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userIdNum =
          typeof user.userId === "string"
            ? parseInt(user.userId)
            : user.userId || 1;

        // 1. 전체 히스토리 목록 조회
        const histories = await interviewService.getInterviewHistory(userIdNum);
        setHistoryList(histories);

        // 2. 가장 최근 면접(첫 번째)의 상세 결과 조회
        if (histories.length > 0) {
          // 서버에서 최신순으로 준다고 가정 (만약 아니라면 정렬 필요)
          // 보통 DB 쿼리가 DESC 정렬임.
          const latestId = histories[0].interviewId;
          const detail = await interviewService.getInterviewResult(
            userIdNum,
            latestId,
          );
          setLatestResult(detail);
        } else {
          setLatestResult(null);
        }
      } catch (error) {
        console.error("Failed to fetch interview results:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // 통계 계산 (historyList 기반)
  const calculateStatistics = () => {
    if (historyList.length === 0) {
      return {
        maxScore: 0,
        minScore: 0,
        avgScore: 0,
      };
    }

    const scores = historyList.map((record) => record.finalScore);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const avgScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );

    return { maxScore, minScore, avgScore };
  };

  const { maxScore, minScore, avgScore } = calculateStatistics();

  // finalFeedback JSON 파싱 (메모이제이션)
  const parsedFeedback = useMemo(() => {
    return parseFinalFeedback(latestResult?.finalFeedback);
  }, [latestResult?.finalFeedback]);

  // competencyScores 병합 (API 응답 우선, 없으면 파싱된 JSON에서)
  const mergedCompetencyScores = useMemo(() => {
    if (latestResult?.competencyScores && Object.keys(latestResult.competencyScores).length > 0) {
      return latestResult.competencyScores;
    }
    return parsedFeedback.competencyScores || null;
  }, [latestResult?.competencyScores, parsedFeedback.competencyScores]);

  // strengths 병합
  const mergedStrengths = useMemo(() => {
    if (latestResult?.strengths && latestResult.strengths.length > 0) {
      return latestResult.strengths;
    }
    return parsedFeedback.strengths || [];
  }, [latestResult?.strengths, parsedFeedback.strengths]);

  // gaps 병합
  const mergedGaps = useMemo(() => {
    if (latestResult?.gaps && latestResult.gaps.length > 0) {
      return latestResult.gaps;
    }
    return parsedFeedback.gaps || [];
  }, [latestResult?.gaps, parsedFeedback.gaps]);

  // STARR counts (파싱된 JSON에서 추출)
  const starrCounts = useMemo(() => {
    return parsedFeedback.stats?.starr_counts || null;
  }, [parsedFeedback.stats?.starr_counts]);

  const statistics = [
    {
      title: "최고 점수",
      value: maxScore,
      icon: "📈",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
    },
    {
      title: "최저 점수",
      value: minScore,
      icon: "📉",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
    },
    {
      title: "평균 점수",
      value: avgScore,
      icon: "📊",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-300";
    if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-300";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-300";
    return "text-red-600 bg-red-50 border-red-300";
  };

  const handleViewHistory = (id: number) => {
    console.log(`면접 기록 ${id} 히스토리 보기`);
    setSelectedInterviewId(id);
  };

  const handleBackToList = () => {
    setSelectedInterviewId(null);
  };

  const handleNewInterview = () => {
    console.log("새 모의 면접 시작 - InterviewPage로 이동");
    if (onNavigateToInterview) {
      onNavigateToInterview();
    }
  };

  // 히스토리 상세 페이지 표시
  if (selectedInterviewId !== null) {
    return (
      <MockInterviewHistoryPage
        interviewId={selectedInterviewId}
        onBack={handleBackToList}
        activeMenu={activeMenu}
        onMenuClick={onMenuClick}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-bold text-gray-500">데이터 로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="px-4 py-8 mx-auto max-w-7xl">
          <div className="flex items-start gap-6">
            <LeftSidebar
              title="AI 모의 면접 결과"
              activeMenu={activeMenu}
              onMenuClick={onMenuClick}
            />

            {/* 메인 컨텐츠 */}
            <div className="flex-1 space-y-6">
              {historyList.length === 0 ? (
                /* 면접 결과 없을 때 */
                <div className="p-16 text-center bg-white border-2 border-gray-200 rounded-2xl">
                  <div className="mb-4 text-6xl">🎤</div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-400">
                    면접 결과가 없습니다
                  </h3>
                  <p className="mb-6 text-gray-500">
                    AI 모의 면접을 시작하여 결과를 확인해보세요
                  </p>
                  <button
                    onClick={handleNewInterview}
                    className="px-8 py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    AI 모의 면접 시작하기
                  </button>
                </div>
              ) : (
                <>
                  {/* 면접 통계 카드 */}
                  <div className="p-6 bg-white border-2 border-blue-400 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">면접 통계</h3>
                      {/* 전체 삭제 버튼 제거 (Backend 미지원) */}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {statistics.map((stat, index) => (
                        <div
                          key={index}
                          className={`${stat.bgColor} border-2 ${stat.borderColor} rounded-xl p-6`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="mb-2 text-sm text-gray-600">
                                {stat.title}
                              </p>
                              <p className={`text-4xl font-bold ${stat.color}`}>
                                {stat.value}
                                <span className="ml-1 text-xl">점</span>
                              </p>
                            </div>
                            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full">
                              <span className="text-3xl">{stat.icon}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 히스토리 바로 아래에 상세 리포트 카드 추가 (최신 결과) */}
                  {latestResult && (
                    <div className="p-6 mb-6 bg-white border-2 border-purple-400 rounded-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">
                          📝 최신 AI 상세 분석 리포트
                        </h3>
                        <span className="text-sm text-gray-500">
                          (
                          {new Date(
                            latestResult.createdAt,
                          ).toLocaleDateString()}
                          )
                        </span>
                      </div>

                      {/* 역량 점수 & STARR */}
                      <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
                        <div>
                          <h4 className="mb-4 font-bold text-gray-700">
                            핵심 역량 평가
                          </h4>
                          <div className="space-y-3">
                            {mergedCompetencyScores &&
                            Object.keys(mergedCompetencyScores).length > 0 ? (
                              Object.entries(mergedCompetencyScores).map(
                                ([key, score]) => {
                                  // 역량명 한글 변환
                                  const labelMap: Record<string, string> = {
                                    situation_awareness: "상황 인식",
                                    task_clarity: "과제 명확성",
                                    action_specificity: "행동 구체성",
                                    result_orientation: "결과 지향성",
                                    reflection_depth: "성찰 깊이",
                                    overall: "종합",
                                    general: "종합",
                                  };
                                  const displayLabel = labelMap[key] || key;
                                  const numScore = typeof score === "number" ? score : 0;
                                  return (
                                    <div
                                      key={key}
                                      className="flex items-center gap-4"
                                    >
                                      <span
                                        className="w-24 font-medium text-gray-600 truncate"
                                        title={key}
                                      >
                                        {displayLabel}
                                      </span>
                                      <div className="flex-1 h-3 bg-gray-200 rounded-full">
                                        <div
                                          className="h-3 bg-purple-600 rounded-full"
                                          style={{
                                            width: `${(numScore / 5) * 100}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="font-bold text-purple-700">
                                        {numScore.toFixed(1)}/5.0
                                      </span>
                                    </div>
                                  );
                                },
                              )
                            ) : (
                              <p className="text-gray-400">
                                평가 데이터가 없습니다.
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="mb-4 font-bold text-gray-700">
                            STARR 답변 구조 분석
                          </h4>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              "situation",
                              "task",
                              "action",
                              "result",
                              "reflection",
                            ].map((key) => {
                              // starrCounts에서 해당 요소의 카운트 가져오기
                              const count = starrCounts?.[key] || 0;
                              const questionCount = parsedFeedback.stats?.question_count || 1;
                              const covered = count > 0;
                              const percentage = Math.round((count / questionCount) * 100);

                              const labelMap: Record<string, string> = {
                                situation: "상황",
                                task: "과제",
                                action: "행동",
                                result: "결과",
                                reflection: "성찰",
                              };

                              return (
                                <div
                                  key={key}
                                  className={`border-2 rounded-lg p-3 text-center ${covered ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50 opacity-50"}`}
                                >
                                  <div
                                    className={`text-2xl mb-1 ${covered ? "" : "grayscale"}`}
                                  >
                                    {key === "situation"
                                      ? "🧩"
                                      : key === "task"
                                        ? "📋"
                                        : key === "action"
                                          ? "🏃"
                                          : key === "result"
                                            ? "🏆"
                                            : "🤔"}
                                  </div>
                                  <div
                                    className={`font-bold ${covered ? "text-green-700" : "text-gray-400"}`}
                                  >
                                    {labelMap[key] || key}
                                  </div>
                                  {starrCounts && (
                                    <div className={`text-xs mt-1 ${covered ? "text-green-600" : "text-gray-400"}`}>
                                      {count}/{questionCount} ({percentage}%)
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {!starrCounts && (
                            <p className="mt-2 text-xs text-center text-gray-500">
                              * STARR 분석 데이터가 없습니다. 새 면접을 진행해주세요.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 강점 & 보완점 */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="p-5 border border-blue-200 bg-blue-50 rounded-xl">
                          <h4 className="flex items-center gap-2 mb-3 font-bold text-blue-800">
                            <span>👍</span> 강점 (Strengths)
                          </h4>
                          <ul className="space-y-1 text-gray-700 list-disc list-inside">
                            {mergedStrengths.length > 0 ? (
                              mergedStrengths.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))
                            ) : (
                              <li className="text-gray-400 list-none">
                                분석된 강점이 없습니다.
                              </li>
                            )}
                          </ul>
                        </div>
                        <div className="p-5 border border-orange-200 bg-orange-50 rounded-xl">
                          <h4 className="flex items-center gap-2 mb-3 font-bold text-orange-800">
                            <span>💡</span> 보완점 (Gaps)
                          </h4>
                          <ul className="space-y-1 text-gray-700 list-disc list-inside">
                            {mergedGaps.length > 0 ? (
                              mergedGaps.map((g, i) => (
                                <li key={i}>{g}</li>
                              ))
                            ) : (
                              <li className="text-gray-400 list-none">
                                특별한 보완점이 발견되지 않았습니다.
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* 종합 피드백 - 인간 친화적 3줄 요약 */}
                      {latestResult.finalFeedback && (
                        <div className="p-4 mt-6 bg-gray-100 rounded-xl">
                          <h4 className="mb-2 font-bold text-gray-800">
                            종합 피드백
                          </h4>
                          <p className="leading-relaxed text-gray-700 whitespace-pre-line">
                            {generateHumanFriendlyFeedback(parsedFeedback)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 최근 면접 기록 - 스크롤 가능 */}
                  <div className="p-6 bg-white border-2 border-blue-400 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">면접 히스토리</h3>
                      <span className="text-sm text-gray-600">
                        총 {historyList.length}개의 면접 기록
                      </span>
                    </div>

                    {/* 스크롤 가능한 컨테이너 */}
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {historyList.map((record) => (
                        <div
                          key={record.interviewId}
                          className="p-5 transition border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span
                                  className={`px-4 py-1.5 text-base font-bold rounded-lg ${
                                    record.difficulty === "JUNIOR"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-purple-100 text-purple-700"
                                  }`}
                                >
                                  {record.difficulty === "JUNIOR"
                                    ? "주니어"
                                    : "시니어"}
                                </span>
                                <span
                                  className={`px-3 py-1 text-sm font-semibold border-2 rounded-full ${getScoreColor(
                                    record.finalScore,
                                  )}`}
                                >
                                  {record.finalScore}점
                                </span>
                                <span
                                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                    record.status === "COMPLETED" &&
                                    record.finalScore >= 70
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {record.status === "COMPLETED"
                                    ? record.finalScore >= 70
                                      ? "합격"
                                      : "불합격"
                                    : "진행중"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">✓</span>
                                <span className="text-base font-semibold text-gray-900">
                                  {/* totalQuestions/goodAnswers는 DTO에 없으면 계산하거나 필드 추가 필요.
                                      InterviewHistoryDTO: totalTurns, currentTurn 등.
                                      goodAnswers는 현재 DTO에 없음. 임시로 currentTurn 사용 */}
                                  {record.totalTurns}개 질문 중{" "}
                                  {record.currentTurn}개 답변 완료
                                </span>
                              </div>

                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <span>📅</span>
                                  <span>
                                    {new Date(
                                      record.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>🕐</span>
                                  <span>
                                    {new Date(
                                      record.createdAt,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                {/* 소요시간 DTO에 없음. DB에서 계산해서 주지 않는 이상 표시 불가 */}
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                handleViewHistory(record.interviewId)
                              }
                              className="flex items-center gap-2 px-4 py-2 ml-4 text-blue-600 transition rounded-lg hover:bg-blue-100"
                            >
                              히스토리
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 액션 버튼 - 새 모의 면접만 표시 */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleNewInterview}
                      className="px-8 py-3 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      새 모의 면접 시작
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
