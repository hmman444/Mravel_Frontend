// src/realtime/useNotificationRealtime.js
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mainSocket } from "./mainSocket";
import { receiveNotificationEvent } from "../features/notifications/slices/notificationSlice";

export function useNotificationRealtime() {
  const dispatch = useDispatch();
  const subIdRef = useRef(null);

  const userId = useSelector((s) => s.auth?.user?.id);
  const accessToken = useSelector((s) => s.auth?.accessToken);

  useEffect(() => {
    if (!userId || !accessToken) return;

    const destination = `/topic/users/${userId}/notifications`;

    // unsubscribe cũ (nếu có)
    if (subIdRef.current != null) {
      mainSocket.unsubscribe(subIdRef.current);
      subIdRef.current = null;
    }

    const subId = mainSocket.subscribe(destination, (payload) => {
      console.log("payload.notification:", payload?.notification);
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
