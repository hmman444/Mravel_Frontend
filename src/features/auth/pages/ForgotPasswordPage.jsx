import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import { UserIcon } from "@heroicons/react/24/outline";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email });
  };

  return (
    <AuthLayout>
      <a href="/" className="text-base font-semibold text-white mb-2 inline-block">
        ← Về Trang chủ Mravel
      </a>

      <AuthCard
        title="Quên mật khẩu"
        subtitle="Nhập email để nhận hướng dẫn đặt lại mật khẩu"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email"
            icon={UserIcon}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold"
          >
            Gửi mã OTP
          </button>
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
