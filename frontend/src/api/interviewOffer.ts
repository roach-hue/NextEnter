import api from "./axios";

// 면접 제안 응답 타입
export interface InterviewOfferResponse {
  offerId: number;
  userId: number;
  jobId: number;
  companyId: number;
  applyId?: number;
  // 공고 정보
  jobTitle: string;
  jobCategory: string;
  companyName: string;
  companyLogoUrl?: string;
  deadline?: string;
  // 사용자 정보
  userName: string;
  userAge?: number;
  // 상태 정보
  offerType: string; // "COMPANY_INITIATED" | "FROM_APPLICATION"
  interviewStatus: string; // "OFFERED" | "ACCEPTED" | "REJECTED" | "SCHEDULED" | "COMPLETED" | "CANCELED"
  finalResult?: string; // "PASSED" | "REJECTED"
  deleted: boolean; // ✅ Soft Delete 필드
  // 날짜 정보
  offeredAt: string;
  respondedAt?: string;
  scheduledAt?: string;
  updatedAt: string;
  deletedAt?: string; // ✅ 삭제 시각
}

// 면접 제안 생성 요청 타입
export interface InterviewOfferRequest {
  userId: number;
  jobId: number;
  applyId?: number;
}

/**
 * 기업이 면접 제안 생성
 */
export const createInterviewOffer = async (
  companyId: number,
  request: InterviewOfferRequest,
): Promise<InterviewOfferResponse> => {
  const response = await api.post("/api/interview-offers", request, {
    headers: { companyId },
  });
  return response.data;
};

/**
 * 사용자가 받은 면접 제안 목록 (OFFERED 상태만)
 */
export const getReceivedOffers = async (
  userId: number,
): Promise<InterviewOfferResponse[]> => {
  const response = await api.get("/api/interview-offers/received", {
    headers: { userId },
  });
  return response.data;
};

/**
 * ✅ 사용자의 모든 면접 제안 조회 (deleted 필터 포함)
 */
export const getMyOffers = async (
  userId: number,
  includeDeleted?: boolean,
): Promise<InterviewOfferResponse[]> => {
  const response = await api.get("/api/interview-offers/my", {
    params: { includeDeleted },
    headers: { userId },
  });
  return response.data;
};

/**
 * 기업의 면접 제안 목록
 */
export const getCompanyOffers = async (
  companyId: number,
  jobId?: number,
): Promise<InterviewOfferResponse[]> => {
  const response = await api.get("/api/interview-offers/company", {
    params: { jobId },
    headers: { companyId },
  });
  return response.data;
};

/**
 * 면접 제안 수락
 */
export const acceptOffer = async (
  offerId: number,
  userId: number,
): Promise<InterviewOfferResponse> => {
  const response = await api.post(
    `/api/interview-offers/${offerId}/accept`,
    null,
    {
      headers: { userId },
    },
  );
  return response.data;
};

/**
 * 면접 제안 거절
 */
export const rejectOffer = async (
  offerId: number,
  userId: number,
): Promise<InterviewOfferResponse> => {
  const response = await api.post(
    `/api/interview-offers/${offerId}/reject`,
    null,
    {
      headers: { userId },
    },
  );
  return response.data;
};

/**
 * ✅ 면접 제안 삭제 (Soft Delete)
 */
export const deleteOffer = async (
  offerId: number,
  userId: number,
): Promise<void> => {
  await api.delete(`/api/interview-offers/${offerId}`, {
    headers: { userId },
  });
};

/**
 * 특정 인재에게 제안한 공고 ID 목록
 */
export const getOfferedJobIds = async (
  companyId: number,
  userId: number,
): Promise<number[]> => {
  const response = await api.get("/api/interview-offers/company/offered-jobs", {
    params: { userId },
    headers: { companyId },
  });
  return response.data;
};

/**
 * ✅ 면접 제안 일괄 삭제
 */
export const deleteOffersBulk = async (
  offerIds: number[],
  userId: number,
): Promise<void> => {
  await api.delete("/api/interview-offers/bulk", {
    data: offerIds, // Body에 ID 리스트 전송
    headers: { userId }, // 인증 헤더 (필요시)
  });
};
