import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { partnerLoginUser } from "../slices/partnerAuthSlice";
import { useState } from "react";

export const useLogin = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.partnerAuth);
  const [message, setMessage] = useState("");

  const handleLogin = async (email, password, rememberMe) => {
    const action = await dispatch(
      partnerLoginUser({ email, password, rememberMe })
    );

    if (partnerLoginUser.fulfilled.match(action)) {
      setMessage(t("partnerAuth.login.success"));
      return true;
    }

    setMessage(action.payload || t("partnerAuth.login.invalid_credentials"));
    return false;
  };

  return { loading, error, message, handleLogin };
};