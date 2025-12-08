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

  // dùng để debounce việc reload khi REORDER
  const reloadTimerRef = useRef(null);

  useEffect(() => {
    if (!planId || !accessToken) return;

    mainSocket.connect(accessToken);
    const destination = `/topic/plans/${planId}/board`;

    const subId = mainSocket.subscribe(destination, (payload) => {
      if (!payload) return;

      // TH1: payload = PlanBoardEvent { eventType, actorId, board }
      // TH2: payload = BoardResponse (fallback cũ)
      if (payload.eventType) {
        const { eventType, actorId, board } = payload;
        const isSelf =
          actorId &&
          currentUserId &&
          String(actorId) === String(currentUserId);

        if (eventType && eventType.startsWith("REORDER")) {
          //  Người kéo: đã localReorder rồi → bỏ qua để tránh giật
          if (isSelf) {
            return;
          }

          // đợi 150ms cho chắc DB đã commit rồi mới reload
          if (reloadTimerRef.current) {
            clearTimeout(reloadTimerRef.current);
          }
          reloadTimerRef.current = setTimeout(() => {
            dispatch(loadBoard(planId));
          }, 150);

          return;
        }
        if (eventType === "CLEAR_TRASH") {
          dispatch(loadBoard(planId));
          return;
        }

        // Các event khác (CREATE_CARD, UPDATE_CARD, DELETE_CARD, ...) vẫn sync bằng snapshot
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
