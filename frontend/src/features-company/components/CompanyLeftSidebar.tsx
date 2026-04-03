import { useEffect, useState } from "react";
import { companyNavigationMenuData } from "../navigation-menu/data/companyMenuData";

interface MenuItem {
  id: string;
  label: string;
  hasSubmenu?: boolean;
  submenu?: { id: string; label: string }[];
}

interface CompanyLeftSidebarProps {
  activeMenu: string;
  onMenuClick: (menuId: string) => void;
  menuItems?: MenuItem[];
}

const transformedMenuItems: MenuItem[] = Object.values(companyNavigationMenuData).map(
  (navItem: any) => ({
    id: navItem.id,
    label: navItem.title,
    hasSubmenu: navItem.items && navItem.items.length > 0,
    submenu: navItem.items?.map((sub: any) => ({
      id: sub.id,
      label: sub.label,
    })),
  })
);

export default function CompanyLeftSidebar({
  activeMenu,
  onMenuClick,
  menuItems = transformedMenuItems,
}: CompanyLeftSidebarProps) {
  const [expandedMenuIds, setExpandedMenuIds] = useState<string[]>([]);

  useEffect(() => {
    const parentMenu = menuItems.find(
      (item) =>
        item.id === activeMenu ||
        item.submenu?.some((sub) => sub.id === activeMenu)
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
        : [...prev, menuId]
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
    <div className="sticky top-[145px] w-64 h-fit shrink-0">
      <aside className="p-4 space-y-2 bg-white border-r border-gray-200">
      {menuItems.map((item) => {
        const isExpanded = expandedMenuIds.includes(item.id);

        const isParentActive =
          activeMenu === item.id ||
          item.submenu?.some((sub) => sub.id === activeMenu);

        return (
          <div key={item.id}>
            <button
              onClick={() => handleParentMenuClick(item)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                isParentActive
                  ? "bg-purple-50 text-purple-700 font-bold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{item.label}</span>
              {item.hasSubmenu && (
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isExpanded ? "-rotate-180 text-purple-600" : "text-gray-400"
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
                          ? "bg-purple-100 text-purple-700 font-bold shadow-sm"
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
