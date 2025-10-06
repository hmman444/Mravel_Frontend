import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useForgotPassword } from "../hooks/useForgotPassword";
import LoadingOverlay from "../../../components/LoadingOverlay";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { handleForgot, message, loading, error, cooldown } = useForgotPassword();

  const [inputError, setInputError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setInputError("Email không được để trống");
      return;
    }
    
    const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      setInputError("Địa chỉ email không hợp lệ");
      return;
    }

    setInputError("");
    handleForgot(email);
  };

  return (
    <AuthLayout>
      <LoadingOverlay show={loading} text="Đang gửi mã OTP..." />

      <a href="/" className="text-base font-semibold text-white mb-2 inline-block">
        ← Về Trang chủ Mravel
      </a>

      <AuthCard title="Quên mật khẩu" subtitle="Nhập email để nhận mã OTP đặt lại mật khẩu">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email"
            type="email"
            icon={EnvelopeIcon}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            required
          />
          {inputError && <p className="text-red-500 text-sm">{inputError}</p>}

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold disabled:opacity-60"
          >
            {cooldown > 0 ? `Gửi lại OTP sau ${cooldown}s` : "Gửi mã OTP"}
          </button>

          {error && !inputError && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
          {message && !error && (
            <p className="text-green-600 text-sm text-center mt-2">{message}</p>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          <a href="/login" className="text-blue-500">
            Quay lại đăng nhập
          </a>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
