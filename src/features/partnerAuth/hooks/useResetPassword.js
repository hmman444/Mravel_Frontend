import { useDispatch, useSelector } from "react-redux";
import { partnerResetPasswordAction } from "../slices/partnerAuthSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useResetPassword = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.partnerAuth);
  const [message, setMessage] = useState("");

  const handleResetPassword = async (email, otpCode, newPassword) => {
    const action = await dispatch(
      partnerResetPasswordAction({ email, otpCode, newPassword })
    );

    if (partnerResetPasswordAction.fulfilled.match(action)) {
      setMessage(t("partnerAuth.reset_password.success"));
      setTimeout(() => navigate("/partner/login"), 1000);
    } else {
      setMessage(action.payload || t("partnerAuth.reset_password.failed"));
    }
  };

  return { loading, error, message, handleResetPassword };
};