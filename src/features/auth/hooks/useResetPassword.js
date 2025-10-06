// src/features/auth/hooks/useResetPassword.js
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordAction } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");

  const handleResetPassword = async (email, otpCode, newPassword) => {
    const action = await dispatch(resetPasswordAction({ email, otpCode, newPassword }));
    if (resetPasswordAction.fulfilled.match(action)) {
      setMessage("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 1000);
    } else {
      setMessage(action.payload || "Đặt lại mật khẩu thất bại!");
    }
  };

  return { loading, error, message, handleResetPassword };
};
