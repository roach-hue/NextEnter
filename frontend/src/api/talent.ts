import api from "./axios";

const API_BASE_URL = "/api/resume";

// 인재 검색 응답 타입
export interface TalentSearchResponse {
  resumeId: number;
  userId: number;
  name: string; // 마스킹된 이름
  jobCategory: string;
  skills: string[];
  location: string;
  experienceYears: number;
  salaryRange: string;
  matchScore: number;
  isAvailable: boolean;
  viewCount: number;
  contactStatus?: string; // 연락 상태 (PENDING, ACCEPTED, REJECTED)
}

// 페이징 응답 타입
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// ✅ 인재 검색 - 공개된 이력서만 가져오기
export const searchTalents = async (params?: {
  jobCategory?: string;
  keyword?: string;
  page?: number;
  size?: number;
  companyUserId?: number; // ✅ 기업 ID 추가
}): Promise<PageResponse<TalentSearchResponse>> => {
  console.log("🔍 [인재검색] 검색 파라미터:", params);
  
  // ✅ companyUserId를 params에서 분리
  const { companyUserId, ...searchParams } = params || {};
  
  // ✅ headers 설정
  const headers: any = {};
  if (companyUserId) {
    headers.userId = companyUserId.toString();
  }
  
  // 백엔드 /api/resume/search 엔드포인트 호출
  console.log("🚀 [인재검색] /api/resume/search 호출 시도...", { params: searchParams, headers });
  const response = await api.get(`${API_BASE_URL}/search`, { 
    params: searchParams,
    headers 
  });
  console.log("✅ [인재검색] 검색 결과:", response.data);
  return response.data;
};

// ✅ 인재 저장 (북마크)
export const saveTalent = async (resumeId: number, companyUserId: number) => {
  const response = await api.post(`${API_BASE_URL}/save/${resumeId}`, null, {
    headers: {
      userId: companyUserId.toString(),
    },
  });
  return response.data;
};

// ✅ 인재 저장 취소
export const unsaveTalent = async (resumeId: number, companyUserId: number) => {
  const response = await api.delete(`${API_BASE_URL}/save/${resumeId}`, {
    headers: {
      userId: companyUserId.toString(),
    },
  });
  return response.data;
};

// ✅ 인재 저장 여부 확인
export const checkSavedTalent = async (resumeId: number, companyUserId: number) => {
  const response = await api.get(`${API_BASE_URL}/save/check/${resumeId}`, {
    headers: {
      userId: companyUserId.toString(),
    },
  });
  return response.data;
};

// ✅ 스크랩한 인재 목록 조회
export const getSavedTalents = async (companyUserId: number): Promise<PageResponse<TalentSearchResponse>> => {
  console.log("📋 [스크랩인재] 스크랩 목록 조회 요청, companyUserId:", companyUserId);
  const response = await api.get(`${API_BASE_URL}/saved`, {
    headers: {
      userId: companyUserId.toString(),
    },
  });
  console.log("✅ [스크랩인재] 스크랩 목록 조회 성공:", response.data);
  return response.data;
};

// ✅ 인재 연락하기
export const contactTalent = async (resumeId: number, message: string, companyUserId: number) => {
  const response = await api.post(
    `${API_BASE_URL}/contact`,
    { resumeId, message },
    {
      headers: {
        userId: companyUserId.toString(),
      },
    }
  );
  return response.data;
};
