"use client";

import { useMemo } from "react";
import { buildPlanStats } from "../utils/planStatsUtils";

export function usePlanStats(board) {
  return useMemo(() => buildPlanStats(board), [board]);
}