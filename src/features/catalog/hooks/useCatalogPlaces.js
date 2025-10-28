import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { searchPlaces } from "../slices/catalogSlice";

export const useCatalogPlaces = () => {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.catalog.poi);

  const fetchPlaces = useCallback(
    (params) => dispatch(searchPlaces(params)),
    [dispatch]
  );

  return { ...state, fetchPlaces };
};