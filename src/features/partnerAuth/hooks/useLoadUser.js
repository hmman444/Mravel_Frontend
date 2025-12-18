import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentPartner } from "../slices/partnerAuthSlice";

export const useLoadUser = () => {
  const dispatch = useDispatch();
  const { accessToken, partner } = useSelector((state) => state.partnerAuth);

  useEffect(() => {
    if (accessToken && !partner) {
      dispatch(fetchCurrentPartner());
    }
  }, [accessToken, partner, dispatch]);
};