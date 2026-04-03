import { companyNavigationMenuData } from "../data/companyMenuData";

interface CompanyDropdownMenuProps {
  isOpen: boolean;
  onMenuClick?: (menuId: string) => void;
}

export default function CompanyDropdownMenu({
  isOpen,
  onMenuClick,
}: CompanyDropdownMenuProps) {
  const categories = Object.values(companyNavigationMenuData);

  return (
    <div
      className={`absolute left-0 right-0 bg-gray-100 border-b border-gray-200 shadow-lg overflow-hidden transition-all duration-300 ease-in-out z-50 ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="py-8 mx-auto max-w-7xl">
        <div className="ml-[35px] mr-16">
          <div className="grid grid-cols-5 gap-2 divide-x divide-gray-300">
            {categories.map((category: any, index: number) => (
              <div
                key={category.id}
                className={`space-y-2 ${index > 0 ? "pl-4" : ""}`}
              >
                <h3 className="text-sm font-bold text-gray-900">
                  {category.title}
                </h3>
                <ul className="space-y-1">
                  {category.items?.map((item: any) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          if (onMenuClick) onMenuClick(item.id);
                        }}
                        className="w-full text-sm text-left text-gray-600 transition hover:text-purple-600"
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
