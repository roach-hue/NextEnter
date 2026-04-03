# NEXT ENTER - AI 기반 매칭 구인구직 플랫폼

> **팀 프로젝트 (2026.01 - 2026.02)**

**사용 기술:** React, TypeScript, Vite, Redux Toolkit, RESTful API

## 소개

구직자의 이력서를 AI로 분석하여 기업 채용공고와 자동 매칭하는 구인구직 플랫폼입니다.

## 담당 내용

### Vite 기반의 고성능 프론트엔드 개발 환경 구축 및 최적화
- Native ESM 기반의 온디맨드 서빙 방식을 활용
- 대규모 UI 수정 시에도 지연 없는 HMR 환경 구축, 이를 통한 개발 피드백 루프 최적화

### 사용자 경험(UX) 최적화 및 일관된 인터페이스 설계
- 도메인 특성을 고려한 컬러 시스템(Theme) 구축 및 시장 선도 플랫폼의 UI 패턴 벤치마킹을 통한 사용자 익숙함 확보
- 사용자 흐름(Flow)에 최적화된 페이지 구조 및 직관적인 메뉴 내비게이션 설계

### Redux Toolkit(RTK) 기반의 전역 상태 관리 및 데이터 흐름 최적화
- 복잡한 AI 매칭 결과와 사용자 프로필 정보를 Slice 단위로 구조화하여 전역 상태로 관리함으로써 데이터 일관성 확보
- AI 서버 및 결제 API 연동 시 프론트엔드 단에서 발생하는 비동기 상태(Pending, Fulfilled, Rejected)를 체계적으로 제어하여 안정적인 UI 제공

## 프로젝트 구조

| 디렉토리 | 설명 | 기술 스택 |
|---|---|---|
| [frontend/](./frontend) | 프론트엔드 | React 19, TypeScript, Vite, Zustand |
| [backend/](./backend) | 백엔드 API 서버 (참고용) | Spring Boot 3.5, JPA, MySQL |
| [python/](./python) | AI 매칭 엔진 서버 (참고용) | FastAPI, Gemini AI, Sentence Transformers |
