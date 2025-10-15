import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");

  const handleLogin = async (email, password, rememberMe) => {
    const action = await dispatch(loginUser({ email, password, rememberMe }));
    if (loginUser.fulfilled.match(action)) {
      setMessage("Đăng nhập thành công!");
      navigate("/");
    } else {
      setMessage(action.payload || "Sai email hoặc mật khẩu!");
    }
  };

  return { loading, error, message, handleLogin };
};
