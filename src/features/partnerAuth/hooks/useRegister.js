import { useDispatch } from "react-redux";
import { partnerRegisterUser } from "../slices/partnerAuthSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    } else {
      setMessage(action.payload || t("partnerAuth.register.failed"));
    }
  };

  return { message, handleRegister };
};