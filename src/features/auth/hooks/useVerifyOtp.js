import { useDispatch, useSelector } from "react-redux";
import { verifyOtpUser } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useVerifyOtp = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");

  const handleVerifyOtp = async (email, otpCode) => {
    const action = await dispatch(verifyOtpUser({ email, otpCode }));
    if (verifyOtpUser.fulfilled.match(action)) {
      setMessage(t("auth.otp_verify_success"));
      setTimeout(() => navigate("/login"), 1000);
    } else {
      setMessage(action.payload || t("auth.otp_invalid_or_expired"));
    }
  };

  return { loading, error, message, handleVerifyOtp };
};
