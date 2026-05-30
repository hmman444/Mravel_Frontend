"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchRecentPlans,
  removeRecentPlan,
} from "../services/planBoardService";
import { showError, showSuccess } from "../../../utils/toastUtils";

export function useRecentPlans() {
  const { t } = useTranslation();
  const [recentPlans, setRecentPlans] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const loadRecent = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const data = await fetchRecentPlans();
      setRecentPlans(data || []);
    } catch (e) {
      console.error(e);
      showError(t("plan.recent.load_failed"));
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
      showSuccess(t("plan.recent.remove_success"));
    } catch (e) {
      console.error(e);
    }
  };

  return {
    recentPlans,
    loadingRecent,
    reloadRecent: loadRecent,
    removeRecent,
  };
}
