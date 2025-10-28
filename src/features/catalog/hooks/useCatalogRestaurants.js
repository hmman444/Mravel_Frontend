import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { searchRestaurants } from "../slices/catalogSlice";

export const useCatalogRestaurants = () => {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.catalog.restaurants);

  const fetchRestaurants = useCallback(
    (params) => dispatch(searchRestaurants(params)),
    [dispatch]
  );

  return { ...state, fetchRestaurants };
};