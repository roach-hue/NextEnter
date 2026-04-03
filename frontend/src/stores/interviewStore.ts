import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MatchingHistory {
  id: number;
  date: string;
  time: string;
  resume: string;
  resumeId: number;
  company: string;
  position: string;
  jobId: number;
  score: number;
  suitable: boolean;
  techMatch: { [key: string]: number };
  strengths: string[];
  improvements: string[];
}

export interface InterviewResult {
  id: number;
  date: string;
  time: string;
  level: "주니어" | "시니어";
  totalQuestions: number;
  goodAnswers: number;
  score: number;
  duration: string;
  result: "합격" | "불합격";
  detailedReport?: {
    competency_scores: Record<string, number>;
    starr_coverage: Record<string, boolean>;
    strengths: string[];
    gaps: string[];
    feedback?: string;
  };
}

export interface InterviewQA {
  question: string;
  answer: string;
  score: number;
}

export interface InterviewHistory {
  id: number;
  date: string;
  time: string;
  level: "주니어" | "시니어";
  score: number;
  result: "합격" | "불합격";
  qaList: InterviewQA[];
}

interface InterviewState {
  matchingHistory: MatchingHistory[];
  interviewResults: InterviewResult[];
  interviewHistories: InterviewHistory[];
  addMatchingHistory: (history: MatchingHistory) => void;
  clearMatchingHistory: () => void;
  addInterviewResult: (result: InterviewResult) => void;
  clearInterviewResults: () => void;
  addInterviewHistory: (history: InterviewHistory) => void;
  clearInterviewHistories: () => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
      matchingHistory: [],
      interviewResults: [],
      interviewHistories: [],

      addMatchingHistory: (history) =>
        set((s) => ({
          matchingHistory: [history, ...s.matchingHistory],
        })),
      clearMatchingHistory: () => set({ matchingHistory: [] }),

      addInterviewResult: (result) =>
        set((s) => ({
          interviewResults: [result, ...s.interviewResults],
        })),
      clearInterviewResults: () => set({ interviewResults: [] }),

      addInterviewHistory: (history) =>
        set((s) => ({
          interviewHistories: [history, ...s.interviewHistories],
        })),
      clearInterviewHistories: () => set({ interviewHistories: [] }),
    }),
    { name: "nextenter_interview_store" },
  ),
);
