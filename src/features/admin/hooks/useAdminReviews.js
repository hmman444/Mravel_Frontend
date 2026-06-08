import { useDispatch, useSelector } from "react-redux";
import {
  loadNegativeReviews,
  loadNegativeCount,
  removeReview,
  setMode,
  setMaxRating,
  clearError,
} from "../slices/adminReviewSlice";

export function useAdminReviews() {
  const dispatch = useDispatch();
  const {
    mode,
    maxRating,
    items,
    page,
    size,
    totalElements,
    totalPages,
    negativeCount,
    loading,
    acting,
    error,
    actionError,
  } = useSelector((s) => s.adminReview);

  return {
    mode,
    maxRating,
    items,
    page,
    size,
    totalElements,
    totalPages,
    negativeCount,
    loading,
    acting,
    error,
    actionError,

    setMode: (m) => dispatch(setMode(m)),
    setMaxRating: (r) => dispatch(setMaxRating(r)),
    clearError: () => dispatch(clearError()),

    load: (params) => dispatch(loadNegativeReviews(params)).unwrap(),
    loadCount: (params) => dispatch(loadNegativeCount(params)).unwrap(),
    remove: (id) => dispatch(removeReview(id)).unwrap(),
  };
}
