import { useDispatch } from "react-redux";
import { registerUser } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleRegister = async (fullname, email, password) => {
    const action = await dispatch(registerUser({ fullname, email, password }));
    if (registerUser.fulfilled.match(action)) {
      setMessage("Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP.");
      // Lưu dự phòng
      localStorage.setItem("last_reg_email", email.trim().toLowerCase());
      // Điều hướng kèm query
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } else {
      setMessage(action.payload || "Đăng ký thất bại!");
    }
  };

  return { message, handleRegister };
};
