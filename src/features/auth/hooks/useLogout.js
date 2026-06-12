import { useDispatch } from "react-redux";
import { logoutUser } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { showError, showSuccess } from "../../../utils/toastUtils";
import { useTranslation } from "react-i18next";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      showSuccess(t("auth.logout_success"));
      navigate("/login");
    } else {
      showError(result.payload || t("auth.logout_error"));
    }
  };

  return { handleLogout };
};
