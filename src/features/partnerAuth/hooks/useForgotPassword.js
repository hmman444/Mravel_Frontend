import { useDispatch, useSelector } from "react-redux";
import { partnerForgotPassword } from "../slices/partnerAuthSlice";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const useForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.partnerAuth);

  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleForgot = async (email) => {
    if (cooldown > 0) return;

    const action = await dispatch(partnerForgotPassword({ email }));

    if (partnerForgotPassword.fulfilled.match(action)) {
      localStorage.setItem("partner_last_fp_email", email.trim().toLowerCase());
      setCooldown(30);
      setTimeout(() => {
        navigate(
          `/partner/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`
        );
      }, 1000);
    } else {
      setMessage(action.payload || "Không thể gửi OTP, vui lòng thử lại.");
    }
  };

  return { loading, error, message, handleForgot, cooldown };
};