import { useDispatch, useSelector } from "react-redux";
import { partnerRegisterUser } from "../slices/partnerAuthSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loading, error } = useSelector((state) => state.partnerAuth);
  const [message, setMessage] = useState("");

  const handleRegister = async (fullname, email, password) => {
    const action = await dispatch(
      partnerRegisterUser({ fullname, email, password })
    );

    if (partnerRegisterUser.fulfilled.match(action)) {
      setMessage(t("partnerAuth.register.success"));
      localStorage.setItem("partner_last_reg_email", email.trim().toLowerCase());
      navigate(
        `/partner/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
    }
    // Lỗi sẽ hiển thị qua redux `error` (màu đỏ) ở trang, không đưa vào `message` (màu xanh)
  };

  return { loading, error, message, handleRegister };
};