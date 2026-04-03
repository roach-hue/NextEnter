# 마이페이지 개선 (사람인 벤치마킹)

## 📋 개요
사람인(Saramin) 마이페이지를 벤치마킹하여 NextEnter 프로젝트의 마이페이지를 대폭 개선했습니다.

## 🎯 주요 개선사항

### 1. 활동 통계 대시보드 추가
- **지원 완료**: 사용자가 지원한 공고 수
- **읽은 공고**: 조회한 공고 수 (추후 구현 예정)
- **제안받은 공고**: 기업으로부터 받은 면접 제안 수
- **스크랩**: 북마크한 공고 수
- **문의내역**: 문의 건수 (추후 구현 예정)

각 통계는 실시간으로 API를 통해 불러와 표시됩니다.

### 2. 구직/매칭 섹션
- 주요 기능들을 한눈에 볼 수 있도록 카드 형태로 배치
- 입사 지원 현황, 모의 면접, 이력서 열람, AI 맞춤 공고로 빠른 이동 가능
- 필터 태그 추가 (구분 비활성화, 희망 산업, 새로운 제안)

### 3. 추천 공고 섹션 ("이런 상품 어떄요?")
- 활성화된 공고 중 상위 3개를 추천 형태로 표시
- 썸네일 이미지, 회사명, 직무, 위치 등 핵심 정보 표시
- 조회수와 북마크 수 표시

### 4. AI 추천 교육/강의 섹션
- 교육 관련 공고를 별도로 표시
- 급여 정보 강조 표시
- 썸네일 이미지와 함께 시각적으로 표현

### 5. 자동 완성 쓰기 관련 섹션
- AI 기반 이력서 자동 생성 기능 안내
- 행동 유도 버튼 (등록하기, 다음에 하기)
- 최근 본 공고를 리스트 형태로 표시
- 각 공고별 상세 정보 (마감일, 조회수 등)

### 6. 최근 확인한 공고와 유사한 공고
- 2열 그리드 레이아웃으로 표시
- 썸네일과 함께 공고 정보 표시
- 유사한 공고 추천 기능

### 7. 내 이력서 섹션 개선
- 이력서 목록을 더 깔끔하게 정리
- 수정/공개 버튼 추가
- 이력서가 없을 때 안내 메시지와 작성 버튼 표시

## 🔧 기술적 개선사항

### API 통합
```typescript
// 지원 내역 조회
const appliesData = await getMyApplies(user.userId);

// 북마크 조회
const bookmarksData = await getBookmarkedJobs(user.userId, 0, 10);

// 추천 공고 조회
const jobsData = await getJobPostings({ page: 0, size: 6, status: "ACTIVE" });
```

### 상태 관리
```typescript
interface ActivityStats {
  appliedJobs: number;      // 지원한 공고 수
  viewedJobs: number;       // 조회한 공고 수
  receivedOffers: number;   // 받은 제안 수
  bookmarkedJobs: number;   // 스크랩한 공고 수
  inquiries: number;        // 문의 건수
}
```

### 반응형 디자인
- Tailwind CSS의 그리드 시스템 활용
- 모바일, 태블릿, 데스크톱 대응
- Hover 효과와 Transition 추가

## 📁 파일 구조
```
src/features/mypage/
├── MyPage.tsx              # 기존 마이페이지
├── ImprovedMyPage.tsx      # 개선된 마이페이지 ✨ NEW
├── components/
│   ├── MyPageSidebar.tsx
│   └── ...
└── README_IMPROVEMENTS.md  # 이 파일
```

## 🚀 사용 방법

### 1. 기존 라우팅 수정
기존 MyPage.tsx를 ImprovedMyPage.tsx로 교체하거나, 라우팅 파일에서 import를 변경하세요.

```typescript
// Before
import MyPage from "./features/mypage/MyPage";

// After
import MyPage from "./features/mypage/ImprovedMyPage";
```

### 2. 필요한 API 확인
다음 API들이 정상적으로 동작해야 합니다:
- `getMyApplies()` - 지원 내역 조회
- `getBookmarkedJobs()` - 북마크 조회
- `getJobPostings()` - 공고 목록 조회

### 3. 스타일링 확인
Tailwind CSS가 프로젝트에 설정되어 있는지 확인하세요.

## 📊 데이터 흐름

```
User Login
    ↓
Load Profile (getUserProfile)
    ↓
Load Activity Data
    ├─→ Get Applies (getMyApplies)
    ├─→ Get Bookmarks (getBookmarkedJobs)
    ├─→ Get Recommended Jobs (getJobPostings)
    └─→ Get Recent Jobs (getJobPostings)
    ↓
Update Statistics
    ↓
Render UI
```

## 🎨 UI/UX 개선사항

1. **시각적 계층 구조**
   - 중요한 정보는 상단에 배치
   - 카드 형태로 정보 그룹화
   - 여백과 간격을 충분히 활용

2. **인터랙션 개선**
   - 모든 클릭 가능한 요소에 hover 효과 추가
   - 로딩 상태와 에러 상태 표시
   - 부드러운 transition 효과

3. **정보 표시 개선**
   - 아이콘과 이모지로 시각적 구분
   - 숫자는 큰 폰트로 강조
   - 라벨과 값을 명확히 구분

4. **네비게이션 개선**
   - "더보기" 링크로 상세 페이지 이동
   - 클릭 가능한 모든 요소 표시
   - 적절한 페이지 라우팅

## ⚠️ 주의사항

1. **API 의존성**: 모든 API가 정상적으로 동작해야 합니다.
2. **권한 관리**: 사용자 ID가 필요한 모든 API 호출에 userId 전달
3. **에러 처리**: try-catch로 에러를 잡아 사용자에게 적절한 메시지 표시
4. **성능**: 여러 API를 동시에 호출하므로 로딩 시간 고려

## 🔮 향후 개선 계획

1. **읽은 공고 추적**: 사용자가 조회한 공고 이력 저장 및 표시
2. **문의내역 기능**: 사용자 문의 관리 기능 추가
3. **개인화 추천**: AI 기반 개인화된 공고 추천
4. **실시간 알림**: 새로운 제안이나 매칭 알림
5. **차트/그래프**: 지원 현황을 시각화
6. **필터링 기능**: 공고를 다양한 조건으로 필터링

## 📝 변경 이력

- **2025-01-29**: 초기 버전 생성
  - 사람인 페이지 벤치마킹
  - 활동 통계 대시보드 추가
  - 추천 공고 섹션 추가
  - UI/UX 대폭 개선

## 💡 참고 자료

- [사람인 마이페이지](https://www.saramin.co.kr/zf_user/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- React Router 문서
