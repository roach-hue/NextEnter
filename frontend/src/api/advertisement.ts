import api from "./axios";

export interface Advertisement {
  id: number;
  companyId: number;
  title: string;
  description: string;
  backgroundColor: string;
  buttonText: string;
  targetUrl?: string;
  targetPage?: string;
  isActive: boolean;
  priority: number;
}

export interface AdvertisementRequest {
  title: string;
  description: string;
  backgroundColor: string;
  buttonText: string;
  targetUrl?: string;
  targetPage?: string;
  priority?: number;
}

// 활성화된 광고 목록 조회 (모든 사용자)
export const getActiveAdvertisements = async (): Promise<Advertisement[]> => {
  const response = await api.get("/api/advertisements/active");
  return response.data;
};

// 기업의 광고 목록 조회 (기업 전용)
export const getCompanyAdvertisements = async (companyId: number): Promise<Advertisement[]> => {
  const response = await api.get(`/api/advertisements/company/${companyId}`);
  return response.data;
};

// 광고 생성 (기업 전용)
export const createAdvertisement = async (
  companyId: number,
  data: AdvertisementRequest
): Promise<Advertisement> => {
  const response = await api.post(`/api/advertisements/company/${companyId}`, data);
  return response.data;
};

// 광고 수정 (기업 전용)
export const updateAdvertisement = async (
  advertisementId: number,
  companyId: number,
  data: AdvertisementRequest
): Promise<Advertisement> => {
  const response = await api.put(
    `/api/advertisements/${advertisementId}/company/${companyId}`,
    data
  );
  return response.data;
};

// 광고 활성화/비활성화 (기업 전용)
export const toggleAdvertisementStatus = async (
  advertisementId: number,
  companyId: number
): Promise<void> => {
  await api.patch(`/api/advertisements/${advertisementId}/company/${companyId}/toggle`);
};

// 광고 삭제 (기업 전용)
export const deleteAdvertisement = async (
  advertisementId: number,
  companyId: number
): Promise<void> => {
  await api.delete(`/api/advertisements/${advertisementId}/company/${companyId}`);
};
