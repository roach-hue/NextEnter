import { useState, useRef, useEffect } from "react";
import LeftSidebar from "../../../components/LeftSidebar"; // [수정] LeftSidebar 사용
import InterviewSetup from "./InterviewSetup";
import { useInterviewStore } from "../../../stores/interviewStore";
import { useResumeStore } from "../../../stores/resumeStore";
import { useAuthStore } from "../../../stores/authStore";
import { interviewService } from "../../../api/interviewService";
import { getResumeList } from "../../../api/resume";
import api from "../../../api/axios";

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

interface InterviewChatPageProps {
  onBack: () => void;
  level: "junior" | "senior";
  activeMenu?: string;
  onMenuClick?: (menuId: string) => void;
  onComplete?: (interviewId: number) => void;
}

export default function InterviewChatPage({
  onBack,
  level,
  activeMenu = "interview-sub-2",
  onMenuClick,
  onComplete,
}: InterviewChatPageProps) {
  const { addInterviewResult, addInterviewHistory } = useInterviewStore();
  const { resumes, setResumes } = useResumeStore();
  const { user } = useAuthStore();

  // 단계 관리: 'setup' | 'chat'
  const [step, setStep] = useState<"setup" | "chat">("setup");

  // 선택된 이력서 ID
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);

  // 메시지 상태
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  // 인터뷰 진행 상태
  const [startTime] = useState(Date.now());
  const [turnCount, setTurnCount] = useState(0);
  const totalQuestions = level === "junior" ? 5 : 7;

  // 백엔드 인터뷰 ID
  const [realInterviewId, setRealInterviewId] = useState<number | null>(null);

  // 면접 완료 상태 (알람 표시 방지용)
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);

  // 스크롤 관련
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // 1. 초기 로드: 항상 최신 이력서 목록 로드
  useEffect(() => {
    const loadResumes = async () => {
      console.log("📚 ========== 이력서 목록 로딩 시작 ==========");
      console.log("👤 사용자 ID:", user?.userId);

      if (user?.userId) {
        try {
          console.log("🔄 getResumeList API 호출 중...");
          const data = await getResumeList(user.userId);

          console.log("✅ API 응답 받음:", data);
          console.log("  - 타입:", Array.isArray(data) ? "배열" : typeof data);
          console.log("  - 길이:", Array.isArray(data) ? data.length : "N/A");

          if (Array.isArray(data)) {
            const contextResumes = data.map((resume) => ({
              id: resume.resumeId,
              title: resume.title,
              industry: resume.jobCategory || "미지정",
              applications: 0,
            }));

            console.log("📋 변환된 이력서 목록:", contextResumes);
            setResumes(contextResumes);
            console.log(
              "✅ 이력서 목록 로드 완료:",
              contextResumes.length,
              "개",
            );

            // 첫 번째 이력서를 자동 선택 (선택된 이력서가 없을 때만)
            if (!selectedResumeId && contextResumes.length > 0) {
              console.log("🎯 첫 번째 이력서 자동 선택:", contextResumes[0]);
              setSelectedResumeId(contextResumes[0].id);
            } else if (selectedResumeId) {
              console.log("🎯 이미 선택된 이력서 ID:", selectedResumeId);
            } else {
              console.log("⚠️ 이력서 목록이 비어있음");
            }
          } else {
            console.error("❌ 응답이 배열이 아님:", data);
          }
        } catch (error) {
          console.error("❌ 이력서 목록 로드 실패:", error);
          if (error instanceof Error) {
            console.error("  - 오류 메시지:", error.message);
            console.error("  - 오류 스택:", error.stack);
          }
        }
      } else {
        console.log("⚠️ 사용자 ID 없음 - 로그인 필요");
      }

      console.log("📚 ========== 이력서 목록 로딩 종료 ==========");
    };
    loadResumes();
  }, [user?.userId]); // resumes.length, currentResume 의존성 제거

  // 2. 면접 시작 핸들러
  const handleStartInterview = async (
    portfolioText: string,
    portfolioFiles: File[],
  ) => {
    console.log("🎬 ========== 면접 시작 프로세스 시작 ==========");

    // 1. 이력서 선택 상태 확인
    console.log("📋 선택된 이력서 ID:", selectedResumeId);
    console.log("📚 전체 이력서 목록:", resumes);

    if (!selectedResumeId) {
      console.error("❌ 이력서가 선택되지 않음");
      alert("이력서를 선택해주세요.");
      return;
    }

    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    console.log("✅ 선택된 이력서 정보:", selectedResume);

    if (!user?.userId) {
      console.error("❌ 사용자 정보 없음");
      alert("로그인 정보가 없습니다.");
      return;
    }

    console.log("👤 사용자 ID:", user.userId);

    setLoading(true);

    try {
      const userIdNum =
        typeof user.userId === "string" ? parseInt(user.userId) : user.userId;

      // (1) Payload 구성 - 선택된 이력서의 직무(jobCategory) 사용, fallback "미지정"
      const payload = {
        resumeId: selectedResumeId,
        jobCategory: selectedResume?.industry ?? "미지정",
        difficulty: (level === "junior" ? "JUNIOR" : "SENIOR") as
          | "JUNIOR"
          | "SENIOR",
        portfolioText: portfolioText,
        totalTurns: totalQuestions,
      };

      console.log("📦 API 요청 Payload:", JSON.stringify(payload, null, 2));
      console.log("  - resumeId:", payload.resumeId);
      console.log("  - jobCategory:", payload.jobCategory);
      console.log("  - difficulty:", payload.difficulty);
      console.log(
        "  - portfolioText:",
        portfolioText ? `"${portfolioText.substring(0, 50)}..."` : "(없음)",
      );
      console.log("  - totalTurns:", payload.totalTurns);

      // 포트폴리오 파일 업로드 (이력서에 첨부 → AI가 자동으로 조회)
      if (portfolioFiles.length > 0) {
        console.log("📎 포트폴리오 파일 업로드 시작:", portfolioFiles.length, "개");
        for (const file of portfolioFiles) {
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("description", "면접 포트폴리오");
            await api.post(
              `/api/resume/${selectedResumeId}/portfolios`,
              formData,
              {
                headers: {
                  userId: userIdNum.toString(),
                  "Content-Type": "multipart/form-data",
                },
              },
            );
            console.log("  ✅", file.name, "업로드 완료");
          } catch (err) {
            console.warn("  ⚠️", file.name, "업로드 실패:", err);
          }
        }
      }

      // (2) API 호출
      console.log("🚀 면접 시작 API 호출 중...");
      const response = await interviewService.startInterview(
        userIdNum,
        payload,
      );

      console.log("✅ API 응답 받음:", response);
      console.log("  - interviewId:", response.interviewId);
      console.log("  - currentTurn:", response.currentTurn);
      console.log("  - isFinished:", response.isFinished);
      console.log("  - 첫 질문:", response.question);
      console.log(
        "  - realtime.next_question:",
        response.realtime?.next_question,
      );

      // (3) 상태 업데이트 및 화면 전환
      setRealInterviewId(response.interviewId);

      const welcomeMessage: Message = {
        id: 1,
        sender: "ai",
        text: response.realtime?.next_question || response.question,
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      console.log("💬 첫 메시지 설정:", welcomeMessage.text);
      setMessages([welcomeMessage]);
      setTurnCount(1);
      setStep("chat");

      console.log("🎬 ========== 면접 시작 완료 ==========");
    } catch (error) {
      console.error("❌ ========== 면접 시작 오류 ==========");
      console.error("오류 상세:", error);
      if (error instanceof Error) {
        console.error("오류 메시지:", error.message);
        console.error("오류 스택:", error.stack);
      }
      alert(
        "면접을 시작할 수 없습니다. 이력서 정보를 불러오는데 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ... scroll handling ...
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsUserScrolling(!isAtBottom);
  };

  const scrollToBottom = () => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === "ai" && !isUserScrolling) {
      scrollToBottom();
    }
  }, [messages, isUserScrolling]);

  const handleCompleteInterview = (backendResult?: any) => {
    const duration = Math.round((Date.now() - startTime) / 60000);
    const durationText = `${duration}분`;

    // 백엔드에서 받은 최종 결과 사용 (V2.0 철학)
    const finalScore = backendResult?.finalScore ?? 0;
    const resultStatus =
      backendResult?.result ?? (finalScore >= 70 ? "합격" : "불합격");
    const finalFeedback =
      backendResult?.finalFeedback ??
      (finalScore >= 70
        ? "전반적으로 훌륭한 역량을 보여주셨습니다."
        : "일부 역량에서 보완이 필요합니다.");

    const now = new Date();
    // ... (날짜 시간 처리 동일)
    const date = now
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, ".")
      .replace(/\.$/, "");
    const time = now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const resultId = Date.now();

    addInterviewResult({
      id: resultId,
      date,
      time,
      level: level === "junior" ? "주니어" : "시니어",
      totalQuestions: turnCount,
      goodAnswers: Math.floor(turnCount * 0.7),
      score: finalScore,
      duration: durationText,
      result: resultStatus,
      detailedReport: {
        competency_scores: backendResult?.competencyScores ?? {},
        starr_coverage: {},
        strengths: backendResult?.strengths ?? [],
        gaps: backendResult?.gaps ?? [],
        feedback: finalFeedback,
      },
    });

    addInterviewHistory({
      id: resultId,
      date,
      time,
      level: level === "junior" ? "주니어" : "시니어",
      score: finalScore,
      result: resultStatus,
      qaList: messages
        .filter((m) => m.sender === "user")
        .map((m) => ({
          question:
            messages.find((msg) => msg.id < m.id && msg.sender === "ai")
              ?.text || "질문 없음",
          answer: m.text,
          score: finalScore,
        })),
    });

    // [New] Auto-redirect to Interview History instead of alert
    console.log("✅ 면접 완료 - 히스토리 페이지로 자동 이동");
    if (onComplete && realInterviewId) {
      onComplete(realInterviewId);
    } else if (onMenuClick) {
      onMenuClick("interview-sub-3"); // '면접 결과' 메뉴 ID
    } else {
      onBack(); // Fallback
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    if (!realInterviewId) {
      alert("면접 세션이 초기화되지 않았습니다.");
      return;
    }

    const userIdNum =
      typeof user?.userId === "string"
        ? parseInt(user.userId)
        : user?.userId || 0;

    const userText = inputText;
    setInputText("");

    const userMsg: Message = {
      id: messages.length + 1,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);

    try {
      const submitPayload = {
        interviewId: realInterviewId,
        answer: userText,
      };

      console.log("🚀 [Frontend Debug] Sending Submit Payload:", submitPayload);

      const response = await interviewService.submitAnswer(
        userIdNum,
        submitPayload,
      );

      if (response.isFinished) {
        // 면접 완료: 백엔드에서 받은 최종 결과로 완료 처리
        // 주의: setStep("setup") 호출하면 안됨! 면접 화면 유지해야 함

        // ✅ 면접 완료 상태 설정 (알람 방지)
        setIsInterviewCompleted(true);

        // Show the final goodbye message briefly before redirecting
        const goodbyeMsg: Message = {
          id: messages.length + 2,
          sender: "ai",
          text:
            response.realtime?.next_question ||
            response.question ||
            "수고하셨습니다. 면접 결과는 [면접 결과] 페이지에서 상세 확인 가능합니다.",
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, goodbyeMsg]);
        setLoading(false);

        // Wait a moment for the user to read the message, then navigate to results
        setTimeout(() => {
          handleCompleteInterview(response.finalResult);
        }, 2500);
        return;
      }

      // 면접관 반응 표시 (감정만 간단히)
      // welcome, complete 타입은 특수 상황이므로 표시 안함
      if (response.realtime?.reaction) {
        const reactionType = response.realtime.reaction.type || "neutral";

        // 특수 타입은 반응 표시 생략
        const skipTypes = ["welcome", "complete", "wrap_up"];
        if (skipTypes.includes(reactionType)) {
          // 반응 메시지 생략
        } else {
          // 반응 타입에 따른 감정 매핑 (답변 품질 기반)
          const emotionMap: Record<string, string> = {
            "impressed": "인상적이네요",
            "satisfied": "만족스럽습니다",
            "good": "좋습니다",
            "neutral": "네",
            "clarify": "조금 더 설명해주세요",
            "concerned": "아쉽네요",
            "unsatisfied": "부족합니다",
            "acknowledge": "알겠습니다",
            "transition": "다음 질문으로",
            "reflect": "생각해보면",
            "paraphrase": "이해했습니다"
          };
          const emotion = emotionMap[reactionType] || "네";

          const reactionMsg: Message = {
            id: messages.length + 2,
            sender: "ai",
            text: `(${emotion})`,
            timestamp: new Date().toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMessages((prev) => [...prev, reactionMsg]);
        }
      }

      setTimeout(() => {
        const nextQMsg: Message = {
          id: Date.now(),
          sender: "ai",
          text: response.realtime?.next_question || response.question,
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, nextQMsg]);
        // 백엔드에서 받은 턴 수 사용, 최대값 제한
        const newTurn = response.currentTurn ?? turnCount + 1;
        setTurnCount(Math.min(newTurn, totalQuestions));
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("답변 전송 실패:", error);
      setLoading(false);
      alert("서버 통신 중 오류가 발생했습니다.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        {/* ✅ [수정] 레이아웃 변경 (Sticky 적용: items-start) */}
        <div className="flex items-start gap-6">
          {/* ✅ [수정] LeftSidebar + Title 적용 */}
          <LeftSidebar
            title="실전 모의 면접"
            activeMenu={activeMenu}
            onMenuClick={(menuId) => {
              // ✅ 면접 완료 상태면 알람 없이 바로 이동
              if (isInterviewCompleted) {
                if (onMenuClick) onMenuClick(menuId);
                return;
              }
              // 면접 진행 중이면 확인 알람 표시
              if (step === "chat") {
                if (confirm("면접이 진행 중입니다. 페이지를 이동하면 진행 상황이 저장되지 않습니다. 이동하시겠습니까?")) {
                  if (onMenuClick) onMenuClick(menuId);
                }
              } else {
                if (onMenuClick) onMenuClick(menuId);
              }
            }}
          />

          <div className="flex-1 space-y-6">
            {step === "setup" ? (
              <InterviewSetup
                resumes={resumes}
                selectedResumeId={selectedResumeId}
                onResumeChange={setSelectedResumeId}
                onStart={handleStartInterview}
                isLoading={loading}
              />
            ) : (
              <>
                <div className="p-6 bg-white border-2 border-blue-400 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={onBack}
                        className="flex items-center gap-2 font-semibold text-blue-600 transition hover:scale-105"
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        나가기
                      </button>
                      <div>
                        <h2 className="text-lg font-bold">
                          AI 면접관{" "}
                          {level === "junior" ? "(Junior)" : "(Senior)"}
                        </h2>
                        <p className="text-sm text-gray-500">
                          실시간 답변 분석 및 꼬리질문 엔진 가동 중
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-2 font-bold text-blue-700 bg-blue-100 rounded-lg">
                      Q. {turnCount}/{totalQuestions}
                    </div>
                  </div>
                </div>

                <div
                  ref={chatContainerRef}
                  onScroll={handleScroll}
                  className="bg-white border-2 border-blue-400 rounded-2xl p-6 h-[500px] overflow-y-auto space-y-4"
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${msg.sender === "ai" ? "bg-blue-100" : "bg-gray-200"}`}
                      >
                        {msg.sender === "ai" ? "🤖" : "👤"}
                      </div>
                      <div
                        className={`max-w-[70%] p-4 rounded-2xl whitespace-pre-wrap ${msg.sender === "ai" ? "bg-gray-50 border border-gray-200 text-gray-800" : "bg-blue-600 text-white"}`}
                      >
                        {msg.text}
                        <div
                          className={`text-xs mt-2 ${msg.sender === "ai" ? "text-gray-400" : "text-blue-200"}`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                        🤖
                      </div>
                      <div className="p-4 text-gray-500 bg-gray-50 rounded-2xl animate-pulse">
                        답변을 분석하고 다음 질문을 생각하는 중입니다...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-4 p-4 bg-white border-2 border-blue-400 rounded-2xl">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="답변을 입력하세요..."
                    className="flex-1 p-2 text-lg border-none outline-none resize-none"
                    rows={2}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || loading}
                    className="px-8 py-2 font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    전송
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
