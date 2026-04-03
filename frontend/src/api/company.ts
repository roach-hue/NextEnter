import axios from "./axios";

// ==========================================
// 1. 타입 정의 (Interfaces)
// ==========================================

// ✅ 기업 회원가입 요청 타입
export interface CompanyRegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  businessNumber: string;
  companyName: string;
  industry?: string;
  employeeCount?: number;
  website?: string;
  description?: string;
  address?: string;
  detailAddress?: string;
}

export interface CompanyProfile {
  companyId: number;
  companyName: string;
  businessNumber: string;
  email: string;
  industry: string;
  employeeCount: number;
  logoUrl: string;
  website: string;
  address: string;
  description: string;
  isActive: boolean;
  managerName: string;
  managerPhone: string;
  companySize?: string;
  ceoName?: string;
  shortIntro?: string;
  snsUrl?: string;
  detailAddress?: string;
  managerDepartment?: string;
}

// ==========================================
// 2. 인증 관련 API
// ==========================================

export const loginCompany = async (data: any) => {
  const response = await axios.post("/api/company/login", data);
  return response.data;
};

export const registerCompany = async (data: CompanyRegisterRequest) => {
  const response = await axios.post("/api/company/register", data);
  return response.data;
};

// ==========================================
// 3. 프로필 관련 API (안전 장치 추가됨)
// ==========================================

/**
 * 기업 프로필 조회
 */
export const getCompanyProfile = async (
  companyId: number,
): Promise<CompanyProfile> => {
  const response = await axios.get(`/api/company/${companyId}/profile`);

  // 🔍 디버깅용 로그 (F12 콘솔에서 확인 가능)
  console.log("기업 프로필 응답 데이터:", response);

  // ✅ [Case 1] 백엔드가 { success: true, data: { ... } } 로 감싸서 준 경우
  if (response.data && response.data.data) {
    return response.data.data;
  }

  // ✅ [Case 2] Axios 인터셉터가 이미 response.data를 리턴했거나, 백엔드가 안 감싸고 준 경우
  if (response.data) {
    return response.data;
  }

  // ✅ [Case 3] 최악의 경우 (구조가 예상과 다를 때)
  return response as any;
};

/**
 * 비밀번호 변경
 */
export const changeCompanyPassword = async (
  companyId: number,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await axios.post(`/api/company/${companyId}/password`, {
    currentPassword,
    newPassword,
  });
};

/**
 * 기업 프로필 수정
 */
export const updateCompanyProfile = async (
  companyId: number,
  data: Partial<CompanyProfile>,
): Promise<CompanyProfile> => {
  const response = await axios.put(`/api/company/${companyId}/profile`, data);

  // 🔍 디버깅용 로그
  console.log("프로필 수정 응답 데이터:", response);

  // Case 1: 껍질이 두 겹일 때
  if (response.data && response.data.data) {
    return response.data.data;
  }
  // Case 2: 껍질이 한 겹일 때
  if (response.data) {
    return response.data;
  }

  return response as any;
};
