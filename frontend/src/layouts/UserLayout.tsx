import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function UserLayout() {
  const location = useLocation();
  
  // 로그인, 회원가입, 비밀번호 찾기 페이지에서는 헤더와 푸터 숨김
  const hideHeaderFooter = [
    '/user/login',
    '/user/signup',
    '/user/forgot-password',
  ].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideHeaderFooter && <Header />}
      <Outlet />
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}
