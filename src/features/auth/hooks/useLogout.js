import { useDispatch } from "react-redux";
import { logoutUser } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { showError, showSuccess } from "../../../utils/toastUtils";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      showSuccess("Đăng xuất thành công");
      navigate("/login");
    } else {
      showError("Lỗi khi đăng xuất");
    }
  };

  return { handleLogout };
};
