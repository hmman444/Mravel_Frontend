import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ otp });
  };

  return (
    <AuthLayout>
      <a href="/" className="text-base font-semibold text-white mb-2 inline-block">
        ← Vào Trang chủ Mravel
      </a>

      <AuthCard
        title="Xác minh OTP"
        subtitle="Nhập mã OTP được gửi đến email của bạn"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Mã OTP"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Nhập mã OTP"
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold"
          >
            Xác minh
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Chưa nhận được OTP?{" "}
          <a href="/forgot-password" className="text-blue-500">
            Gửi lại
          </a>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
