import { useDispatch, useSelector } from "react-redux";
import { partnerVerifyOtpUser } from "../slices/partnerAuthSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useVerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.partnerAuth);
  const [message, setMessage] = useState("");

  const handleVerifyOtp = async (email, otpCode) => {
    const action = await dispatch(partnerVerifyOtpUser({ email, otpCode }));

    if (partnerVerifyOtpUser.fulfilled.match(action)) {
      setMessage("Xác thực thành công! Bạn có thể đăng nhập.");
      setTimeout(() => navigate("/partner/login"), 1000);
    } else {
      setMessage(action.payload || "OTP không hợp lệ hoặc đã hết hạn!");
    }
  };

  return { loading, error, message, handleVerifyOtp };
};