import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useRegister = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");

  const handleRegister = async (fullname, email, password) => {
    const action = await dispatch(registerUser({ fullname, email, password }));
    if (registerUser.fulfilled.match(action)) {
      setMessage(t("auth.register_success_check_email_otp"));
      // Lưu dự phòng
      localStorage.setItem("last_reg_email", email.trim().toLowerCase());
      // Điều hướng kèm query
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } else {
      setMessage(action.payload || t("auth.register_failed"));
    }
  };

  return { loading, error, message, handleRegister };
};
