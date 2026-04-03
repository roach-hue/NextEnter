# NextEnter - WebSocket 실시간 알림 시스템

## 📋 주요 기능

### 기업용 알림

- ✅ 새로운 지원자 발생 시 알림
- ⏰ 공고 마감 임박 알림 (D-3)
- 💬 면접자의 면접 동의/거절 알림

### 개인용 알림

- 받은 포지션 제안 알림
- 📋 받은 기업의 요청 알림
- 📊 지원 상태 변경 알림 (서류합격, 면접요청 등)

## 🚀 설치 및 실행

### 프론트엔드 설정

```bash
cd NextEnterFront
npm install
npm run dev
```

### 백엔드 설정

백엔드는 이미 WebSocket과 알림 시스템이 구성되어 있습니다.

```bash
cd NextEnterBack
./gradlew build
./gradlew bootRun
```

## 📁 주요 파일 구조

### 프론트엔드

```
src/
├── hooks/
│   └── useWebSocket.ts              # WebSocket 연결 관리 훅
├── components/
│   └── NotificationPopup.tsx        # 알림 팝업 컴포넌트
├── features-company/
│   ├── components/
│   │   └── CompanyHeader.tsx        # 기업 헤더 (알림 아이콘 포함)
│   └── company-mypage/
│       └── components/
│           └── NotificationSettings.tsx  # 기업 알림 설정
└── features/
    └── mypage/
        └── components/
            └── IndividualNotificationSettings.tsx  # 개인 알림 설정
```

### 백엔드

```
src/main/java/org/zerock/nextenter/
├── config/
│   └── WebSocketConfig.java        # WebSocket 설정
├── notification/
│   ├── Notification.java           # 알림 엔티티
│   ├── NotificationService.java    # 알림 비즈니스 로직
│   ├── NotificationController.java # 알림 REST API
│   ├── NotificationSettings.java   # 알림 설정 엔티티
│   └── NotificationSettingsService.java
└── apply/
    └── service/
        └── ApplyService.java        # 지원 서비스 (알림 트리거)
```

## 🔧 기술 스택

### 프론트엔드

- React + TypeScript
- @stomp/stompjs (WebSocket 클라이언트)
- sockjs-client (SockJS 폴백)
- date-fns (날짜 포맷팅)
- Tailwind CSS

### 백엔드

- Spring Boot 3.5.6
- Spring WebSocket
- STOMP
- JPA/Hibernate
- MySQL

## 🎯 사용 방법

### 1. 알림 수신

- 로그인하면 자동으로 WebSocket 연결이 설정됩니다.
- 헤더의 알림 아이콘을 클릭하면 알림 목록을 확인할 수 있습니다.
- 읽지 않은 알림은 빨간색 배지로 표시됩니다.

### 2. 알림 설정

- **기업**: 마이페이지 > 알림 설정
- **개인**: 마이페이지 > 알림 설정
- 각 알림 유형별로 on/off 가능

### 3. 알림 읽음 처리

- 알림 클릭 시 자동으로 읽음 처리
- "모두 읽음" 버튼으로 전체 읽음 처리

## 🔔 알림 트리거 시나리오

### 시나리오 1: 개인이 공고에 지원

1. 개인이 공고에 지원 버튼 클릭
2. 백엔드에서 `ApplyService.createApply()` 호출
3. `NotificationService.notifyNewApplication()` 호출
4. WebSocket을 통해 기업에 실시간 알림 전송
5. 기업 헤더의 알림 아이콘에 빨간 배지 표시

### 시나리오 2: 기업이 지원 상태 변경

1. 기업이 지원자 상태를 "서류합격"으로 변경
2. 백엔드에서 `ApplyService.updateApplyStatus()` 호출
3. `NotificationService.notifyApplicationStatus()` 호출
4. WebSocket을 통해 지원자에게 실시간 알림 전송
5. 개인 헤더의 알림 아이콘에 빨간 배지 표시

## 🐛 트러블슈팅

### WebSocket 연결 실패

- 백엔드가 실행 중인지 확인 (http://localhost:8080)
- CORS 설정 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 알림이 수신되지 않음

1. WebSocket 연결 상태 확인
2. 알림 설정이 활성화되어 있는지 확인
3. 백엔드 로그에서 알림 전송 로그 확인

### 빨간 배지가 사라지지 않음

- 알림 팝업을 열어서 알림을 클릭하여 읽음 처리
- "모두 읽음" 버튼 사용

## 📝 개발 노트

### WebSocket 엔드포인트

- 연결: `ws://localhost:8080/ws/notifications`
- 구독 토픽:
  - 기업: `/topic/notifications/company/{companyId}`
  - 개인: `/topic/notifications/individual/{userId}`

### API 엔드포인트

```
GET    /api/notifications/{userType}/{userId}              # 알림 목록
GET    /api/notifications/{userType}/{userId}/unread       # 읽지 않은 알림
GET    /api/notifications/{userType}/{userId}/unread-count # 읽지 않은 개수
PATCH  /api/notifications/{notificationId}/read           # 읽음 처리
PATCH  /api/notifications/{userType}/{userId}/read-all    # 모두 읽음
DELETE /api/notifications/{notificationId}                # 알림 삭제
```

## 🎨 UI/UX 특징

1. **실시간 알림 배지**: 읽지 않은 알림 개수를 실시간으로 표시
2. **알림 팝업**: 최신 알림을 보기 쉽게 표시
3. **아이콘 기반 알림 유형**: 각 알림 유형별 이모지 아이콘
4. **상대적 시간 표시**: "5분 전", "3시간 전" 등 읽기 쉬운 시간 표시
5. **원클릭 읽음 처리**: 알림 클릭 시 자동 읽음 처리

## 📄 라이선스

MIT License
