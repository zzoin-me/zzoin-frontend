import type { QueryClient } from "@tanstack/react-query";
import type { NotificationItem } from "@/api/notification";

type NotificationTarget = Pick<NotificationItem, "type" | "targetUrl">;

const COMMUNITY_NOTIFICATION_TYPES = new Set(["POST_COMMENT", "COMMENT_REPLY"]);

function getCommunityPostId(notification: NotificationTarget): number | null {
  if (!COMMUNITY_NOTIFICATION_TYPES.has(notification.type) || !notification.targetUrl) {
    return null;
  }

  const path = notification.targetUrl.split(/[?#]/, 1)[0];
  const match = /^\/community\/(\d+)\/?$/.exec(path);
  if (!match) return null;

  const postId = Number(match[1]);
  return Number.isSafeInteger(postId) && postId > 0 ? postId : null;
}

export async function invalidateNotificationTargetQueries(
  queryClient: QueryClient,
  notification: NotificationTarget,
): Promise<void> {
  const postId = getCommunityPostId(notification);
  if (postId === null) return;

  await Promise.allSettled([
    queryClient.invalidateQueries({ queryKey: ["comments", postId] }),
    queryClient.invalidateQueries({ queryKey: ["post", postId] }),
    queryClient.invalidateQueries({ queryKey: ["posts"] }),
  ]);
}
