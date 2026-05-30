import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../slices/authSlice";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useLogin = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");

  const handleLogin = async (email, password, rememberMe) => {
    const action = await dispatch(loginUser({ email, password, rememberMe }));

    if (loginUser.fulfilled.match(action)) {
      setMessage(t("auth.login_success"));
      return { ok: true, role: action.payload.role };
    }

    setMessage(action.payload || t("auth.invalid_credentials"));
    return { ok: false };
  };

  return { loading, error, message, handleLogin };
};
