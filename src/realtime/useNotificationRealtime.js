// src/realtime/useNotificationRealtime.js
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { mainSocket } from "./mainSocket";
import { useIdentity } from "./useIdentity";
import { receiveNotificationEvent } from "../features/notifications/slices/notificationSlice";

export function useNotificationRealtime() {
  const dispatch = useDispatch();
  const subIdRef = useRef(null);

  // Works for users AND partners (both resolved from the active token).
  const { userId, accessToken } = useIdentity();

  useEffect(() => {
    if (!userId || !accessToken) return;

    const destination = `/topic/users/${userId}/notifications`;

    // unsubscribe cũ (nếu có)
    if (subIdRef.current != null) {
      mainSocket.unsubscribe(subIdRef.current);
      subIdRef.current = null;
    }

    const subId = mainSocket.subscribe(destination, (payload) => {
      // payload từ realtime-service là JSON event
      dispatch(receiveNotificationEvent(payload));
    });

    subIdRef.current = subId;

    return () => {
      if (subIdRef.current != null) {
        mainSocket.unsubscribe(subIdRef.current);
        subIdRef.current = null;
      }
    };
  }, [userId, accessToken, dispatch]);
}
