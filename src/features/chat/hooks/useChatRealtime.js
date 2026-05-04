// src/features/chat/hooks/useChatRealtime.js
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mainSocket } from "../../../realtime/mainSocket";
import { decodeJwtPayload } from "../../../utils/jwt";
import {
  receiveChatEvent,
  receiveConversationListEvent,
  clearTypingUser,
} from "../slices/chatSlice";

const TYPING_TIMEOUT_MS = 3000;

/**
 * Subscribes to:
 *  - /topic/conversations/{id}/events  (when a conversation is active)
 *  - /topic/users/{userId}/conversations  (always, for list updates)
 */
export function useChatRealtime(activeConversationId) {
  const dispatch = useDispatch();
  const userId = useSelector((s) => {
    const authUser = s.auth?.user;
    if (authUser?.id) return authUser.id;

    const token = s.auth?.accessToken;
    const payload = token ? decodeJwtPayload(token) : null;
    return payload?.id ?? payload?.userId ?? null;
  });
  const accessToken = useSelector((s) => s.auth?.accessToken);

  const convSubRef = useRef(null);
  const userSubRef = useRef(null);
  const typingTimersRef = useRef({});

  // Subscribe to personal conversation-list topic
  useEffect(() => {
    if (!userId || !accessToken) return;

    if (userSubRef.current != null) {
      mainSocket.unsubscribe(userSubRef.current);
      userSubRef.current = null;
    }

    const dest = `/topic/users/${userId}/conversations`;
    userSubRef.current = mainSocket.subscribe(dest, (payload) => {
      dispatch(receiveConversationListEvent(payload));
    });

    return () => {
      if (userSubRef.current != null) {
        mainSocket.unsubscribe(userSubRef.current);
        userSubRef.current = null;
      }
    };
  }, [userId, accessToken, dispatch]);

  // Subscribe to active conversation events
  useEffect(() => {
    if (convSubRef.current != null) {
      mainSocket.unsubscribe(convSubRef.current);
      convSubRef.current = null;
    }

    if (!activeConversationId || !accessToken) return;

    const dest = `/topic/conversations/${activeConversationId}/events`;
    convSubRef.current = mainSocket.subscribe(dest, (payload) => {
      dispatch(receiveChatEvent(payload));

      // Auto-clear typing indicator after timeout
      if (payload.eventType === "TYPING" && payload.actorId) {
        const key = `${payload.conversationId}_${payload.actorId}`;
        if (typingTimersRef.current[key]) {
          clearTimeout(typingTimersRef.current[key]);
        }
        typingTimersRef.current[key] = setTimeout(() => {
          dispatch(clearTypingUser({
            conversationId: payload.conversationId,
            userId: payload.actorId,
          }));
          delete typingTimersRef.current[key];
        }, TYPING_TIMEOUT_MS);
      }
    });

    return () => {
      if (convSubRef.current != null) {
        mainSocket.unsubscribe(convSubRef.current);
        convSubRef.current = null;
      }
    };
  }, [activeConversationId, accessToken, dispatch]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(typingTimersRef.current).forEach(clearTimeout);
    };
  }, []);
}
