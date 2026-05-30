import { useDispatch, useSelector } from "react-redux";
import { partnerVerifyOtpUser } from "../slices/partnerAuthSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useVerifyOtp = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.partnerAuth);
  const [message, setMessage] = useState("");

  const handleVerifyOtp = async (email, otpCode) => {
    const action = await dispatch(partnerVerifyOtpUser({ email, otpCode }));

    if (partnerVerifyOtpUser.fulfilled.match(action)) {
      setMessage(t("partnerAuth.verify_otp.success"));
      setTimeout(() => navigate("/partner/login"), 1000);
    } else {
      setMessage(action.payload || t("partnerAuth.verify_otp.invalid_or_expired"));
    }
  };

  return { loading, error, message, handleVerifyOtp };
};