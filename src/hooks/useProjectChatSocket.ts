import { useEffect, useRef, useState } from "react";
import { getProjectChatWebSocketUrl } from "@/api/chat";
import type { ChatMessage } from "@/types";

type ConnectionState = "connecting" | "connected" | "disconnected";

interface SocketPayload {
  type: "CONNECTED" | "MESSAGE" | "ERROR";
  message?: ChatMessage | string;
}

export function useProjectChatSocket(
  projectId: number,
  onMessage: (message: ChatMessage) => void,
  enabled = true,
) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [socketError, setSocketError] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let retryTimer: number | undefined;
    let retryCount = 0;
    let disposed = false;

    const connect = () => {
      if (!enabled) {
        setConnectionState("disconnected");
        return;
      }
      const url = getProjectChatWebSocketUrl(projectId);
      if (!url || disposed) {
        setConnectionState("disconnected");
        return;
      }

      setConnectionState("connecting");
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        retryCount = 0;
        setSocketError("");
        setConnectionState("connected");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as SocketPayload;
          if (payload.type === "MESSAGE" && typeof payload.message === "object") {
            onMessageRef.current(payload.message);
          } else if (payload.type === "ERROR") {
            setSocketError(
              typeof payload.message === "string"
                ? payload.message
                : "메시지를 처리하지 못했습니다.",
            );
          }
        } catch {
          setSocketError("실시간 메시지를 해석하지 못했습니다.");
        }
      };

      socket.onclose = () => {
        if (disposed) return;
        setConnectionState("disconnected");
        const delay = Math.min(1000 * 2 ** retryCount, 10_000);
        retryCount += 1;
        retryTimer = window.setTimeout(connect, delay);
      };

      socket.onerror = () => {
        setSocketError("실시간 연결이 불안정합니다. 자동으로 다시 연결할게요.");
      };
    };

    connect();
    return () => {
      disposed = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      socketRef.current?.close(1000, "page closed");
      socketRef.current = null;
    };
  }, [enabled, projectId]);

  return { connectionState, socketError };
}
