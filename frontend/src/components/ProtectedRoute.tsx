import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedUserType?: "personal" | "company";
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  allowedUserType,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  console.log("🛡️ ProtectedRoute 검사:", {
    path: location.pathname,
    isLoading,
    isAuthenticated,
    userType: user?.userType,
    allowedUserType,
    requireAuth
  });

  // ✅ 로딩 중일 때는 로딩 화면 표시
  if (isLoading) {
    console.log("⏳ 로딩 중...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증이 필요한데 로그인하지 않은 경우
  if (requireAuth && !isAuthenticated) {
    console.warn("❌ 인증 필요 - 로그인 페이지로 리다이렉트");
    
    if (location.pathname.startsWith("/company")) {
      return (
        <Navigate to="/company/login" state={{ from: location }} replace />
      );
    }
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }

  // ✅ allowedUserType 검사 - 경로 기반으로 더 확실하게 판단
  if (allowedUserType && user) {
    // 현재 경로를 기반으로 실제 타입 추론
    const isCompanyPath = location.pathname.startsWith("/company");
    const isUserPath = location.pathname.startsWith("/user");
    
    // 경로와 요구되는 타입이 일치하는지 확인
    const pathMatchesType = 
      (isCompanyPath && allowedUserType === "company") ||
      (isUserPath && allowedUserType === "personal");

    // ✅ userType이 설정되어 있고 일치하지 않는 경우
    if (user.userType && user.userType !== allowedUserType) {
      // 하지만 경로가 올바른 경우 (예: /user로 시작하는데 personal 요구) - 통과
      if (pathMatchesType) {
        console.warn("⚠️ userType 불일치지만 경로가 맞으므로 통과:", {
          userType: user.userType,
          allowedUserType,
          path: location.pathname
        });
        // userType을 경로에 맞게 수정 (localStorage 업데이트)
        const correctedUserType = isUserPath ? "personal" : "company";
        const updatedUser = { ...user, userType: correctedUserType };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("✅ userType 자동 수정:", correctedUserType);
        // 페이지 새로고침 없이 계속 진행
      } else {
        // 경로도 틀린 경우 - 리다이렉트
        console.error("❌ userType과 경로 모두 불일치:", {
          required: allowedUserType,
          actual: user?.userType,
          path: location.pathname
        });
        
        if (allowedUserType === "personal") {
          alert("개인회원 전용 페이지입니다. 개인 페이지로 이동합니다.");
          return <Navigate to="/user" replace />;
        } else {
          alert("기업회원 전용 페이지입니다. 기업 페이지로 이동합니다.");
          return <Navigate to="/company" replace />;
        }
      }
    }
    
    // ✅ userType이 없는 경우 - 경로 기반으로 설정
    if (!user.userType) {
      console.warn("⚠️ userType이 없습니다. 경로를 기반으로 설정합니다.");
      const inferredType = isUserPath ? "personal" : "company";
      
      if (inferredType !== allowedUserType) {
        console.error("❌ 경로와 요구 타입 불일치");
        if (allowedUserType === "personal") {
          alert("개인회원으로 다시 로그인해주세요.");
          return <Navigate to="/user/login" replace />;
        } else {
          alert("기업회원으로 다시 로그인해주세요.");
          return <Navigate to="/company/login" replace />;
        }
      }
      
      // userType 자동 설정
      const updatedUser = { ...user, userType: inferredType };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("✅ userType 자동 설정:", inferredType);
    }
  }

  console.log("✅ ProtectedRoute 통과");
  return <>{children}</>;
}
