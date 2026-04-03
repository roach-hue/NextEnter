// ✅ [1] 타입 import 대신, 우리가 만든 데이터 파일을 import 합니다.
import { navigationMenuData } from "../data/menuData";

interface DropdownMenuProps {
  isOpen: boolean;
  // ✅ [2] 클릭하면 페이지 이동을 해야 하니까 클릭 함수도 받아옵니다. (선택사항)
  onMenuClick?: (menuId: string) => void;
}

export default function DropdownMenu({
  isOpen,
  onMenuClick,
}: DropdownMenuProps) {
  // ✅ [3] 기존의 긴 const categories = [...] 배열을 지우고,
  // menuData 객체를 배열로 변환해서 사용합니다. (이 한 줄로 해결!)
  const categories = Object.values(navigationMenuData);

  return (
    <div
      className={`absolute left-0 right-0 bg-gray-100 border-b border-gray-200 shadow-lg overflow-hidden transition-all duration-300 ease-in-out z-50 ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="py-8 mx-auto max-w-7xl">
        <div className="ml-[35px] mr-16">
          {/* 그리드 칸 수를 데이터 개수에 맞춰줍니다 */}
          <div className="grid grid-cols-7 gap-2 divide-x divide-gray-300">
            {categories.map((category: any, index: number) => (
              <div
                key={category.id}
                className={`space-y-2 ${index > 0 ? "pl-4" : ""}`}
              >
                <h3 className="text-sm font-bold text-gray-900">
                  {category.title}
                </h3>
                <ul className="space-y-1">
                  {/* items가 있을 때만 반복문 실행 */}
                  {category.items?.map((item: any) => (
                    <li key={item.id}>
                      <button
                        // 클릭 시 부모에게 알림 (이동 기능 연결용)
                        onClick={() => {
                          if (onMenuClick) onMenuClick(item.id);
                        }}
                        className="w-full text-sm text-left text-gray-600 transition hover:text-blue-600"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
