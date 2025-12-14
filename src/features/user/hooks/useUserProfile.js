// src/features/profile/hooks/useUserProfile.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadProfilePage, clearProfile } from "../slices/profileSlice";
import api from "../../../utils/axiosInstance";
import { getTokens } from "../../../utils/tokenManager";

export function useUserProfile(userId) {
  const dispatch = useDispatch();
  const { data, loading, error, currentUserId } = useSelector((s) => s.profile);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const run = async () => {
      // Nếu đang ở đúng user và đã có data rồi thì thôi, khỏi gọi lại
      if (currentUserId === userId && data) return;

      // Nếu đang login (có accessToken) → ép BE check & refresh nếu cần
      const { accessToken } = getTokens();
      if (accessToken) {
        try {
          await api.get("/auth/me");
          // Nếu token hết hạn, interceptor sẽ tự refresh rồi retry /auth/me
        } catch (e) {
          if (cancelled) return;
          // Nếu refresh fail thì interceptor đã clear token + redirect /login rồi
        }
      }

      if (cancelled) return;
      dispatch(loadProfilePage(userId));
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [userId, currentUserId, data, dispatch]);

  return {
    profile: data?.user || null,
    relationship: data?.relationship || null,
    plans: data?.plansPreview || [],
    friendsPreview: data?.friendsPreview || [],
    loading,
    error,

    reload: () => dispatch(loadProfilePage(userId)),
    clear: () => dispatch(clearProfile()),
  };
}
