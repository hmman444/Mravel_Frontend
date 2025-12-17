import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearTokens } from "../utils/tokenManager";
import { setTokensRedux, setUser } from "../features/auth/slices/authSlice";

export default function RequireRole({ allow = [] }) {
  const dispatch = useDispatch();
  const location = useLocation();

  const { accessToken, role } = useSelector((s) => s.auth);

  // Chưa đăng nhập -> về login
  if (!accessToken) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  // Chưa có role (chưa hydrate) -> có thể chờ load user (tạm thời chặn render)
  // Bạn có thể thay bằng LoadingOverlay nếu muốn
  if (!role) return null;

  // Sai role -> logout và về login
  if (!allow.includes(role)) {
    clearTokens();
    dispatch(setTokensRedux({ accessToken: null, refreshToken: null }));
    dispatch(setUser(null));
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
