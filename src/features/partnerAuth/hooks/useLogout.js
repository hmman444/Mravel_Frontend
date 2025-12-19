// src/features/partnerAuth/hooks/useLogout.js
import { useDispatch } from "react-redux";
import { partnerLogoutUser } from "../slices/partnerAuthSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await dispatch(partnerLogoutUser());
    if (partnerLogoutUser.fulfilled.match(result)) {
      toast.success("Đăng xuất đối tác thành công");
      navigate("/partner");
    } else {
      toast.error("Lỗi khi đăng xuất");
    }
  };

  return { handleLogout };
};