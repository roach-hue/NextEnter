// 드롭다운 메뉴 타입 정의
export interface MenuItem {
  id: string;
  label: string;
}

export interface MenuCategory {
  id: string;
  title: string;
  items: MenuItem[];
}
