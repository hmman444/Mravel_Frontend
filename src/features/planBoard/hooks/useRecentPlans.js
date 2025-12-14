"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchRecentPlans,
  removeRecentPlan,
} from "../services/planBoardService";
import { showError, showSuccess } from "../../../utils/toastUtils";

export function useRecentPlans() {
  const [recentPlans, setRecentPlans] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const loadRecent = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const data = await fetchRecentPlans();
      setRecentPlans(data || []);
    } catch (e) {
      console.error(e);
      showError("Không thể tải danh sách xem gần đây");
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  const removeRecent = async (planId) => {
    try {
      await removeRecentPlan(planId);
      setRecentPlans((prev) =>
        prev.filter((p) => String(p.id) !== String(planId))
      );
      showSuccess("Đã xoá khỏi danh sách xem gần đây");
    } catch (e) {
      console.error(e);
      showError("Không thể xoá khỏi danh sách xem gần đây");
    }
  };

  return {
    recentPlans,
    loadingRecent,
    reloadRecent: loadRecent,
    removeRecent,
  };
}
