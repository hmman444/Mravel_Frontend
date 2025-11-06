import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchPlaceDetail } from "../slices/catalogSlice";

export const usePlaceDetail = (slug) => {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.catalog.detail);

  useEffect(() => {
    if (slug) dispatch(fetchPlaceDetail(slug));
  }, [slug, dispatch]);

  return state;
};