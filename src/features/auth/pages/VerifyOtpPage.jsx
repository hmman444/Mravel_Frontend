import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import { KeyIcon } from "@heroicons/react/24/outline";
import { useVerifyOtp } from "../hooks/useVerifyOtp";
import { validateOtp } from "../../../utils/validators";

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || localStorage.getItem("last_reg_email") || "";
  const { handleVerifyOtp, message, loading, error } = useVerifyOtp();
  const [otp, setOtp] = useState("");
  const [inputError, setInputError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpError = validateOtp(otp);
    if (otpError) {
      setInputError(otpError);
      return;
    }
    setInputError("");
    handleVerifyOtp(email, otp);
  };

  return (
    <AuthLayout>
      <Link to="/" className="text-base font-semibold text-white mb-2 inline-block">
        ← Về Trang chủ Mravel
      </Link>

      <AuthCard title="Xác minh OTP" subtitle={`Nhập mã OTP được gửi đến email: ${email}`}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthInput
            label="Mã OTP"
            icon={KeyIcon}
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Nhập mã OTP"
          />
          {inputError && <p className="text-red-500 text-sm mt-1">{inputError}</p>}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Đang xác minh..." : "Xác minh"}
          </button>

          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center mt-2">{message}</p>}
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
