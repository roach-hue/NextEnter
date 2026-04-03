import api from "./axios";

const API_BASE_URL = "/api/jobs";

// 공고 등록/수정 요청 타입
export interface JobPostingRequest {
  title: string;
  jobCategory: string;
  requiredSkills?: string;
  preferredSkills?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  location: string;
  locationCity?: string; // 시/도 정보 (필터링용)
  description?: string;
  thumbnailUrl?: string;
  detailImageUrl?: string;
  deadline: string; // YYYY-MM-DD 형식
  status?: string;
}

// 공고 응답 타입
export interface JobPostingResponse {
  jobId: number;
  companyId: number;
  companyName: string;
  logoUrl?: string;
  title: string;
  jobCategory: string;
  requiredSkills?: string;
  preferredSkills?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  location: string;
  locationCity?: string; // 시/도 정보 (필터링용)
  description?: string;
  thumbnailUrl?: string;
  detailImageUrl?: string;
  deadline: string;
  status: string;
  viewCount: number;
  applicantCount: number;
  bookmarkCount: number;
  createdAt: string;
  updatedAt: string;
}

// 공고 목록 응답 타입
export interface JobPostingListResponse {
  companyId: number | undefined;
  jobId: number;
  title: string;
  companyName: string;
  jobCategory: string;
  location: string;
  locationCity?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  deadline: string;
  status: string;
  viewCount: number;
  applicantCount: number;
  bookmarkCount: number;
  createdAt: string;
  thumbnailUrl?: string;
  logoUrl?: string;
  detailImageUrl?: string; // ✅ 추가
}

// 페이징 응답 타입
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// src/api/job.ts 파일을 열어서 'getJobPostings' 부분 확인

// 1. 파라미터 타입에 regions, jobCategories 추가 (없으면 에러 남)
export const getJobPostings = async (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  regions?: string;
  jobCategories?: string;
  status?: string;
}): Promise<PageResponse<JobPostingListResponse>> => {
  const response = await api.get(`${API_BASE_URL}/list`, { params });
  return response.data;
};

// 공고 상세 조회
export const getJobPosting = async (
  jobId: number,
): Promise<JobPostingResponse> => {
  const response = await api.get(`${API_BASE_URL}/${jobId}`);
  return response.data;
};

// 공고 등록
export const createJobPosting = async (
  data: JobPostingRequest,
  companyId: number,
): Promise<{ jobId: number }> => {
  const response = await api.post(API_BASE_URL, data, {
    headers: {
      companyId: companyId.toString(),
    },
  });
  return response.data;
};

// 공고 수정
export const updateJobPosting = async (
  jobId: number,
  data: JobPostingRequest,
  companyId: number,
): Promise<{ jobId: number }> => {
  const response = await api.put(`${API_BASE_URL}/${jobId}`, data, {
    headers: {
      companyId: companyId.toString(),
    },
  });
  return response.data;
};

// 공고 삭제 (상태를 CLOSED로 변경)
export const deleteJobPosting = async (
  jobId: number,
  companyId: number,
): Promise<{ message: string }> => {
  const response = await api.delete(`${API_BASE_URL}/${jobId}`, {
    headers: {
      companyId: companyId.toString(),
    },
  });
  return response.data;
};

// 공고 상태 변경
export const updateJobPostingStatus = async (
  jobId: number,
  companyId: number,
  status: string,
): Promise<{ message: string }> => {
  const response = await api.patch(
    `${API_BASE_URL}/${jobId}/status`,
    { status },
    {
      headers: {
        companyId: companyId.toString(),
      },
    },
  );
  return response.data;
};

// 특정 기업의 모든 공고 조회 (상태 무관)
export const getCompanyJobPostings = async (
  companyId: number,
): Promise<JobPostingListResponse[]> => {
  const response = await api.get(`${API_BASE_URL}/company/${companyId}`);
  return response.data;
};
