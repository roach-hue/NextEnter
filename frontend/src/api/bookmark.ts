import api from "./axios";

// ✅ 원래 주소가 맞습니다. /list 붙이지 마세요.
const API_BASE_URL = "/api/bookmarks";

export interface BookmarkDto {
  bookmarkId: number;
  jobPostingId: number;
  createdAt: string;
}

export interface BookmarkToggleResponse {
  isBookmarked: boolean;
  bookmark?: BookmarkDto;
}

export interface BookmarkCheckResponse {
  isBookmarked: boolean;
}

export const toggleBookmark = async (
  userId: number,
  jobId: number,
): Promise<BookmarkToggleResponse> => {
  const response = await api.put(
    `${API_BASE_URL}/${jobId}/toggle`,
    {},
    { params: { userId } },
  );
  return response.data;
};

export const checkBookmark = async (
  userId: number,
  jobId: number,
): Promise<BookmarkCheckResponse> => {
  const response = await api.get(`${API_BASE_URL}/${jobId}/status`, {
    params: { userId },
  });
  return response.data;
};

export const addBookmark = async (
  userId: number,
  jobId: number,
): Promise<BookmarkDto> => {
  const response = await api.post(
    `${API_BASE_URL}/${jobId}`,
    {},
    { params: { userId } },
  );
  return response.data;
};

export const removeBookmark = async (
  userId: number,
  jobId: number,
): Promise<void> => {
  await api.delete(`${API_BASE_URL}/${jobId}`, {
    params: { userId },
  });
};

// 👇 스크랩 목록용 DTO
// 👇 백엔드 BookmarkedJobDto와 일치시킴
export interface BookmarkedJobDto {
  bookmarkId: number;
  bookmarkedAt: string;
  jobPostingId: number; // 백엔드 DTO 확인 완료
  title: string;
  companyName: string;
  location: string;
  experienceLevel: string;
  salary: string;
  jobType: string;
  deadline: string;
  status: string;
}

// 👇 백엔드 Page 객체 대응
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
}

/**
 * 북마크 목록 조회
 * GET /api/bookmarks
 */
export const getBookmarkedJobs = async (
  userId: number,
  page: number = 0,
  size: number = 20,
  sort: string = "createdAt,desc",
): Promise<PageResponse<BookmarkedJobDto>> => {
  // 🚨 [핵심 수정] "/list"를 지웠습니다. API_BASE_URL 그대로 사용합니다.
  const response = await api.get(`${API_BASE_URL}`, {
    params: {
      userId,
      page,
      size,
      sort,
    },
  });
  return response.data;
};
