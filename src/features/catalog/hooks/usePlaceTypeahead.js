import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { suggestPlaces, clearSuggest } from "../slices/catalogSlice";

export const usePlaceTypeahead = () => {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.catalog.suggest);

  const fetchSuggest = useCallback((q, limit = 6) => {
    dispatch(suggestPlaces({ q, limit }));
  }, [dispatch]);

  const resetSuggest = useCallback(() => dispatch(clearSuggest()), [dispatch]);

  return { ...state, fetchSuggest, resetSuggest };
};