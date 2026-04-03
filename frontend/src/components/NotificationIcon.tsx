import React, { useState, useEffect, useRef } from 'react';
import { getUnreadCount, getUnreadNotifications, markAsRead, markAllAsRead, Notification as NotificationType } from '../api/notification';
import { useNotificationWebSocket } from '../hooks/useNotificationWebSocket';

interface NotificationIconProps {
  userId: number;
  userType: 'company' | 'individual';
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ userId, userType }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // 초기 데이터 로드
  useEffect(() => {
    loadUnreadCount();
  }, [userId, userType]);

  // 웹소켓 연결
  useNotificationWebSocket({
    userId,
    userType,
    onNotificationReceived: (notification) => {
      console.log('새 알림 수신:', notification);
      setUnreadCount(prev => prev + 1);
      setNotifications(prev => [notification, ...prev]);
      
      // 브라우저 알림 표시 (권한이 있는 경우)
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.content,
          icon: '/logo.png' // 로고 경로는 실제 경로로 수정 필요
        });
      }
    }
  });

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount(userType, userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error);
    }
  };

  const loadUnreadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUnreadNotifications(userType, userId);
      setNotifications(data);
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIconClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      loadUnreadNotifications();
    }
  };

  const handleNotificationClick = async (notification: NotificationType) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
      }
    }
    
    // 관련 페이지로 이동하는 로직 추가 가능
    if (notification.relatedType && notification.relatedId) {
      // 예: 지원서 ID로 이동, 면접 ID로 이동 등
      console.log(`Navigate to ${notification.relatedType}: ${notification.relatedId}`);
    }
    
    setShowDropdown(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(userType, userId);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
  };

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 알림 아이콘 */}
      <button
        onClick={handleIconClick}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="알림"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* 읽지 않은 알림 개수 배지 */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 알림 드롭다운 */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* 헤더 */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">알림</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                모두 읽음
              </button>
            )}
          </div>

          {/* 알림 목록 */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p>새로운 알림이 없습니다</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {!notification.isRead && (
                      <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 푸터 */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <a
                href={`/${userType}/notifications`}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                모든 알림 보기
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
