import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import { KeyIcon } from "@heroicons/react/24/outline";
import { useVerifyOtp } from "../hooks/useVerifyOtp";

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const { handleVerifyOtp, message, loading } = useVerifyOtp();

  // Lấy email từ URL hoặc localStorage
  const email =
    searchParams.get("email") ||
    localStorage.getItem("last_reg_email") ||
    "";

  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!email) {
      alert("Không tìm thấy email để xác minh OTP. Vui lòng đăng ký lại.");
    }
  }, [email]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerifyOtp(email, otp);
  };

  return (
    <AuthLayout>
      <Link to="/" className="text-base font-semibold text-white mb-2 inline-block">
        ← Về Trang chủ Mravel
      </Link>

      <AuthCard
        title="Xác minh OTP"
        subtitle={`Nhập mã OTP được gửi đến email: ${email || "?"}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Mã OTP"
            type="text"
            icon={KeyIcon}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Nhập mã OTP"
            required
          />

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Đang xác minh..." : "Xác minh"}
          </button>

          {message && <p className="text-center text-green-600 mt-3">{message}</p>}
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Chưa nhận được OTP?{" "}
          <Link to="/register" className="text-blue-500">
            Đăng ký lại
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
