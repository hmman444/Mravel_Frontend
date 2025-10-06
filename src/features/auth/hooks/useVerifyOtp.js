import { useDispatch, useSelector } from "react-redux";
import { verifyOtpUser } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useVerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");

  const handleVerifyOtp = async (email, otpCode) => {
    const action = await dispatch(verifyOtpUser({ email, otpCode }));
    if (verifyOtpUser.fulfilled.match(action)) {
      setMessage("Xác thực thành công! Bạn có thể đăng nhập.");
      setTimeout(() => navigate("/login"), 1000);
    } else {
      setMessage(action.payload || "OTP không hợp lệ hoặc đã hết hạn!");
    }
  };

  return { loading, error, message, handleVerifyOtp };
};
