# NextEnter - AI 기반 매칭 구인구직 플랫폼

> **팀 프로젝트 (2026.01 - 2026.02)**
> 본인 담당: AI 매칭 엔진 서버 (python/)

## 소개

구직자의 이력서를 AI로 분석하여 기업 채용공고와 자동 매칭하는 구인구직 플랫폼입니다.
AI 매칭 점수 산출, 모의면접, 이력서 파싱 등의 기능을 제공합니다.

## 프로젝트 구조

| 디렉토리 | 설명 | 기술 스택 |
|---|---|---|
| [python/](./python) | AI 매칭 엔진 서버 (본인 담당) | FastAPI, Gemini AI, Sentence Transformers |
| [backend/](./backend) | 백엔드 API 서버 (참고용) | Spring Boot 3.5, JPA, MySQL |
| [frontend/](./frontend) | 프론트엔드 (참고용) | React 19, TypeScript, Vite, Zustand |

## 주요 기능

- **AI 이력서 매칭** : 이력서-채용공고 간 AI 기반 적합도 점수 산출
- **AI 모의면접** : 직무/이력서 기반 맞춤형 면접 질문 생성 및 답변 평가
- **이력서 파싱** : PDF, DOCX 파일 자동 파싱
- **채용공고 관리** : 기업 회원의 공고 등록/관리
- **결제 시스템** : 크레딧 기반 매칭 서비스 결제
- **실시간 알림** : WebSocket 기반 알림 시스템
