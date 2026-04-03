import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { companyNavigationMenuData } from "../navigation-menu/data/companyMenuData";

export const useCompanyPageNavigation = (
  currentPageId: string,
  initialMenuOrDefault?: string,
  onNavigate?: (page: string, subMenu?: string) => void
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const menuFromUrl = searchParams.get("menu");

  const [activeMenu, setActiveMenu] = useState(
    menuFromUrl || initialMenuOrDefault || currentPageId
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
    navigateCallback?: (page: string, subMenu: string) => void
  ) => {
    // 1️⃣ 별도 페이지로 이동해야 하는 메뉴들 (공고 등록 제거됨)
    const separateRoutes: { [key: string]: string } = {
      "credit-sub-2": "/company/credit/charge",
      "applicants-sub-2": "/company/applicants/1/compatibility", // ✅ 적합도 분석 유지
    };

    if (separateRoutes[menuId]) {
      navigate(`${separateRoutes[menuId]}?menu=${menuId}`);
      return;
    }

    // 같은 탭 안에서 이동할 때의 로직
    let targetTab = "";
    const sections = Object.values(companyNavigationMenuData) as any[];

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
      // 현재 페이지 내에서 탭만 변경
      const baseRoutes: { [key: string]: string } = {
        "jobs-sub-1": "/company/jobs/all",
        "jobs-sub-2": "/company/jobs",
        applicants: "/company/applicants",
        "talent-sub-1": "/company/talent-search",
        "talent-sub-2": "/company/scrap-talent",
        talent: "/company/talent-search",
        companyMy: "/company/mypage",
        credit: "/company/credit",
      };

      const targetBaseRoute = baseRoutes[menuId] || baseRoutes[targetTab];

      // ✅ 같은 메뉴를 클릭했을 때도 처리
      if (activeMenu === menuId) {
        // 같은 메뉴 클릭 시 URL에 timestamp 추가해서 강제 리로드
        const timestamp = Date.now();
        setSearchParams({ menu: menuId, reload: timestamp.toString() });
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
        // 다른 대분류 페이지로 이동
        const routes: { [key: string]: string } = {
          "jobs-sub-1": "/company/jobs/all",
          "jobs-sub-2": "/company/jobs",
          jobs: "/company/jobs",
          applicants: "/company/applicants",
          "talent-sub-1": "/company/talent-search",
          "talent-sub-2": "/company/scrap-talent",
          talent: "/company/talent-search",
          companyMy: "/company/mypage",
          credit: "/company/credit",
        };
        const route = routes[menuId] || routes[targetTab];
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
