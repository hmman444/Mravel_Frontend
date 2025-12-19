import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentPartner, partnerLogoutUser } from "../slices/partnerAuthSlice";

export default function PartnerProtectedRoute() {
  const location = useLocation();
  const dispatch = useDispatch();

  const { accessToken, partner, loading } = useSelector((s) => s.partnerAuth);

  // Nếu có token nhưng chưa có partner => fetch /me để validate token + lấy info
  useEffect(() => {
    if (accessToken && !partner && !loading) {
      dispatch(fetchCurrentPartner())
        .unwrap()
        .catch(() => {
          // token hết hạn / invalid => clear tokens + đá về login
          dispatch(partnerLogoutUser());
        });
    }
  }, [accessToken, partner, loading, dispatch]);

  // Chưa login => chặn luôn, khỏi render dashboard
  if (!accessToken) {
    return <Navigate to="/partner" replace state={{ from: location }} />;
  }

  // Đang verify token / đang fetch me => show loading để khỏi “nhá UI”
  if (!partner && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Đang kiểm tra đăng nhập...</div>
      </div>
    );
  }

  // Có token + (đã có partner hoặc fetch xong) => cho đi tiếp
  return <Outlet />;
}