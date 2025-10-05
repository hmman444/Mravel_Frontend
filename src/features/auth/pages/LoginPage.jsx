import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import PasswordInput from "../components/PasswordInput";
import SocialLogin from "../components/SocialLogin";
import { UserIcon } from "@heroicons/react/24/outline";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, loading, message } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  return (
    <AuthLayout>
      <a href="/" className="text-base font-semibold text-white mb-2 inline-block">
        ← Về Trang chủ Mravel
      </a>

      <AuthCard title="Tận hưởng kỳ nghỉ của bạn" subtitle="Đăng nhập với email và mật khẩu">
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

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu của bạn"
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded" />
              Ghi nhớ đăng nhập
            </label>
            <a href="/forgot-password" className="text-sm text-blue-500">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full font-semibold text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-500"
            }`}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          {message && (
            <p
              className={`text-center mt-3 font-medium ${
                message.includes("thành công") ? "text-green-500" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        <SocialLogin />

        <p className="text-center text-sm text-gray-500 mt-5">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-blue-500">
            Đăng ký ngay
          </a>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
