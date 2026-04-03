import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import {
  Notification as NotificationData,
  markAsRead,
  markAllAsRead,
  getUnreadNotifications,
  getUnreadCount,
} from "../api/notification";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useNotificationWebSocket } from "../hooks/useNotificationWebSocket";

export default function UserNotificationsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationData | null>(null);

  // 웹소켓 연결하여 실시간 알림 수신
  useNotificationWebSocket({
    userId: user?.userId ?? null,
    userType: "individual",
    onNotificationReceived: (notification) => {
      console.log("새 알림 수신:", notification);
      // 새 알림을 목록 맨 위에 추가
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // 브라우저 알림 표시
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.content,
          icon: "/favicon.ico",
          tag: `notification-${notification.id}`,
        });
      }
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/user/login");
      return;
    }
    loadNotifications();

    // 브라우저 알림 권한 요청
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("알림 권한:", permission);
      });
    }
  }, [isAuthenticated, navigate]);

  const loadNotifications = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 5초 타임아웃 설정
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000),
      );

      const dataPromise = Promise.all([
        getUnreadNotifications("individual", user.userId),
        getUnreadCount("individual", user.userId),
      ]);

      const [unreadList, count] = (await Promise.race([
        dataPromise,
        timeoutPromise,
      ])) as [NotificationData[], number];

      setNotifications(unreadList);
      setUnreadCount(count);
    } catch (error) {
      console.error("알림 로드 실패:", error);
      // 에러 발생 시 빈 배열로 설정 (백엔드 서버가 없어도 UI는 보여줌)
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000),
      );

      await Promise.race([markAsRead(notificationId), timeoutPromise]);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // ✅ Header에 알림 개수 업데이트 이벤트 발생
      window.dispatchEvent(new Event("notification-read"));
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
      // 에러가 나도 UI에서는 제거 (사용자 경험 개선)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // ✅ 에러 시에도 이벤트 발생
      window.dispatchEvent(new Event("notification-read"));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.userId) return;

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000),
      );

      await Promise.race([
        markAllAsRead("individual", user.userId),
        timeoutPromise,
      ]);

      setNotifications([]);
      setUnreadCount(0);

      // ✅ Header에 알림 개수 업데이트 이벤트 발생
      window.dispatchEvent(new Event("notification-read"));
    } catch (error) {
      console.error("모든 알림 읽음 처리 실패:", error);
      // 에러가 나도 UI에서는 제거
      setNotifications([]);
      setUnreadCount(0);

      // ✅ 에러 시에도 이벤트 발생
      window.dispatchEvent(new Event("notification-read"));
    }
  };

  const handleNotificationClick = (notification: NotificationData) => {
    // 상세 모달 표시
    setSelectedNotification(notification);
  };

  const handleCloseModal = () => {
    if (selectedNotification) {
      // 모달을 닫을 때 알림을 읽음 처리
      handleMarkAsRead(selectedNotification.id);
    }
    setSelectedNotification(null);
  };

  const handleGoToRelatedPage = () => {
    if (!selectedNotification) return;

    // 알림을 읽음 처리
    handleMarkAsRead(selectedNotification.id);

    // 알림 타입에 따라 페이지 이동
    switch (selectedNotification.type) {
      case "INTERVIEW_OFFER":
        navigate("/user/offers/interview");
        break;
      case "APPLICATION_STATUS":
        navigate("/user/application-status");
        break;
      case "INTERVIEW_ACCEPTED":
      case "INTERVIEW_REJECTED":
        navigate("/user/offers/interview");
        break;
      default:
        if (selectedNotification.link) {
          navigate(selectedNotification.link);
        }
        break;
    }

    setSelectedNotification(null);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "INTERVIEW_OFFER":
        return "📧";
      case "INTERVIEW_ACCEPTED":
      case "INTERVIEW_REJECTED":
        return "✅";
      case "POSITION_OFFER":
        return "";
      case "APPLICATION_STATUS":
        return "📊";
      default:
        return "🔔";
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case "INTERVIEW_OFFER":
        return "기업의 요청";
      case "INTERVIEW_ACCEPTED":
        return "면접 수락 확인";
      case "INTERVIEW_REJECTED":
        return "면접 거절 확인";
      case "POSITION_OFFER":
        return "포지션 제안";
      case "APPLICATION_STATUS":
        return "지원 상태 변경";
      default:
        return "알림";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">알림</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                읽지 않은 알림{" "}
                <span className="font-semibold text-blue-600">
                  {unreadCount}
                </span>
                개
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                모두 읽음
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <svg
              className="w-24 h-24 mb-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="text-lg font-medium text-gray-500">
              새로운 알림이 없습니다
            </p>
            <p className="text-sm text-gray-400 mt-2">
              알림이 오면 여기에 표시됩니다
            </p>
          </div>
        ) : (
          <div className="bg-white divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="p-6 hover:bg-blue-50 transition group cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <span className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition whitespace-nowrap ml-4"
                      >
                        읽음 표시
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedNotification && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <span className="text-5xl">
                  {getNotificationIcon(selectedNotification.type)}
                </span>
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-white text-xs font-medium mb-3">
                    {getNotificationTypeText(selectedNotification.type)}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedNotification.title}
                  </h2>
                  <p className="text-sm text-blue-100">
                    {formatDistanceToNow(
                      new Date(selectedNotification.createdAt),
                      {
                        addSuffix: true,
                        locale: ko,
                      },
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition flex-shrink-0 ml-4"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 본문 */}
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  메시지 내용
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-500">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
                    {selectedNotification.content}
                  </p>
                </div>
              </div>

              {/* 날짜 정보 */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">
                    {new Date(selectedNotification.createdAt).toLocaleString(
                      "ko-KR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                >
                  닫기
                </button>
                <button
                  onClick={handleGoToRelatedPage}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-200"
                >
                  관련 페이지로 이동
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
