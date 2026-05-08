import { useState, useEffect, useRef } from "react";
import axios from "axios";

const POLL_INTERVAL_MS = 30_000;

/**
 * Polls /api/realtime/presence for the given userIds.
 * Returns a Set<number> of online userIds.
 */
export function useChatPresence(userIds) {
  const [onlineIds, setOnlineIds] = useState(new Set());
  const timerRef = useRef(null);

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setOnlineIds(new Set());
      return;
    }

    const fetch = async () => {
      try {
        const params = userIds.join(",");
        const { data } = await axios.get(`/api/realtime/presence?userIds=${params}`);
        setOnlineIds(new Set(data));
      } catch {
        // Silently fail — presence is non-critical
      }
    };

    fetch();
    timerRef.current = setInterval(fetch, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [userIds?.join(",")]); // eslint-disable-line

  return onlineIds;
}
