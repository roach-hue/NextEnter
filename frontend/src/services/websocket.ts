import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface NotificationMessage {
  id: number;
  userId: number;
  userType: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  relatedId: number | null;
  relatedType: string | null;
  createdAt: string;
}

const WS_BASE_URL = 'http://localhost:5173/ws/notifications';

class WebSocketService {
  private client: Client | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private closingIntentionally: boolean = false;

  /**
   * 웹소켓 연결
   */
  connect(userId: number, userType: 'individual' | 'company', onMessageReceived: (message: NotificationMessage) => void): void {
    if (this.isConnected) {
      console.log('⚠️ 이미 웹소켓에 연결되어 있습니다. 연결 상태:', this.isConnected);
      return;
    }
    
    if (!userId) {
      console.error('❌ userId가 없어서 웹소켓 연결을 할 수 없습니다.');
      return;
    }

    this.closingIntentionally = false;
    console.log(`🔌 웹소켓 연결 시도 중... userId: ${userId}, userType: ${userType}`);
    console.log(`🌐 연결 URL: ${WS_BASE_URL}`);

    this.client = new Client({
      webSocketFactory: () => {
        console.log('🔧 SockJS 인스턴스 생성 중...');
        return new SockJS(WS_BASE_URL) as any;
      },
      debug: (str) => {
        console.log('📝 STOMP Debug:', str);
      },
      reconnectDelay: 0, // ✅ 재연결 비활성화
      heartbeatIncoming: 0, // ✅ 하트비트 비활성화
      heartbeatOutgoing: 0, // ✅ 하트비트 비활성화
      onConnect: () => {
        console.log('✅✅✅ 웹소켓 연결 성공! ✅✅✅');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // 알림 구독
        const topic = `/topic/notifications/${userType}/${userId}`;
        console.log(`📡 구독 시작: ${topic}`);

        const subscription = this.client?.subscribe(topic, (message) => {
          try {
            console.log('📨 메시지 수신! message.body:', message.body);
            const notification: NotificationMessage = JSON.parse(message.body);
            console.log('🔔 새 알림 수신:', notification);
            onMessageReceived(notification);
          } catch (error) {
            console.error('❌ 알림 파싱 오류:', error);
          }
        });
        
        if (subscription) {
          console.log('✅ 구독 성공! subscription id:', subscription.id);
        } else {
          console.error('❌ 구독 실패!');
        }
      },
      onStompError: (frame) => {
        if (this.closingIntentionally) return;
        console.error('❌ STOMP 오류 발생:', frame.headers, frame.body);
        this.isConnected = false;
        this.handleReconnect(userId, userType, onMessageReceived);
      },
      onWebSocketClose: () => {
        if (this.closingIntentionally) {
          this.closingIntentionally = false;
          return;
        }
        console.log('⚠️ 웹소켓 연결 종료');
        this.isConnected = false;
        this.handleReconnect(userId, userType, onMessageReceived);
      },
      onWebSocketError: (event) => {
        console.error('❌ 웹소켓 오류 발생:', event);
        this.isConnected = false;
      }
    });

    console.log('🚀 STOMP 클라이언트 activate 실행...');
    this.client.activate();
  }

  /**
   * 재연결 처리 (의도적 종료가 아닐 때만 호출됨)
   */
  private handleReconnect(userId: number, userType: 'individual' | 'company', onMessageReceived: (message: NotificationMessage) => void): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
      setTimeout(() => {
        this.connect(userId, userType, onMessageReceived);
      }, this.reconnectDelay);
    } else {
      console.error('❌ 최대 재연결 시도 횟수 초과');
    }
  }

  /**
   * 웹소켓 연결 해제
   */
  disconnect(): void {
    if (this.client && this.isConnected) {
      this.closingIntentionally = true;
      console.log('🔌 웹소켓 연결 해제');
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * 연결 상태 확인
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// 싱글톤 인스턴스
export const websocketService = new WebSocketService();
