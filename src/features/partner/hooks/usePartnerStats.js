import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPartnerStatsByStatus, fetchPartnerRevenue } from "../slices/partnerSlice";

export const usePartnerStats = () => {
  const dispatch = useDispatch();
  const statsByStatus = useSelector((s) => s.partner.statsByStatus);
  const revenue = useSelector((s) => s.partner.revenue);

  const loadStatus = useCallback((params) => dispatch(fetchPartnerStatsByStatus(params)), [dispatch]);
  const loadRevenue = useCallback((params) => dispatch(fetchPartnerRevenue(params)), [dispatch]);

  return { statsByStatus, revenue, loadStatus, loadRevenue };
};