import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface JobListing {
  id: number;
  company: string;
  title: string;
  requirements: string[];
  tags: string[];
  location: string;
  deadline: string;
  daysLeft: number;
}

export interface BusinessJob {
  id: number;
  title: string;
  status: "ACTIVE" | "CLOSED" | "EXPIRED";
  job_category: string;
  location: string;
  experience_min?: number;
  experience_max?: number;
  salary_min?: number;
  salary_max?: number;
  deadline: string;
  view_count: number;
  applicant_count: number;
  bookmark_count: number;
  created_at: string;
}

export interface JobApplication {
  id: number;
  jobId: number;
  resumeId: number;
  date: string;
  company: string;
  position: string;
  jobType: string;
  location: string;
  deadline: string;
  viewed: boolean;
  status: "지원완료" | "열람" | "미열람" | "지원취소";
  canCancel: boolean;
}

interface JobState {
  jobListings: JobListing[];
  businessJobs: BusinessJob[];
  jobApplications: JobApplication[];
  setJobListings: (jobs: JobListing[]) => void;
  setBusinessJobs: (jobs: BusinessJob[]) => void;
  addBusinessJob: (job: BusinessJob) => void;
  updateBusinessJob: (id: number, job: BusinessJob) => void;
  deleteBusinessJob: (id: number) => void;
  addJobApplication: (application: JobApplication) => void;
  cancelJobApplication: (id: number) => void;
}

export const useJobStore = create<JobState>()(
  persist(
    (set) => ({
      jobListings: [],
      businessJobs: [],
      jobApplications: [],

      setJobListings: (jobs) => set({ jobListings: jobs }),
      setBusinessJobs: (jobs) => set({ businessJobs: jobs }),
      addBusinessJob: (job) =>
        set((s) => ({ businessJobs: [...s.businessJobs, job] })),
      updateBusinessJob: (id, job) =>
        set((s) => ({
          businessJobs: s.businessJobs.map((j) => (j.id === id ? job : j)),
        })),
      deleteBusinessJob: (id) =>
        set((s) => ({
          businessJobs: s.businessJobs.filter((j) => j.id !== id),
        })),

      addJobApplication: (application) =>
        set((s) => ({
          jobApplications: [application, ...s.jobApplications],
        })),
      cancelJobApplication: (id) =>
        set((s) => ({
          jobApplications: s.jobApplications.map((app) =>
            app.id === id
              ? { ...app, status: "지원취소" as const, canCancel: false }
              : app,
          ),
        })),
    }),
    {
      name: "nextenter_jobs_store",
      partialize: (state) => ({
        businessJobs: state.businessJobs,
        jobApplications: state.jobApplications,
      }),
    },
  ),
);
