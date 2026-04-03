import { useEffect, useState } from "react";
// ✅ [1] 우리가 만든 메뉴 데이터 원본 불러오기
import { navigationMenuData } from "../features/navigation-menu/data/menuData";

interface MenuItem {
  id: string;
  label: string;
  hasSubmenu?: boolean;
  submenu?: { id: string; label: string }[];
}

interface CommonSidebarProps {
  activeMenu: string;
  onMenuClick: (menuId: string) => void;
  // props로 메뉴를 따로 안 넣어주면, 아래에서 만든 '통합 데이터'를 기본값으로 씁니다.
  menuItems?: MenuItem[];
  title?: string; // ✅ [추가] 페이지 제목
}

// ✅ [2] 불러온 navigationMenuData를 사이드바가 좋아하는 모양(MenuItem[])으로 변환
const transformedMenuItems: MenuItem[] = Object.values(navigationMenuData).map(
  (navItem: any) => ({
    id: navItem.id,
    label: navItem.title, // 데이터의 'title'을 사이드바의 'label'로 연결
    hasSubmenu: navItem.items && navItem.items.length > 0, // 하위 메뉴가 있으면 true
    submenu: navItem.items?.map((sub: any) => ({
      id: sub.id,
      label: sub.label,
    })),
  }),
);

export default function LeftSidebar({
  activeMenu,
  onMenuClick,
  menuItems = transformedMenuItems, // ✅ [3] 변환된 데이터를 기본값으로 사용
  title, // ✅ [추가] title 받아오기
}: CommonSidebarProps) {
  const [expandedMenuIds, setExpandedMenuIds] = useState<string[]>([]);

  // 자동 펼침 로직 (기존과 동일)
  useEffect(() => {
    const parentMenu = menuItems.find(
      (item) =>
        item.id === activeMenu ||
        item.submenu?.some((sub) => sub.id === activeMenu),
    );

    if (parentMenu) {
      setExpandedMenuIds((prev) => {
        if (prev.includes(parentMenu.id)) return prev;
        return [...prev, parentMenu.id];
      });
    }
  }, [activeMenu, menuItems]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenuIds((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  };

  // ✅ 상위 메뉴 클릭 핸들러 - 펼치기 + 첫 번째 하위 메뉴로 이동
  const handleParentMenuClick = (item: MenuItem) => {
    if (item.hasSubmenu) {
      // 하위 메뉴가 있으면 펼치기
      toggleMenu(item.id);

      // 첫 번째 하위 메뉴로 이동
      if (item.submenu && item.submenu.length > 0) {
        onMenuClick(item.submenu[0].id);
      }
    } else {
      // 하위 메뉴가 없으면 해당 메뉴로 이동
      onMenuClick(item.id);
    }
  };

  return (
    // ✅ [수정] wrapper div에 sticky 적용 (제목 + 사이드바 함께 고정)
    <div className="sticky top-24 w-64 h-fit shrink-0">
      {/* ✅ [추가] 제목이 있으면 렌더링 */}
      {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
      
      {/* ✅ [수정] aside는 순수하게 메뉴만 담당 */}
      <aside className="p-4 space-y-2 bg-white border-r border-gray-200">
      {menuItems.map((item) => {
        const isExpanded = expandedMenuIds.includes(item.id);

        const isParentActive =
          activeMenu === item.id ||
          item.submenu?.some((sub) => sub.id === activeMenu);

        return (
          <div key={item.id}>
            {/* 상위 메뉴 */}
            <button
              onClick={() => handleParentMenuClick(item)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                isParentActive
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{item.label}</span>
              {item.hasSubmenu && (
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isExpanded ? "-rotate-180 text-blue-600" : "text-gray-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>

            {/* 하위 메뉴 리스트 */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
              }`}
            >
              <div className="pl-2 ml-4 space-y-1 border-l-2 border-gray-100">
                {item.submenu?.map((subItem) => {
                  const isSubActive = activeMenu === subItem.id;

                  return (
                    <button
                      key={subItem.id}
                      onClick={() => onMenuClick(subItem.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                        isSubActive
                          ? "bg-blue-100 text-blue-700 font-bold shadow-sm"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {subItem.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      </aside>
    </div>
  );
}
