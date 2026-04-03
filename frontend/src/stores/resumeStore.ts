import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResumeSections, PortfolioInfo } from "../api/resume";

export interface Resume {
  id: number;
  title: string;
  industry: string;
  applications: number;
}

export interface DetailedResume {
  resumeId: number;
  title: string;
  jobCategory: string;
  skills: string[];
  visibility: "PUBLIC" | "PRIVATE";
  sections: ResumeSections;
  portfolios?: PortfolioInfo[];
  status: string;
  viewCount: number;
  createdAt: string;
  updatedAt?: string;
}

interface ResumeState {
  resumes: Resume[];
  detailedResumes: DetailedResume[];
  currentResume: DetailedResume | null;
  setResumes: (resumes: Resume[]) => void;
  addResume: (resume: Resume) => void;
  updateResume: (id: number, resume: Resume) => void;
  deleteResume: (id: number) => void;
  setDetailedResumes: (resumes: DetailedResume[]) => void;
  addDetailedResume: (resume: DetailedResume) => void;
  updateDetailedResume: (resumeId: number, resume: DetailedResume) => void;
  deleteDetailedResume: (resumeId: number) => void;
  setCurrentResume: (resume: DetailedResume | null) => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resumes: [],
      detailedResumes: [],
      currentResume: null,

      setResumes: (resumes) => set({ resumes }),
      addResume: (resume) =>
        set((s) => ({ resumes: [...s.resumes, resume] })),
      updateResume: (id, resume) =>
        set((s) => ({
          resumes: s.resumes.map((r) => (r.id === id ? resume : r)),
        })),
      deleteResume: (id) =>
        set((s) => ({ resumes: s.resumes.filter((r) => r.id !== id) })),

      setDetailedResumes: (resumes) => set({ detailedResumes: resumes }),
      addDetailedResume: (resume) =>
        set((s) => ({ detailedResumes: [...s.detailedResumes, resume] })),
      updateDetailedResume: (resumeId, resume) =>
        set((s) => ({
          detailedResumes: s.detailedResumes.map((r) =>
            r.resumeId === resumeId ? resume : r,
          ),
        })),
      deleteDetailedResume: (resumeId) =>
        set((s) => ({
          detailedResumes: s.detailedResumes.filter(
            (r) => r.resumeId !== resumeId,
          ),
        })),

      setCurrentResume: (resume) => set({ currentResume: resume }),
    }),
    {
      name: "nextenter_resumes_store",
      partialize: (state) => ({
        resumes: state.resumes,
        detailedResumes: state.detailedResumes,
      }),
    },
  ),
);
