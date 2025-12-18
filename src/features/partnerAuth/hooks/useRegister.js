import { useDispatch } from "react-redux";
import { partnerRegisterUser } from "../slices/partnerAuthSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleRegister = async (fullname, email, password) => {
    const action = await dispatch(
      partnerRegisterUser({ fullname, email, password })
    );

    if (partnerRegisterUser.fulfilled.match(action)) {
      setMessage("Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP.");
      localStorage.setItem("partner_last_reg_email", email.trim().toLowerCase());
      navigate(
        `/partner/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
    } else {
      setMessage(action.payload || "Đăng ký thất bại!");
    }
  };

  return { message, handleRegister };
};