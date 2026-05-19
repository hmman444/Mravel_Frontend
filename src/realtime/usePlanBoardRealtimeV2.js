// src/realtime/usePlanBoardRealtimeV2.js

import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mainSocket } from "./mainSocket";
import {
  syncBoardFromRealtime,
  loadBoard,
  setLastRevision,
  applyPatchEvent,
} from "../features/planBoard/slices/planBoardSlice";
import { fetchBoardSnapshot } from "../features/planBoard/services/planBoardService";
import { normalizeBoardPayload } from "../features/planBoard/utils/timeUtils";

/**
 * Gap recovery policy:
 * - If offline < GAP_STALE_THRESHOLD_MS : fetch incremental patch events via snapshot endpoint
 * - If offline >= GAP_STALE_THRESHOLD_MS : full board reload
 */
const GAP_STALE_THRESHOLD_MS = 60_000;
const RECONCILE_IDLE_THRESHOLD_MS = 30_000;
const RECONCILE_INTERVAL_MS = 20_000;
const DISCONNECTED_GRACE_MS = 5_000;
const DISCONNECTED_POLL_INTERVAL_MS = 15_000;

export function usePlanBoardRealtimeV2(planId) {
  const dispatch = useDispatch();

  const accessToken = useSelector(
    (s) => s.auth?.accessToken || s.auth?.token || s.auth?.user?.accessToken
  );
  const lastRevision = useSelector((s) => s.planBoard?.lastRevision ?? null);

  const lastEventTimeRef = useRef(Date.now());
  const lastRevisionRef = useRef(lastRevision);
  const syncReloadTimerRef = useRef(null);
  const fallbackPollTimerRef = useRef(null);
  const reconcileTimerRef = useRef(null);
  const pendingEventsRef = useRef([]);
  const gapRecoveryInProgressRef = useRef(false);
  const initialReloadIssuedRef = useRef(false);
  const disconnectedSinceRef = useRef(null);

  useEffect(() => {
    lastRevisionRef.current = lastRevision;
  }, [lastRevision]);

  const applyFullSnapshot = useCallback((board) => {
    const normalized = normalizeBoardPayload(board);
    dispatch(syncBoardFromRealtime(normalized));
    if (board?.boardRevision != null) {
      dispatch(setLastRevision(board.boardRevision));
    }
  }, [dispatch]);

  const recoverGap = useCallback(async (knownRevision) => {
    if (gapRecoveryInProgressRef.current) return;
    gapRecoveryInProgressRef.current = true;
    try {
      const staleDuration = Date.now() - lastEventTimeRef.current;
      if (staleDuration >= GAP_STALE_THRESHOLD_MS) {
        dispatch(loadBoard(planId));
        return;
      }

      const result = await fetchBoardSnapshot(planId, knownRevision);
      if (result.mode === "full_snapshot") {
        applyFullSnapshot(result.board);
      } else {
        // Incremental: replay patch events in revision order
        const events = (result.events || []).sort((a, b) => a.revision - b.revision);
        for (const evt of events) {
          dispatch(applyPatchEvent(evt));
        }
        if (result.currentRevision != null) {
          dispatch(setLastRevision(result.currentRevision));
        }
      }

      // Drain buffered events that arrived during gap recovery
      const buffered = pendingEventsRef.current.slice().sort(
        (a, b) => a.revision - b.revision
      );
      pendingEventsRef.current = [];
      for (const evt of buffered) {
        dispatch(applyPatchEvent(evt));
      }
    } catch (err) {
      console.error("[WS v2] Gap recovery failed, falling back to full reload:", err);
      dispatch(loadBoard(planId));
    } finally {
      gapRecoveryInProgressRef.current = false;
    }
  }, [planId, dispatch, applyFullSnapshot]);

  useEffect(() => {
    if (!planId || !accessToken) return;

    const scheduleSyncReload = () => {
      if (syncReloadTimerRef.current) {
        clearTimeout(syncReloadTimerRef.current);
      }
      syncReloadTimerRef.current = setTimeout(() => {
        dispatch(loadBoard(planId));
      }, 1500);
    };

    const destination = `/topic/plans/${planId}/board/v2`;

    const subId = mainSocket.subscribe(destination, (payload) => {
      if (!payload) return;

      const { revision } = payload;
      const knownRevision = lastRevisionRef.current;

      lastEventTimeRef.current = Date.now();

      const isBoardSyncEvent =
        payload.entityType === "BOARD" && payload.operationType === "SYNC";

      // SYNC events are control signals from legacy/v1 bridge. Handle first,
      // regardless of revision monotonicity quality.
      if (isBoardSyncEvent) {
        scheduleSyncReload();
        if (revision != null && (knownRevision == null || revision > knownRevision)) {
          lastRevisionRef.current = revision;
          dispatch(setLastRevision(revision));
        }
        return;
      }

      // Gap detection
      if (revision != null && knownRevision != null) {
        if (revision <= knownRevision) {
          // Duplicate or already applied — discard
          return;
        }
        if (revision > knownRevision + 1) {
          console.warn(`[WS v2] Gap: lastRevision=${knownRevision} incoming=${revision}`);
          pendingEventsRef.current.push(payload);
          recoverGap(knownRevision);
          return;
        }
      }

      dispatch(applyPatchEvent(payload));
      if (revision != null) {
        lastRevisionRef.current = revision;
      }
    });

    return () => {
      if (subId != null) mainSocket.unsubscribe(subId);
      if (syncReloadTimerRef.current) {
        clearTimeout(syncReloadTimerRef.current);
      }
    };
  }, [planId, accessToken, dispatch, recoverGap]);

  useEffect(() => {
    if (!planId || !accessToken) return;

    const reconcileIfIdle = () => {
      if (gapRecoveryInProgressRef.current) return;

      const knownRevision = lastRevisionRef.current;
      if (knownRevision == null) return;

      const idleFor = Date.now() - lastEventTimeRef.current;
      if (idleFor < RECONCILE_IDLE_THRESHOLD_MS) return;

      recoverGap(knownRevision);
    };

    reconcileTimerRef.current = setInterval(reconcileIfIdle, RECONCILE_INTERVAL_MS);
    return () => {
      if (reconcileTimerRef.current) {
        clearInterval(reconcileTimerRef.current);
      }
    };
  }, [planId, accessToken, recoverGap]);

  useEffect(() => {
    if (!planId || !accessToken) return;

    const pollWhenDisconnected = () => {
      if (mainSocket.connected) {
        disconnectedSinceRef.current = null;
        return;
      }

      if (disconnectedSinceRef.current == null) {
        disconnectedSinceRef.current = Date.now();
      }

      const disconnectedFor = Date.now() - disconnectedSinceRef.current;
      if (disconnectedFor < DISCONNECTED_GRACE_MS) return;

      if (gapRecoveryInProgressRef.current) return;

      const knownRevision = lastRevisionRef.current;
      if (knownRevision != null) {
        recoverGap(knownRevision);
        return;
      }

      if (!initialReloadIssuedRef.current) {
        initialReloadIssuedRef.current = true;
        dispatch(loadBoard(planId));
      }
    };

    fallbackPollTimerRef.current = setInterval(
      pollWhenDisconnected,
      DISCONNECTED_POLL_INTERVAL_MS
    );
    pollWhenDisconnected();

    return () => {
      if (fallbackPollTimerRef.current) {
        clearInterval(fallbackPollTimerRef.current);
      }
      initialReloadIssuedRef.current = false;
      disconnectedSinceRef.current = null;
    };
  }, [planId, accessToken, dispatch, recoverGap]);
}
