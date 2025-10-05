import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../slices/authSlice";
import { useState } from "react";

export const useLogin = () => {
  const dispatch = useDispatch();
  const { loading, error, token } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");

  const handleLogin = async (email, password) => {
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      setMessage("Đăng nhập thành công!");
    } else {
      setMessage(resultAction.payload || "Sai email hoặc mật khẩu!");
    }
  };

  return { loading, error, token, message, handleLogin };
};
