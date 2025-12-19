import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPartnerMe } from "../slices/partnerSlice";

export const usePartnerMe = () => {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.partner.me);

  const fetchMe = useCallback(() => dispatch(fetchPartnerMe()), [dispatch]);

  return { ...state, fetchMe };
};