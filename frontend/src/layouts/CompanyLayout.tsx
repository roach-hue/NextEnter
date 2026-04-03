import { Outlet, useLocation } from "react-router-dom";
import CompanyHeader from "../features-company/components/CompanyHeader";
import CompanyFooter from "../features-company/components/CompanyFooter";

export default function CompanyLayout() {
  const location = useLocation();
  
  // 로그인, 회원가입 페이지에서는 헤더와 푸터 숨김
  const hideHeaderFooter = [
    '/company/login',
    '/company/signup',
  ].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideHeaderFooter && <CompanyHeader />}
      <Outlet />
      {!hideHeaderFooter && <CompanyFooter />}
    </div>
  );
}
