// src/realtime/usePlanBoardRealtime.js
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mainSocket } from "./mainSocket";
import {
  syncBoardFromRealtime,
  loadBoard,
} from "../features/planBoard/slices/planBoardSlice";

export function usePlanBoardRealtime(planId) {
  const dispatch = useDispatch();

  const accessToken = useSelector(
    (s) => s.auth?.accessToken || s.auth?.token || s.auth?.user?.accessToken
  );
  const currentUserId = useSelector(
    (s) => s.auth?.profile?.id || s.auth?.user?.id
  );

  const reloadTimerRef = useRef(null);

  useEffect(() => {
    if (!planId || !accessToken) return;

    const destination = `/topic/plans/${planId}/board`;

    const subId = mainSocket.subscribe(destination, (payload) => {
      console.log("[WS] /topic/plans/board payload:", payload);
      if (!payload) return;

      if (payload.eventType) {
        const { eventType, actorId, board } = payload;
        const isSelf =
          actorId &&
          currentUserId &&
          String(actorId) === String(currentUserId);

        if (eventType && eventType.startsWith("REORDER")) {
          if (isSelf) return;

          if (reloadTimerRef.current) {
            clearTimeout(reloadTimerRef.current);
          }
          reloadTimerRef.current = setTimeout(() => {
            dispatch(loadBoard(planId));
          }, 30);

          return;
        }

        if (eventType === "CLEAR_TRASH") {
          dispatch(loadBoard(planId));
          return;
        }

        if (board) {
          dispatch(syncBoardFromRealtime(board));
        }

        return;
      }

      // Fallback: nếu backend chỉ gửi BoardResponse
      dispatch(syncBoardFromRealtime(payload));
    });

    return () => {
      if (subId != null) {
        mainSocket.unsubscribe(subId);
      }
      if (reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current);
      }
    };
  }, [planId, accessToken, currentUserId, dispatch]);
}
