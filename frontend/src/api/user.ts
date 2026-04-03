import api from "./axios";

export interface UserProfile {
  userId: number;
  email: string;
  name: string;
  phone?: string;
  age?: number;
  gender?: string;
  profileImage?: string;
  bio?: string;
  provider?: string;
  createdAt?: string;
  address?: string; // ✅ 추가
  detailAddress?: string; // ✅ 추가
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  age?: number;
  gender?: string;
  bio?: string;
  address?: string; // ✅ 추가
  detailAddress?: string; // ✅ 추가
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// 사용자 정보 조회
export const getUserProfile = async (
  userId: number
): Promise<ApiResponse<UserProfile>> => {
  const response = await api.get<ApiResponse<UserProfile>>(
    `/api/auth/user/${userId}`
  );
  return response.data;
};

// 사용자 정보 수정
export const updateUserProfile = async (
  userId: number,
  data: UpdateUserRequest
): Promise<ApiResponse<UserProfile>> => {
  const response = await api.put<ApiResponse<UserProfile>>(
    `/api/auth/user/${userId}`,
    data
  );
  return response.data;
};

// 프로필 이미지 업로드
export const uploadProfileImage = async (
  userId: number,
  file: File
): Promise<ApiResponse<{ profileImage: string }>> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ApiResponse<{ profileImage: string }>>(
    `/api/auth/user/${userId}/profile-image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// ✅ 아래 비밀번호 변경 관련 함수 추가

// 비밀번호 변경 인증코드 발송
export interface SendVerificationRequest {
  email: string;
  type: string;
}

export const sendPasswordChangeCode = async (
  email: string
): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>(
    `/api/auth/user/password-change/request`,
    { email, type: "PASSWORD_CHANGE" }
  );
  return response.data;
};

// 비밀번호 변경
export interface ChangePasswordRequest {
  email: string;
  verificationCode: string;
  newPassword: string;
}

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>(
    `/api/auth/user/password-change`,
    data
  );
  return response.data;
};

/**
 * 회원 탈퇴 인증 코드 발송
 */
export const sendWithdrawalCode = async (userId: number): Promise<void> => {
  await api.post('/api/auth/withdrawal/send-code', null, {
    headers: {
      userId: userId.toString(),
    },
  });
};

/**
 * 회원 탈퇴
 */
export const withdrawUser = async (
  userId: number,
  verificationCode: string
): Promise<{ creditBalance: number; hasCredit: boolean }> => {
  const response = await api.delete('/api/auth/withdrawal', {
    headers: {
      userId: userId.toString(),
    },
    data: {
      verificationCode,
    },
  });
  return response.data.data;
};