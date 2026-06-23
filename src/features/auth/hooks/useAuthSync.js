import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchCurrentUser } from "../slices/authSlice";

export function useAuthSync() {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only fetch if we have a token but no user yet.
    // useLoadUser handles the initial load; this hook re-syncs after token refresh.
    if (accessToken && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [accessToken, user, dispatch]);
}
