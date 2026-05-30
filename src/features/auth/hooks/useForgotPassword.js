// src/features/auth/hooks/useForgotPassword.js
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const useForgotPassword = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0); // countdown 30s

  // Giảm countdown mỗi giây
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleForgot = async (email) => {
    if (cooldown > 0) return;
    const action = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(action)) {
      localStorage.setItem("last_fp_email", email.trim().toLowerCase());
      setCooldown(30); 
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }, 1000);
    } else {
      setMessage(action.payload || t("auth.cannot_send_otp"));
    }
  };

  return { loading, error, message, handleForgot, cooldown };
};
