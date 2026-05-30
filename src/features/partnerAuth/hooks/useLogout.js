// src/features/partnerAuth/hooks/useLogout.js
import { useDispatch } from "react-redux";
import { partnerLogoutUser } from "../slices/partnerAuthSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    const result = await dispatch(partnerLogoutUser());
    if (partnerLogoutUser.fulfilled.match(result)) {
      toast.success(t("partnerAuth.logout.success"));
      navigate("/partner");
    } else {
      toast.error(t("partnerAuth.logout.error"));
    }
  };

  return { handleLogout };
};