// C:\NextEnterFront\src\api\apply.ts

import api from "./axios";

// 지원자 목록 응답 타입
export interface ApplyListResponse {
  applyId: number;
  userId: number;
  jobId: number;
  userName: string;
  userAge: number;
  birthDate?: string; // ✅ 생년월일
  jobTitle: string;
  jobCategory: string;
  skills: string[];
  experience: string;
  status: string;
  aiScore: number;
  appliedAt: string;
}

// 지원자 상세 응답 타입
export interface ApplyDetailResponse {
  applyId: number;
  userId: number;
  jobId: number;
  resumeId: number;
  coverLetterId: number;
  userName: string;
  userAge: number;
  userEmail: string;
  userPhone: string;
  jobTitle: string;
  jobCategory: string;
  // 이력서 인적사항
  resumeTitle?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  profileImage?: string;
  // 이력서 스킬 및 경력
  skills?: string[];
  experience?: string;
  // 이력서 상세 정보 (배열)
  experiences?: ExperienceItem[];
  certificates?: CertificateItem[];
  educations?: EducationItem[];
  careers?: CareerItem[];
  // 자기소개서 정보
  coverLetterTitle?: string;
  coverLetterContent?: string;
  status: string; // 레거시 호환용
  documentStatus?: string; // 서류 상태 (PENDING, REVIEWING, PASSED, REJECTED, CANCELED)
  finalStatus?: string; // 최종 결과 (PASSED, REJECTED, CANCELED)
  aiScore: number;
  notes: string;
  appliedAt: string;
  reviewedAt: string;
  updatedAt: string;
}

// 경험/활동/교육 아이템
export interface ExperienceItem {
  title: string;
  period: string;
}

// 자격증/어학/수상 아이템
export interface CertificateItem {
  title: string;
  date: string;
}

// 학력 아이템
export interface EducationItem {
  school: string;
  period: string;
}

// 경력 아이템
export interface CareerItem {
  company: string;
  period: string;
}

// 상태 변경 요청 타입
export interface ApplyStatusUpdateRequest {
  status: string; // PENDING, REVIEWING, ACCEPTED, REJECTED
  notes?: string;
}

// 지원 등록 요청 타입
export interface ApplyCreateRequest {
  jobId: number;
  resumeId: number;
  coverLetterId?: number;
}

// 페이징 응답 타입
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// 지원 등록 (개인회원용)
export const createApply = async (
  userId: number,
  request: ApplyCreateRequest,
): Promise<ApplyDetailResponse> => {
  const response = await api.post("/api/applies", request, {
    headers: { userId },
  });
  return response.data;
};

// 내 지원 내역 조회 (개인회원용)
export const getMyApplies = async (
  userId: number,
): Promise<ApplyListResponse[]> => {
  const response = await api.get("/api/applies/my", {
    headers: { userId },
  });
  return response.data;
};

// 지원자 목록 조회
export const getApplies = async (
  companyId: number,
  params?: {
    jobId?: number;
    page?: number;
    size?: number;
  },
): Promise<PageResponse<ApplyListResponse>> => {
  const response = await api.get("/api/applies", {
    params,
    headers: { companyId },
  });
  return response.data;
};

// 지원자 상세 조회
export const getApplyDetail = async (
  applyId: number,
  companyId: number,
): Promise<ApplyDetailResponse> => {
  const response = await api.get(`/api/applies/${applyId}`, {
    headers: { companyId },
  });
  return response.data;
};

// 지원 상태 변경
export const updateApplyStatus = async (
  applyId: number,
  companyId: number,
  request: ApplyStatusUpdateRequest,
): Promise<ApplyDetailResponse> => {
  const response = await api.put(`/api/applies/${applyId}/status`, request, {
    headers: { companyId },
  });
  return response.data;
};

// 면접 상태 변경
export const updateInterviewStatus = async (
  applyId: number,
  companyId: number,
  interviewStatus: string,
): Promise<ApplyDetailResponse> => {
  const response = await api.put(
    `/api/applies/${applyId}/interview-status`,
    interviewStatus,
    {
      headers: {
        companyId,
        "Content-Type": "text/plain",
      },
    },
  );
  return response.data;
};

// 인재검색에서 면접 요청
export const createInterviewRequest = async (
  companyId: number,
  userId: number,
  jobId: number,
): Promise<ApplyDetailResponse> => {
  const response = await api.post(`/api/applies/interview-request`, null, {
    params: { userId, jobId },
    headers: { companyId },
  });
  return response.data;
};

export const cancelApply = async (
  applyId: number,
  userId: number,
): Promise<void> => {
  await api.patch(
    `/api/applies/${applyId}/cancel`,
    {},
    {
      headers: { userId },
    },
  );
};

// ✅ 수정: 지원자 삭제 (실제 DELETE 요청)
export const deleteApplies = async (
  companyId: number,
  applyIds: number[],
): Promise<void> => {
  await api.delete("/api/applies", {
    headers: { companyId },
    data: { applyIds },
  });
};