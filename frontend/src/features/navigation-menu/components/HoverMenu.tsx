import { navigationMenuData } from "../data/menuData";

interface HoverMenuProps {
  tabId: string;
  onSubMenuClick?: (tabId: string, subId: string) => void;
  onClose?: () => void; // ✅ 호버 닫기 함수 추가
}

export default function HoverMenu({ tabId, onSubMenuClick, onClose }: HoverMenuProps) {
  const menuData = navigationMenuData[tabId as keyof typeof navigationMenuData];

  if (!menuData || menuData.items.length === 0) return null;

  return (
    <div className="absolute left-0 -mt-2 top-full z-[60]">
      <div className="bg-white border border-gray-200 shadow-lg py-2 min-w-[200px]">
        <ul>
          {menuData.items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  if (onClose) onClose(); // ✅ 클릭 시 호버 먼저 닫기
                  if (onSubMenuClick) onSubMenuClick(tabId, item.id);
                }}
                className="w-full px-4 py-2 text-sm text-left text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
