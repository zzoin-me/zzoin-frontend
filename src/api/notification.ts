import { apiFetch } from "@/api/client";

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  content: string;
  targetUrl: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationListResponse {
  content: NotificationItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export async function getNotifications(page = 0, size = 20): Promise<NotificationListResponse> {
  return apiFetch<NotificationListResponse>(`/api/notifications?page=${page}&size=${size}`);
}

export async function getUnreadCount(): Promise<number> {
  const data = await apiFetch<{ count: number }>("/api/notifications/unread");
  return data.count;
}

export async function markAsRead(id: number): Promise<void> {
  await apiFetch<void>(`/api/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllAsRead(): Promise<void> {
  await apiFetch<void>("/api/notifications/read-all", { method: "PATCH" });
}

export async function registerDeviceToken(token: string, platform: string): Promise<void> {
  await apiFetch<void>("/api/notifications/device", {
    method: "POST",
    body: JSON.stringify({ token, platform }),
  });
}

export async function unregisterDeviceToken(token: string): Promise<void> {
  await apiFetch<void>("/api/notifications/device", {
    method: "DELETE",
    body: JSON.stringify({ token }),
  });
}
