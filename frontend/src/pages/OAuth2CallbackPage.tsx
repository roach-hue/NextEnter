import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function OAuth2CallbackPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    const name = params.get("name");

    console.log("OAuth2 콜백 - token:", token, "email:", email, "name:", name);

    if (token && email && name) {
      hasProcessed.current = true;

      const decodedEmail = decodeURIComponent(email);
      const decodedName = decodeURIComponent(name);

      console.log("디코딩된 이메일:", decodedEmail);
      console.log("디코딩된 이름:", decodedName);

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.userId;

        console.log("JWT payload:", payload);
        console.log("userId:", userId);

        // ✅ 소셜 로그인은 개인회원 전용이므로 userType을 "personal"로 설정
        login(
          {
            userId,
            email: decodedEmail,
            name: decodedName,
            userType: "personal", // ✅ 추가
          },
          token
        );

        // ✅ 개인회원 페이지로 이동
        alert(`${decodedName}님, 환영합니다!`);
        navigate("/user", { replace: true });
      } catch (error) {
        console.error("JWT 토큰 파싱 오류:", error);
        alert("로그인 처리 중 오류가 발생했습니다.");
        navigate("/user/login", { replace: true });
      }
    } else {
      console.error("토큰 또는 사용자 정보가 없습니다.");
      alert("로그인에 실패했습니다.");
      navigate("/user/login", { replace: true });
    }
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 text-6xl">🔄</div>
        <h2 className="text-2xl font-bold mb-2">로그인 처리 중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
