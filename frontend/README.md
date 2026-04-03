# NextEnter Frontend (참고용)

> **이 디렉토리는 팀 프로젝트의 프론트엔드 코드를 참고용으로 포함한 것입니다.**
> 본인의 주 담당 파트는 [python/](../python/) (AI 엔진 서버)입니다.

## 소개

React + TypeScript 기반의 프론트엔드 애플리케이션입니다.
구직자/기업 양측의 UI를 제공하며, AI 매칭 결과 시각화 및 결제 플로우를 포함합니다.

## 사용 기술

- React 19, TypeScript, Vite
- Zustand (상태 관리)
- React Router v7
- Axios, WebSocket (STOMP)

## 프로젝트 구조

```
frontend/src/
├── api/              # API 클라이언트
├── components/       # 공통 컴포넌트
├── features/         # 구직자 기능
├── features-company/ # 기업 기능
├── hooks/            # 커스텀 훅
├── layouts/          # 레이아웃
├── pages/            # 페이지
├── services/         # 서비스 레이어
├── stores/           # Zustand 스토어
└── utils/            # 유틸리티
```
