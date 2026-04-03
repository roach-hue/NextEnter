import api from "./axios";

export interface InterviewReaction {
  type: string | null;
  text: string | null;
}

export interface InterviewRealtime {
  next_question: string;
  reaction: InterviewReaction;
  probe_goal: string;
  requested_evidence: string[];
  report?: InterviewReport;
}

export interface InterviewReport {
  role: string;
  competency_scores: Record<string, number>;
  // ... other fields are less critical for typing strictly if dynamic, but good to keep
  feedback_comment: string;
}

// Backend InterviewQuestionResponse mapping
export interface InterviewResponse {
  interviewId: number;
  currentTurn: number;
  question: string;
  isFinished: boolean; // Renamed from isCompleted
  finalResult?: {
    finalScore: number;
    result: string;
    finalFeedback: string;
    competencyScores: Record<string, number>;
    strengths: string[];
    gaps: string[];
  };

  // Rich AI Metadata
  reactionType?: string;
  reactionText?: string;
  aiSystemReport?: any;
  probeGoal?: string;

  realtime?: InterviewRealtime;
}

export interface InterviewStartPayload {
  resumeId: number;
  jobCategory: string;
  difficulty: "JUNIOR" | "SENIOR";
  portfolioText?: string;
  totalTurns?: number;
}

export interface InterviewAnswerPayload {
  interviewId: number;
  answer: string;
}

// DTOs for History & Result
export interface InterviewHistoryDTO {
  interviewId: number;
  jobCategory: string;
  difficulty: "JUNIOR" | "SENIOR"; // difficulty string in backend might map here
  totalTurns: number;
  currentTurn: number;
  status: string;
  finalScore: number;
  createdAt: string;
  completedAt: string | null;
}

export interface InterviewMessageDTO {
  messageId: number;
  turnNumber: number;
  role: string;
  message: string;
  createdAt: string;
}

export interface InterviewResultDTO {
  interviewId: number;
  userId: number;
  resumeId: number;
  jobCategory: string;
  difficulty: string;
  totalTurns: number;
  currentTurn: number;
  status: string;
  finalScore: number;
  finalFeedback: string;
  createdAt: string;
  completedAt: string | null;
  messages: InterviewMessageDTO[];
  // AI Analysis fields (optional as they populate after completion)
  competencyScores?: Record<string, number>;
  strengths?: string[];
  gaps?: string[];
}

export const interviewService = {
  startInterview: async (
    userId: number,
    payload: InterviewStartPayload,
  ): Promise<InterviewResponse> => {
    const response = await api.post<InterviewResponse>(
      "/api/interview/start",
      payload,
      {
        params: { userId },
      },
    );
    return adaptResponse(response.data);
  },

  submitAnswer: async (
    userId: number,
    payload: InterviewAnswerPayload,
  ): Promise<InterviewResponse> => {
    const response = await api.post<InterviewResponse>(
      "/api/interview/answer",
      payload,
      {
        params: { userId },
      },
    );
    return adaptResponse(response.data);
  },

  getInterviewHistory: async (
    userId: number,
  ): Promise<InterviewHistoryDTO[]> => {
    const response = await api.get<InterviewHistoryDTO[]>(
      "/api/interview/history",
      {
        params: { userId },
      },
    );
    return response.data;
  },

  getInterviewResult: async (
    userId: number,
    interviewId: number,
  ): Promise<InterviewResultDTO> => {
    const response = await api.get<InterviewResultDTO>(
      `/api/interview/${interviewId}`,
      {
        params: { userId },
      },
    );
    return response.data;
  },
};

// Adapter to match existing UI expectation if possible, or we update UI.
// UI expects 'realtime' object. Let's synthesise it.
function adaptResponse(serverData: InterviewResponse): InterviewResponse {
  serverData.realtime = {
    next_question: serverData.question,
    reaction: {
      type: serverData.reactionType || null,
      text: serverData.reactionText || null,
    },
    probe_goal: serverData.probeGoal || "",
    requested_evidence: [], // Removed in V2.0
    report: serverData.aiSystemReport as InterviewReport,
  };
  return serverData;
}
