import { useDispatch, useSelector } from "react-redux";
import { partnerResetPasswordAction } from "../slices/partnerAuthSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.partnerAuth);
  const [message, setMessage] = useState("");

  const handleResetPassword = async (email, otpCode, newPassword) => {
    const action = await dispatch(
      partnerResetPasswordAction({ email, otpCode, newPassword })
    );

    if (partnerResetPasswordAction.fulfilled.match(action)) {
      setMessage("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/partner/login"), 1000);
    } else {
      setMessage(action.payload || "Đặt lại mật khẩu thất bại!");
    }
  };

  return { loading, error, message, handleResetPassword };
};