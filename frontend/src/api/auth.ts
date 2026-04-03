import api from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  token: string;
  email: string;
  name: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  age?: number;
  gender?: string;
  address?: string; // ✅ 추가
  detailAddress?: string; // ✅ 추가
}

export interface SignupResponse {
  userId: number;
  email: string;
  name: string;
  age?: number;
  gender?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// ✅ 로그인 - 객체를 받도록 수정
export const login = async (
  loginData: LoginRequest
): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await api.post<any>(
      "/api/auth/login",
      loginData
    );
    
    // 🔍 디버깅용 로그
    console.log("📄 [API] 로그인 응답 원본:", response);

    // ✅ 백엔드 응답이 ApiResponse { success, message, data } 형식이 아닌 경우 처리
    if (response.data && response.data.userId && response.data.token) {
      return {
        success: true,
        message: "로그인 성공",
        data: response.data
      };
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ [API] 로그인 요청 실패:", error);
    throw error;
  }
};

// 로그아웃
export const logout = async (): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>("/api/auth/logout");
  return response.data;
};

// 회원가입
export const signup = async (
  signupData: SignupRequest
): Promise<ApiResponse<SignupResponse>> => {
  try {
    const response = await api.post<any>(
      "/api/auth/signup",
      signupData
    );

    // 🔍 디버깅용 로그
    console.log("📄 [API] 회원가입 응답 원본:", response);

    if (response.data && response.data.userId) {
      return {
        success: true,
        message: "회원가입 성공",
        data: response.data
      };
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ [API] 회원가입 요청 실패:", error);
    throw error;
  }
};
