import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentPartner } from "../slices/partnerAuthSlice";

let currentPartnerRequestInFlight = false;

export const useLoadUser = () => {
  const dispatch = useDispatch();
  const { accessToken, partner } = useSelector((state) => state.partnerAuth);

  useEffect(() => {
    if (!accessToken || partner || currentPartnerRequestInFlight) return;

    currentPartnerRequestInFlight = true;
    Promise.resolve(dispatch(fetchCurrentPartner()))
      .finally(() => {
        currentPartnerRequestInFlight = false;
      });
  }, [accessToken, partner, dispatch]);
};