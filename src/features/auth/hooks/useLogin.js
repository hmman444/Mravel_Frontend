import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../slices/authSlice";
import { useState } from "react";

export const useLogin = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");

  const handleLogin = async (email, password, rememberMe) => {
    const action = await dispatch(loginUser({ email, password, rememberMe }));

    if (loginUser.fulfilled.match(action)) {
      setMessage("Đăng nhập thành công!");
      return true;
    }

    setMessage(action.payload || "Sai email hoặc mật khẩu!");
    return false;
  };

  return { loading, error, message, handleLogin };
};
