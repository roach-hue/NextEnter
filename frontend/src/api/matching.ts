import apiClient from "./axios";

// ========================================
// 매칭 관련 DTO 타입 정의
// ========================================

export interface MatchingHistoryDTO {
  matchingId: number;
  resumeId: number;
  userId: number;
  jobId: number | null;
  jobStatus: string | null; // "ACTIVE", "CLOSED"
  companyName: string | null;
  score: number | null;
  grade: string; // "S", "A", "B", "C", "F" (기업 매칭 등급)
  resumeGrade: string | null; // 이력서 종합 등급
  experienceLevel: string | null; // JUNIOR, SENIOR
  missingSkills: string | null;
  feedback: string | null;
  pros: string | null;
  cons: string | null;
  matchingType: string; // "MANUAL", "AI_RECOMMEND"
  createdAt: string;
}

export interface MatchingResultDTO {
  matchingId: number;
  resumeId: number;
  jobId: number;
  grade: string;
  missingSkills?: string;
  cons?: string;
  feedback?: string;
  pros?: string;
  matchingType: string;
  createdAt: string;
}

export interface MatchingRequest {
  resumeId: number;
  jobId: number;
  grade: string;
  missingSkills?: string;
  cons?: string;
  feedback?: string;
  pros?: string;
  matchingType?: string;
}

// ========================================
// 매칭 API 함수들
// ========================================

/**
 * 사용자별 전체 매칭 히스토리 조회
 * @param userId 사용자 ID
 * @returns 매칭 히스토리 목록
 */
export const getMatchingsByUserId = async (
  userId: number
): Promise<MatchingHistoryDTO[]> => {
  const response = await apiClient.get(`/api/matching/user/${userId}`);
  return response.data.data || [];
};

/**
 * 이력서별 매칭 히스토리 조회
 * @param resumeId 이력서 ID
 * @returns 매칭 히스토리 목록
 */
export const getMatchingsByResumeId = async (
  resumeId: number
): Promise<MatchingHistoryDTO[]> => {
  const response = await apiClient.get(`/api/matching/resume/${resumeId}`);
  return response.data.data || [];
};

/**
 * 공고별 매칭 결과 조회
 * @param jobId 공고 ID
 * @returns 매칭 결과 목록
 */
export const getMatchingsByJobId = async (
  jobId: number
): Promise<MatchingResultDTO[]> => {
  const response = await apiClient.get(`/api/matching/job/${jobId}`);
  return response.data.data || [];
};

/**
 * 매칭 상세 조회
 * @param matchingId 매칭 ID
 * @returns 매칭 상세 정보
 */
export const getMatchingById = async (
  matchingId: number
): Promise<MatchingResultDTO> => {
  const response = await apiClient.get(`/api/matching/${matchingId}`);
  return response.data.data;
};

/**
 * 매칭 생성
 * @param request 매칭 요청 데이터
 * @returns 생성된 매칭 결과
 */
export const createMatching = async (
  request: MatchingRequest
): Promise<MatchingResultDTO> => {
  const response = await apiClient.post("/api/matching", request);
  return response.data.data;
};

/**
 * 매칭 삭제
 * @param matchingId 매칭 ID
 */
export const deleteMatching = async (matchingId: number): Promise<void> => {
  await apiClient.delete(`/api/matching/${matchingId}`);
};