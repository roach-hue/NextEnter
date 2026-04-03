# NextEnter - 구인구직 플랫폼 프론트엔드

이미지를 기반으로 제작된 NextEnter 웹 애플리케이션입니다.

## 🎯 구현된 기능

### ✅ 완료된 기능들

1. **헤더 영역**
   - NextEnter 로고
   - 검색 기능 (Enter로 검색)
   - 로그인 버튼
   - 회원가입 버튼
   - 기업 서비스 버튼 // 1.21 삭제했음.

2. **네비게이션 메뉴**
   - 채용정보, 이력서, 매칭분석, 면접준비, 마이페이지
   - 탭 클릭 시 활성화 표시

3. **사이드바**
   - "오늘의 한줄 꿀팁" 섹션
   - "AI가 분석해주는 이력서" 버튼

4. **메인 컨텐츠**
   - 추천 공고 카드 (3x1 그리드)
   - 하단 이미지 카드 (4개, 첫 번째 즐겨찾기 표시)
   - 체크박스로 섹션 토글

5. **상호작용**
   - 모든 카드 클릭 가능
   - 콘솔에 로그 출력

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속

### 3. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 📁 프로젝트 구조

```
NextEnterFront/
├── src/
│   ├── components/
│   │   ├── Header.tsx        # 헤더 컴포넌트
│   │   ├── Navigation.tsx    # 네비게이션 바
│   │   ├── Sidebar.tsx       # 좌측 사이드바
│   │   ├── JobCard.tsx       # 공고 카드
│   │   └── JobImageCard.tsx  # 이미지 카드
│   ├── App.tsx               # 메인 앱
│   ├── main.tsx              # 엔트리 포인트
│   └── index.css             # 글로벌 스타일
├── public/                    # 정적 파일
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎨 이미지 추가 방법

### 공고 카드에 이미지 추가

1. **이미지를 `public/images/` 폴더에 추가**

2. **`App.tsx`에서 데이터 수정**

```typescript
const recommendedJobs = [
  {
    id: 1,
    title: "프론트엔드 개발자",
    company: "테크 컴퍼니",
    location: "서울 강남",
    salary: "연봉 4000만원~6000만원",
    image: "/images/job1.jpg", // 이미지 경로 추가
  },
];
```

3. **JobCard 컴포넌트에 전달**

```typescript
<JobCard
  {...job}
  image={job.image}
  onClick={() => handleJobClick(job.id)}
/>
```

### 하단 이미지 카드에 이미지 추가

```typescript
const mustSeeJobs = [
  { id: 1, isFavorite: true, image: "/images/must-see-1.jpg" },
  { id: 2, isFavorite: false, image: "/images/must-see-2.jpg" },
];
```

## 🛠️ 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Lucide React** - 아이콘
- **Zustand** - 상태 관리 (필요 시)

## 📝 다음 단계

- [ ] 라우팅 추가 (React Router)
- [ ] API 연동
- [ ] 로그인/회원가입 기능
- [ ] 반응형 디자인 개선
- [ ] 공고 상세 페이지
- [ ] 이미지 업로드 기능

## 💡 개발 팁

### 버튼에 기능 추가

```typescript
// Header.tsx
<button
  onClick={() => {
    // 로그인 페이지로 이동
    window.location.href = '/login';
  }}
>
  로그인
</button>
```

### 공고 클릭 시 상세 페이지로 이동

```typescript
const handleJobClick = (id: number) => {
  window.location.href = `/jobs/${id}`;
};
```

## 🤝 기여

문의사항이나 개선 제안이 있으시면 언제든지 연락주세요!

## 📄 라이센스

MIT License
