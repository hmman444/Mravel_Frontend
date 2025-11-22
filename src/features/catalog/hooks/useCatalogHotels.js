// src/features/catalog/hooks/useCatalogHotels.js
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { searchHotels } from "../slices/catalogSlice";

export const useCatalogHotels = () => {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.catalog.hotels);

  const fetchHotels = useCallback(
    (params) => dispatch(searchHotels(params)),
    [dispatch]
  );

  return { ...state, fetchHotels };
};