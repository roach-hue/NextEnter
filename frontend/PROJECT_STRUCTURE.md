# NextEnter - 프로젝트 구조 가이드

## 📁 새로운 디렉토리 구조

프로젝트가 기능별로 정리되었습니다!

```
NextEnterFront/
├── src/
│   ├── features/              # 기능별로 구분된 페이지들
│   │   ├── home/              # 메인 홈 페이지
│   │   │   ├── HomePage.tsx
│   │   │   └── components/
│   │   │       ├── Sidebar.tsx
│   │   │       ├── JobCard.tsx
│   │   │       └── JobImageCard.tsx
│   │   │
│   │   ├── mypage/            # 마이페이지
│   │   │   └── MyPage.tsx
│   │   │
│   │   └── credit/            # 크레딧 페이지
│   │       ├── CreditPage.tsx
│   │       └── components/
│   │           └── Sidebar2.tsx
│   │
│   ├── components/            # 공통 컴포넌트
│   │   ├── Header.tsx
│   │   └── Navigation.tsx
│   │
│   ├── App.tsx                # 메인 앱
│   ├── main.tsx               # 엔트리 포인트
│   └── index.css              # 글로벌 스타일
│
├── public/
└── package.json
```

## 🗂️ 디렉토리 설명

### `features/` - 페이지별 기능 모음
각 페이지와 해당 페이지에서만 사용하는 컴포넌트를 한곳에 모았습니다.

#### `features/home/` - 메인 홈 페이지
- **HomePage.tsx**: 메인 채용 정보 페이지
- **components/**: 홈 페이지 전용 컴포넌트
  - `Sidebar.tsx`: 왼쪽 사이드바 (오늘의 한줄 꿀팁)
  - `JobCard.tsx`: 채용 공고 카드
  - `JobImageCard.tsx`: 이미지형 공고 카드

#### `features/mypage/` - 마이페이지
- **MyPage.tsx**: 사용자 마이페이지 (이력서, 지원 현황)

#### `features/credit/` - 크레딧 페이지
- **CreditPage.tsx**: 크레딧 관리 페이지
- **components/**: 크레딧 페이지 전용 컴포넌트
  - `Sidebar2.tsx`: 크레딧 페이지 전용 사이드바

### `components/` - 공통 컴포넌트
모든 페이지에서 공통으로 사용하는 컴포넌트입니다.

- **Header.tsx**: 상단 헤더 (로고, 검색, 버튼)
- **Navigation.tsx**: 네비게이션 바 (탭 메뉴)

## 🎯 장점

### 1. **명확한 구조**
- 각 페이지와 관련 파일들이 한 폴더에 모여있어 찾기 쉽습니다
- 페이지별로 독립적인 개발이 가능합니다

### 2. **유지보수 용이**
- 특정 페이지를 수정할 때 해당 features 폴더만 확인하면 됩니다
- 컴포넌트 재사용이 명확합니다

### 3. **확장성**
- 새로운 페이지를 추가할 때 `features/` 아래에 새 폴더를 만들면 됩니다
- 각 페이지가 독립적이어서 충돌이 적습니다

## 🚀 사용 방법

### 새 페이지 추가하기
1. `features/` 아래에 새 폴더 생성
2. 페이지 컴포넌트 작성
3. 필요한 컴포넌트를 `components/` 폴더에 추가
4. `App.tsx`에 라우팅 추가

예시:
```typescript
// features/resume/ResumePage.tsx
export default function ResumePage() {
  return <div>이력서 페이지</div>;
}

// App.tsx에서
import ResumePage from './features/resume/ResumePage';
```

### 공통 컴포넌트 추가하기
여러 페이지에서 사용할 컴포넌트는 `src/components/`에 추가합니다.

## 📝 기억할 점

- **features/**: 특정 페이지 전용
- **components/**: 여러 페이지에서 공통 사용
- 각 페이지의 컴포넌트는 해당 페이지 폴더 안에 보관

## 🔧 개발 서버 실행

```bash
npm run dev
```

모든 import 경로가 자동으로 업데이트되어 있어 바로 실행됩니다!
