import { useDispatch, useSelector } from "react-redux";
import { partnerLoginUser } from "../slices/partnerAuthSlice";
import { useState } from "react";

export const useLogin = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.partnerAuth);
  const [message, setMessage] = useState("");

  const handleLogin = async (email, password, rememberMe) => {
    const action = await dispatch(
      partnerLoginUser({ email, password, rememberMe })
    );

    if (partnerLoginUser.fulfilled.match(action)) {
      setMessage("Đăng nhập thành công!");
      return true;
    }

    setMessage(action.payload || "Sai email hoặc mật khẩu!");
    return false;
  };

  return { loading, error, message, handleLogin };
};