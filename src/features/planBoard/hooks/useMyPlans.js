// src/features/planBoard/hooks/useMyPlans.js
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { loadMyPlans } from "../slices/planListSlice";
import { showError } from "../../../utils/toastUtils";

export function useMyPlans(autoLoad = true) {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.planList);

  useEffect(() => {
    if (autoLoad) {
      dispatch(loadMyPlans());
    }
  }, [autoLoad, dispatch]);

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  const reload = () => dispatch(loadMyPlans());

  return {
    plans: items,
    loading,
    error,
    reload,
  };
}
