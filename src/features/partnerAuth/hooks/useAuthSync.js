import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchCurrentPartner } from "../slices/partnerAuthSlice";

export function useAuthSync() {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.partnerAuth);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchCurrentPartner());
    }
  }, [accessToken, dispatch]);
}