import { apiClient } from './apiClient';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  url?: string | null;
  read_at?: string | null;
  created_at?: string;
  data?: Record<string, any>;
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  unread_count: number;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

function normalizeNotification(notification: any): AppNotification {
  const data = notification?.data || {};

  return {
    id: String(notification?.id || ''),
    type: data.kind || notification?.type || 'notification',
    title: data.title || 'Notification',
    message: data.message || '',
    url: data.url || null,
    read_at: notification?.read_at || null,
    created_at: notification?.created_at || undefined,
    data,
  };
}

export async function markNotificationsAsRead(): Promise<void> {
  await apiClient.post('/notifications/read-all', {});
}

export async function fetchNotifications(perPage = 20): Promise<NotificationListResponse> {
  const response = await apiClient.get<any>(`/notifications?per_page=${perPage}`);
  const notificationsPayload = Array.isArray(response?.notifications) ? response.notifications : [];
  const meta = response?.meta || {};

  return {
    notifications: notificationsPayload.map(normalizeNotification),
    unread_count: Number(response?.unread_count || 0),
    meta: {
      current_page: Number(meta.current_page || 1),
      last_page: Number(meta.last_page || 1),
      per_page: Number(meta.per_page || perPage),
      total: Number(meta.total || notificationsPayload.length),
    },
  };
}
