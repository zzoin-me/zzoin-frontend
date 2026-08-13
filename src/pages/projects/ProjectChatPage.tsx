import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { Loader2, Lock, Send } from "lucide-react";
import { getChatMessages, getChatRooms, markChatRead, sendChatMessage } from "@/api/chat";
import { ApiError } from "@/api/client";
import { LoadingState } from "@/components/common/LoadingState";
import { PageBackButton } from "@/components/common/PageBackButton";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useProjectChatSocket } from "@/hooks/useProjectChatSocket";
import { showSnackbar } from "@/stores/snackbarStore";
import type { ChatMessage, ChatRoom } from "@/types";

function formatMessageTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ProjectChatPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const projectDetailPath = Number.isFinite(projectId) ? `/projects/${projectId}` : "/projects";
  const handleBack = useBackNavigation(projectDetailPath);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);
  const shouldScrollToBottom = useRef(false);

  const appendMessage = useCallback(
    (message: ChatMessage) => {
      shouldScrollToBottom.current = true;
      setMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message],
      );
      void markChatRead(projectId, message.id).catch(() => undefined);
    },
    [projectId],
  );

  const { connectionState, socketError } = useProjectChatSocket(
    projectId,
    appendMessage,
    room !== null,
  );

  useEffect(() => {
    if (!socketError) return;
    showSnackbar({
      dedupeKey: `chat-socket:${socketError}`,
      type: "error",
      message: socketError,
    });
  }, [socketError]);

  useEffect(() => {
    if (!Number.isFinite(projectId)) return;
    Promise.all([getChatRooms(), getChatMessages(projectId)])
      .then(([rooms, history]) => {
        const currentRoom = rooms.find((item) => item.projectId === projectId) ?? null;
        setRoom(currentRoom);
        setMessages(history.messages);
        setHasNext(history.hasNext);
        setNextCursor(history.nextCursor);
        const lastMessage = history.messages.at(-1);
        void markChatRead(projectId, lastMessage?.id).catch(() => undefined);
      })
      .catch((reason) => {
        setError(reason instanceof ApiError ? reason.message : "대화방을 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (loading || initialScrollDone.current) return;
    initialScrollDone.current = true;
    bottomRef.current?.scrollIntoView();
  }, [loading]);

  useEffect(() => {
    if (!initialScrollDone.current) return;
    if (!shouldScrollToBottom.current) return;
    shouldScrollToBottom.current = false;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const loadOlder = async () => {
    if (!nextCursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const history = await getChatMessages(projectId, nextCursor);
      shouldScrollToBottom.current = false;
      setMessages((current) => [
        ...history.messages.filter((item) => !current.some((old) => old.id === item.id)),
        ...current,
      ]);
      setHasNext(history.hasNext);
      setNextCursor(history.nextCursor);
    } catch (reason) {
      showSnackbar({
        type: "error",
        message: reason instanceof ApiError ? reason.message : "이전 메시지를 불러오지 못했습니다.",
      });
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleSend = async () => {
    const normalized = content.trim();
    if (!normalized || sending || room?.projectStatus === "COMPLETED") return;
    setContent("");
    setSending(true);
    try {
      appendMessage(await sendChatMessage(projectId, normalized));
    } catch (reason) {
      setContent(normalized);
      showSnackbar({
        type: "error",
        message: reason instanceof ApiError ? reason.message : "메시지를 보내지 못했습니다.",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingState />;

  if (!room) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-[720px] flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="font-medium text-[16px] text-grey7">
          {error || "입장할 수 없는 대화방입니다."}
        </p>
        <button onClick={handleBack} className="font-medium text-[14px] text-primary">
          이전 화면으로 돌아가기
        </button>
      </div>
    );
  }

  const readOnly = room.projectStatus === "COMPLETED";

  return (
    <div
      data-pull-to-refresh-ignore
      className="mx-auto flex h-[calc(100dvh_-_env(safe-area-inset-top)_-_4rem)] w-full max-w-[960px] flex-col bg-bg px-0 md:px-8 lg:h-[calc(100dvh_-_87px)] lg:px-0 native:h-[calc(100dvh_-_env(safe-area-inset-top))]"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-grey3 px-4 py-3 md:px-5">
        <PageBackButton fallbackTo={projectDetailPath} label="프로젝트 상세로 돌아가기" />
        <Link to={`/projects/${projectId}`} className="min-w-0 flex-1">
          <h1 className="truncate font-bold text-[17px] text-grey9 md:text-[20px]">
            {room.projectTitle}
          </h1>
          <p className="flex items-center gap-1 font-regular text-[12px] text-grey6">
            {connectionState !== "connected" && (
              <Loader2 className="h-3 w-3 motion-safe:animate-spin" aria-hidden />
            )}
            {connectionState === "connected"
              ? "실시간 연결됨"
              : connectionState === "connecting"
                ? "연결 중"
                : "재연결 중"}
          </p>
        </Link>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6">
        {hasNext && (
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={loadOlder}
              disabled={loadingOlder}
              className="inline-flex items-center gap-1.5 rounded-full border border-grey3 px-4 py-2 font-medium text-[13px] text-grey7 disabled:opacity-50"
            >
              {loadingOlder && (
                <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden />
              )}
              {loadingOlder ? "불러오는 중" : "이전 메시지 보기"}
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex min-h-full items-center justify-center text-center">
            <p className="font-regular text-[14px] text-grey6">
              프로젝트 대화가 아직 없어요.
              <br />첫 메시지를 남겨보세요.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${message.mine ? "justify-end" : "justify-start"}`}
              >
                {!message.mine && (
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-grey3">
                    {message.senderProfileUrl && (
                      <img
                        src={message.senderProfileUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                )}
                <div
                  className={`flex max-w-[78%] flex-col ${message.mine ? "items-end" : "items-start"}`}
                >
                  {!message.mine && (
                    <span className="mb-1 px-1 font-medium text-[12px] text-grey7">
                      {message.senderNickname}
                    </span>
                  )}
                  <div
                    className={`whitespace-pre-wrap break-words rounded-[18px] px-4 py-2.5 font-regular text-[15px] ${
                      message.mine
                        ? "rounded-br-[5px] bg-primary text-white"
                        : "rounded-bl-[5px] bg-grey2 text-grey9"
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className="mt-1 px-1 font-regular text-[10px] text-grey5">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {readOnly ? (
        <div className="flex shrink-0 items-center justify-center gap-2 border-t border-grey3 px-4 py-4 text-grey6">
          <Lock className="h-4 w-4" aria-hidden />
          <span className="font-medium text-[13px]">
            완료된 프로젝트는 대화 내용을 읽을 수만 있어요.
          </span>
        </div>
      ) : (
        <div className="flex shrink-0 items-end gap-2 border-t border-grey3 bg-bg px-4 py-3 pb-[max(env(safe-area-inset-bottom),12px)] md:px-5 lg:pb-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value.slice(0, 1000))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            rows={1}
            placeholder="메시지를 입력하세요"
            className="max-h-28 min-h-11 flex-1 resize-none rounded-[20px] border border-grey3 bg-grey1 px-4 py-2.5 font-regular text-[15px] text-grey9 outline-none focus:border-grey7"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!content.trim() || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
            aria-label="메시지 보내기"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 motion-safe:animate-spin" aria-hidden />
            ) : (
              <Send className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
