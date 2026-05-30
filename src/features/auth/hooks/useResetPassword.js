// src/features/auth/hooks/useResetPassword.js
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordAction } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useResetPassword = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");

  const handleResetPassword = async (email, otpCode, newPassword) => {
    const action = await dispatch(resetPasswordAction({ email, otpCode, newPassword }));
    if (resetPasswordAction.fulfilled.match(action)) {
      setMessage(t("auth.reset_password_success"));
      setTimeout(() => navigate("/login"), 1000);
    } else {
      setMessage(action.payload || t("auth.reset_password_failed"));
    }
  };

  return { loading, error, message, handleResetPassword };
};
