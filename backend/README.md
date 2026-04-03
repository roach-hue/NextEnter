# NextEnter Backend (참고용)

> **이 디렉토리는 팀 프로젝트의 백엔드 코드를 참고용으로 포함한 것입니다.**
> 본인의 주 담당 파트는 [python/](../python/) (AI 엔진 서버)입니다.

## 소개

Spring Boot 기반의 백엔드 API 서버입니다.
사용자 인증, 채용공고 관리, 결제, 알림 등 플랫폼의 핵심 비즈니스 로직을 담당합니다.

## 사용 기술

- Java 21, Spring Boot 3.5
- Spring Security, JWT
- JPA / Hibernate
- MySQL

## 주요 도메인

| 도메인 | 설명 |
|---|---|
| `resume` | 이력서 관리 |
| `job` | 채용공고 |
| `matching` | AI 매칭 결과 |
| `payment` | 결제 (크레딧) |
| `interview` | 면접 제안 |
| `notification` | 알림 |
| `company` | 기업 관리 |
| `advertisement` | 광고 |
