"use client";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { acceptInvite } from "../services/planBoardService";
import { showSuccess, showError } from "../../../utils/toastUtils";

export default function JoinPlanPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    const join = async () => {
      if (!token) {
        setStatus("error");
        showError("Token không hợp lệ");
        return;
      }

      // 1️⃣ CHƯA ĐĂNG NHẬP → redirect login
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        navigate({
          pathname: "/login",
          search: `?redirect=${encodeURIComponent(location.pathname + location.search)}`
        });
        return;
      }

      // 2️⃣ ĐÃ ĐĂNG NHẬP → gọi API để join
      try {
        const res = await acceptInvite(token);

        const planId = res?.planId;
        if (!planId) throw new Error("Không tìm thấy planId");

        setStatus("success");
        showSuccess("Tham gia kế hoạch thành công!");

        setTimeout(() => navigate(`/plans/${planId}`), 1500);
      } catch (err) {
        console.error("Join failed", err);
        setStatus("error");
        showError("Lời mời không hợp lệ hoặc đã hết hạn");
      }
    };

    join();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        {status === "loading" && (
          <p className="text-gray-600 dark:text-gray-300">
            Đang xác nhận lời mời...
          </p>
        )}
        {status === "success" && (
          <p className="text-green-600 font-medium">
            Tham gia thành công. Đang chuyển hướng...
          </p>
        )}
        {status === "error" && (
          <p className="text-red-500 font-medium">
            Lời mời không hợp lệ hoặc đã hết hạn.
          </p>
        )}
      </div>
    </div>
  );
}
