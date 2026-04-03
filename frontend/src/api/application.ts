import api from "./axios";

// 통합 지원 응답 타입
export interface ApplicationSummaryResponse {
  // 기본 식별 정보
  id: number; // applyId 또는 offerId
  type: "APPLICATION" | "INTERVIEW_OFFER";
  applyId?: number;
  offerId?: number;

  // 사용자/공고 정보
  userId: number;
  jobId: number;
  userName: string;
  userAge?: number;
  jobTitle: string;
  jobCategory: string;
  companyName: string;
  location?: string;
  deadline?: string;

  // 기술 스택 및 경력
  skills?: string[];
  experience?: string;

  // 프론트엔드 호환성을 위한 필드 (기존 형식)
  status: string; // "PENDING", "ACCEPTED", "REJECTED", "CANCELED"
  interviewStatus?: string; // null, "OFFERED", "ACCEPTED", "REJECTED"

  // 새로운 상태 필드 (상세 정보)
  documentStatus?: string; // "PENDING", "REVIEWING", "PASSED", "REJECTED"
  finalStatus?: string; // null, "PASSED", "REJECTED", "CANCELED"

  // 점수 및 날짜
  aiScore?: number;
  appliedAt: string;
  reviewedAt?: string;
  updatedAt: string;
}

/**
 * 사용자의 모든 지원 내역 조회 (통합)
 * 일반 지원(Apply) + 기업의 요청(InterviewOffer)을 하나로 통합
 */
export const getMyApplications = async (
  userId: number,
): Promise<ApplicationSummaryResponse[]> => {
  const response = await api.get("/api/applications/my", {
    headers: { userId },
  });
  return response.data;
};
