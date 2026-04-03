import api from "./axios";

// 자소서 데이터 타입
export interface CoverLetter {
  coverLetterId: number;
  userId: number;
  title: string;
  content?: string;
  filePath?: string;
  fileType?: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

// 자소서 목록 응답
export interface CoverLetterListResponse {
  content: CoverLetter[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 자소서 생성/수정 요청
export interface CoverLetterRequest {
  title: string;
  content?: string;
}

// 파일 업로드 응답
export interface CoverLetterUploadResponse {
  coverLetterId: number;
  title: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  message: string;
}

/**
 * 자소서 목록 조회
 */
export const getCoverLetterList = async (
  userId: number,
  page: number = 0,
  size: number = 10
): Promise<CoverLetterListResponse> => {
  const response = await api.get<CoverLetterListResponse>(
    `/api/coverletters`,
    {
      params: { userId, page, size },
    }
  );
  return response.data;
};

/**
 * 자소서 상세 조회
 */
export const getCoverLetterDetail = async (
  userId: number,
  id: number
): Promise<CoverLetter> => {
  const response = await api.get<CoverLetter>(`/api/coverletters/${id}`, {
    params: { userId },
  });
  return response.data;
};

/**
 * 자소서 작성
 */
export const createCoverLetter = async (
  userId: number,
  request: CoverLetterRequest
): Promise<number> => {
  const response = await api.post<number>(`/api/coverletters`, request, {
    params: { userId },
  });
  return response.data;
};

/**
 * 자소서 수정
 */
export const updateCoverLetter = async (
  userId: number,
  id: number,
  request: CoverLetterRequest
): Promise<void> => {
  await api.put(`/api/coverletters/${id}`, request, {
    params: { userId },
  });
};

/**
 * 자소서 삭제
 */
export const deleteCoverLetter = async (
  userId: number,
  id: number
): Promise<void> => {
  await api.delete(`/api/coverletters/${id}`, {
    params: { userId },
  });
};

/**
 * 파일 업로드
 */
export const uploadCoverLetterFile = async (
  userId: number,
  file: File
): Promise<CoverLetterUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<CoverLetterUploadResponse>(
    `/api/coverletters/upload`,
    formData,
    {
      params: { userId },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * 파일 다운로드
 */
export const downloadCoverLetterFile = async (
  id: number,           
  userId: number,      
  fileName?: string    
): Promise<Blob> => {
  const response = await api.get(`/api/coverletters/${id}/file`, {
    params: { userId },
    responseType: "blob",
  });
  return response.data;
};

/**
 * 파일 삭제
 */
export const deleteCoverLetterFile = async (
  userId: number,
  id: number
): Promise<void> => {
  await api.delete(`/api/coverletters/${id}/file`, {
    params: { userId },
  });
};

/**
 * 파일 다운로드 헬퍼 함수
 */
export const triggerFileDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};