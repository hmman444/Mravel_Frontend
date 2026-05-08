import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "../slices/authSlice";

let currentUserRequestInFlight = false;

export const useLoadUser = () => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!accessToken || user || currentUserRequestInFlight) return;

    currentUserRequestInFlight = true;
    Promise.resolve(dispatch(fetchCurrentUser()))
      .finally(() => {
        currentUserRequestInFlight = false;
      });
  }, [accessToken, user, dispatch]);
};
