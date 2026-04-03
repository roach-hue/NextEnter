import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ 현재 경로에 맞는 토큰 키 가져오기
const getTokenKey = () => {
  const isCompanyPath = window.location.pathname.startsWith('/company');
  return isCompanyPath ? "company_token" : "user_token";
};

const getUserKey = () => {
  const isCompanyPath = window.location.pathname.startsWith('/company');
  return isCompanyPath ? "company_user" : "user_user";
};

// 요청 인터셉터: 모든 요청에 토큰 추가
api.interceptors.request.use(
  (config) => {
    const tokenKey = getTokenKey();
    const token = localStorage.getItem(tokenKey);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터: 401 에러 시 로그아웃 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 에러 - 토큰 만료 또는 유효하지 않음");

      // ✅ 현재 경로에 맞는 키 삭제
      const tokenKey = getTokenKey();
      const userKey = getUserKey();

      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);

      // 현재 페이지가 /company로 시작하면 기업 로그인으로
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/company")) {
        window.location.href = "/company/login";
      } else {
        window.location.href = "/user/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;