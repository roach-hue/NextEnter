import axios from './axios';

export interface Notification {
  id: number;
  userId: number;
  userType: string;
  type: string;
  typeDescription: string;
  title: string;
  content: string;
  isRead: boolean;
  relatedId: number | null;
  relatedType: string | null;
  createdAt: string;
  link?: string;
}

export interface NotificationSettings {
  id: number;
  userId: number;
  userType: string;
  // 기업용 알림 설정
  newApplicationNotification: boolean;
  deadlineNotification: boolean;
  interviewResponseNotification: boolean;
  // 개인용 알림 설정
  positionOfferNotification: boolean;
  interviewOfferNotification: boolean;
  applicationStatusNotification: boolean;
}

// 알림 목록 조회
export const getNotifications = async (userType: 'company' | 'individual', userId: number): Promise<Notification[]> => {
  const response = await axios.get(`/api/notifications/${userType}/${userId}`);
  return response.data;
};

// 읽지 않은 알림 개수 조회
export const getUnreadCount = async (userType: 'company' | 'individual', userId: number): Promise<number> => {
  const response = await axios.get(`/api/notifications/${userType}/${userId}/unread-count`);
  return response.data.unreadCount;
};

// 읽지 않은 알림 목록 조회
export const getUnreadNotifications = async (userType: 'company' | 'individual', userId: number): Promise<Notification[]> => {
  const response = await axios.get(`/api/notifications/${userType}/${userId}/unread`);
  return response.data;
};

// 알림 읽음 처리
export const markAsRead = async (notificationId: number): Promise<void> => {
  await axios.patch(`/api/notifications/${notificationId}/read`);
};

// 모든 알림 읽음 처리
export const markAllAsRead = async (userType: 'company' | 'individual', userId: number): Promise<void> => {
  await axios.patch(`/api/notifications/${userType}/${userId}/read-all`);
};

// 알림 삭제
export const deleteNotification = async (notificationId: number): Promise<void> => {
  await axios.delete(`/api/notifications/${notificationId}`);
};

// 알림 설정 조회
export const getNotificationSettings = async (userType: 'company' | 'individual', userId: number): Promise<NotificationSettings> => {
  const response = await axios.get(`/api/notification-settings/${userType}/${userId}`);
  return response.data;
};

// 알림 설정 업데이트
export const updateNotificationSettings = async (
  userType: 'company' | 'individual',
  userId: number,
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> => {
  const response = await axios.put(`/api/notification-settings/${userType}/${userId}`, settings);
  return response.data;
};
