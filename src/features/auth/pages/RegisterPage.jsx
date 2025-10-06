import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import PasswordInput from "../components/PasswordInput";
import SocialLogin from "../components/SocialLogin";
import { UserIcon } from "@heroicons/react/24/outline";
import { useRegister } from "../hooks/useRegister";

export default function RegisterPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { handleRegister, message, loading } = useRegister();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }
    handleRegister(fullname, email, password);
  };

  return (
    <AuthLayout>
      <a href="/" className="text-base font-semibold text-white mb-2 inline-block">
        ← Về Trang chủ Mravel
      </a>

      <AuthCard title="Tạo tài khoản mới" subtitle="Điền thông tin bên dưới để đăng ký">
        <form onSubmit={handleSubmit} className="space-y-2">
          <AuthInput
            label="Họ và tên"
            icon={UserIcon}
            type="text"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Nhập họ và tên của bạn"
            required
          />

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
            placeholder="Nhập mật khẩu"
            required
          />

          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>

          {message && <p className="text-center text-green-600 mt-2">{message}</p>}
        </form>

        <SocialLogin />

        <p className="text-center text-sm text-gray-500 mt-5">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-blue-500">
            Đăng nhập ngay
          </a>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
