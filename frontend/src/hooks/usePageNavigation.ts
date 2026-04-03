import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { navigationMenuData } from "../features/navigation-menu/data/menuData";
import { checkNavigationBlocked } from "../utils/navigationBlocker";

export const usePageNavigation = (
  currentPageId: string,
  initialMenuOrDefault?: string,
  onNavigate?: (page: string, subMenu?: string) => void,
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const menuFromUrl = searchParams.get("menu");

  const [activeMenu, setActiveMenu] = useState(
    menuFromUrl || initialMenuOrDefault || currentPageId,
  );

  useEffect(() => {
    const newMenu = searchParams.get("menu");
    if (newMenu) {
      setActiveMenu(newMenu);
    }
  }, [searchParams]);

  useEffect(() => {
    if (initialMenuOrDefault && !menuFromUrl) {
      setActiveMenu(initialMenuOrDefault);
    }
  }, [initialMenuOrDefault, menuFromUrl]);

  const handleMenuClick = (
    menuId: string,
    navigateCallback?: (page: string, subMenu: string) => void,
  ) => {
    // 네비게이션 차단 체크
    if (checkNavigationBlocked()) return;

    // ✅ 별도 페이지 라우팅 테이블
    const separateRoutes: { [key: string]: string } = {
      "job-sub-1": "/user/jobs/all",
      "job-sub-2": "/user/jobs/ai",
      "job-sub-3": "/user/jobs/position",
      "job-sub-4": "/user/jobs/location",
      "resume-sub-2": "/user/coverletter",
      "credit-sub-2": "/user/credit/charge",
      "mypage-sub-2": "/user/profile",
      "mypage-sub-3": "/user/application-status",
      "mypage-sub-4": "/user/offers/interview",
      "mypage-sub-5": "/user/scrap-status",
    };

    // 특별 처리 라우트
    const specialRoutes: { [key: string]: string } = {
      "application-status": "/user/application-status",
      "ai-recommend": "/user/jobs/ai",
    };

    if (specialRoutes[menuId]) {
      const targetPath = specialRoutes[menuId];
      
      // ✅ 같은 메뉴 클릭 시 새로고침
      if (activeMenu === menuId && location.pathname === targetPath) {
        window.location.reload();
        return;
      }
      
      navigate(targetPath);
      return;
    }

    // ✅ 별도 페이지 이동 로직
    if (separateRoutes[menuId]) {
      const targetPath = separateRoutes[menuId];
      
      // 같은 페이지에서 같은 메뉴를 클릭하면 새로고침
      if (activeMenu === menuId && location.pathname === targetPath) {
        window.location.reload();
        return;
      }
      
      navigate(`${targetPath}?menu=${menuId}`);
      return;
    }

    // --- 기존 탭 내부 이동 로직 ---
    let targetTab = "";
    const sections = Object.values(navigationMenuData) as any[];

    for (const section of sections) {
      if (
        section.id === menuId ||
        section.items?.some((item: any) => item.id === menuId)
      ) {
        targetTab = section.id;
        break;
      }
    }

    if (targetTab === currentPageId) {
      const baseRoutes: { [key: string]: string } = {
        job: "/user",
        resume: "/user/resume",
        matching: "/user/matching",
        interview: "/user/interview",
        offer: "/user/offers",
        mypage: "/user/mypage",
        credit: "/user/credit",
      };

      const targetBaseRoute = baseRoutes[targetTab];

      // ✅ 같은 메뉴 클릭 시 새로고침
      if (activeMenu === menuId) {
        window.location.reload();
        return;
      }

      if (targetBaseRoute && location.pathname !== targetBaseRoute) {
        navigate(`${targetBaseRoute}?menu=${menuId}`);
      } else {
        setActiveMenu(menuId);
        setSearchParams({ menu: menuId });
      }
    } else {
      const callback = navigateCallback || onNavigate;
      if (callback) {
        callback(targetTab, menuId);
      } else {
        const routes: { [key: string]: string } = {
          job: "/user",
          resume: "/user/resume",
          matching: "/user/matching",
          interview: "/user/interview",
          offer: "/user/offers",
          mypage: "/user/mypage",
          credit: "/user/credit",
        };
        const route = routes[targetTab];
        if (route) {
          navigate(`${route}?menu=${menuId}`);
        }
      }
    }
  };

  return {
    activeMenu,
    handleMenuClick,
    setActiveMenu,
  };
};