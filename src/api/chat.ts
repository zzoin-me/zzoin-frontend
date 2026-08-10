import { apiBaseUrl, webSocketBaseUrl } from "@/config";
import { apiFetch, getAccessToken } from "@/api/client";
import type { ChatMessage, ChatMessagesResponse, ChatRoom } from "@/types";

export async function getChatRooms(): Promise<ChatRoom[]> {
  return apiFetch<ChatRoom[]>("/api/projects/chats");
}

export async function getChatMessages(
  projectId: number,
  beforeId?: number,
  size = 50,
): Promise<ChatMessagesResponse> {
  const query = new URLSearchParams({ size: String(size) });
  if (beforeId != null) query.set("beforeId", String(beforeId));
  return apiFetch<ChatMessagesResponse>(
    `/api/projects/${projectId}/chat/messages?${query.toString()}`,
  );
}

export async function sendChatMessage(projectId: number, content: string): Promise<ChatMessage> {
  return apiFetch<ChatMessage>(`/api/projects/${projectId}/chat/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function markChatRead(projectId: number, lastMessageId?: number): Promise<void> {
  await apiFetch<void>(`/api/projects/${projectId}/chat/read`, {
    method: "PATCH",
    body: JSON.stringify({ lastMessageId: lastMessageId ?? null }),
  });
}

export function getProjectChatWebSocketUrl(projectId: number): string | null {
  const token = getAccessToken();
  if (!token) return null;
  const base = webSocketBaseUrl || apiBaseUrl || window.location.origin;
  const url = new URL(base, window.location.origin);
  if (url.protocol === "https:") {
    url.protocol = "wss:";
  } else if (url.protocol === "http:") {
    url.protocol = "ws:";
  }
  url.pathname = `/ws/projects/${projectId}`;
  url.search = new URLSearchParams({ token }).toString();
  return url.toString();
}
