import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import PasswordInput from "../components/PasswordInput";
import SocialLogin from "../components/SocialLogin";
import { UserIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { useRegister } from "../hooks/useRegister";
import {
  validateFullname,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "../../../utils/validators";

export default function RegisterPage() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { handleRegister, message, loading, error } = useRegister();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const nameError = validateFullname(fullname);
    const emailError = validateEmail(email);
    const passError = validatePassword(password);
    const confirmError = validateConfirmPassword(password, confirmPassword);

    if (nameError) newErrors.fullname = nameError;
    if (emailError) newErrors.email = emailError;
    if (passError) newErrors.password = passError;
    if (confirmError) newErrors.confirmPassword = confirmError;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    handleRegister(fullname, email, password);
  };

  return (
    <AuthLayout>
      <a href="/" className="text-base font-semibold text-white mb-2 inline-block">
        ← Về Trang chủ Mravel
      </a>

      <AuthCard title="Tạo tài khoản mới" subtitle="Điền thông tin bên dưới để đăng ký">
        <form onSubmit={handleSubmit} noValidate className="space-y-2">
          {/* Họ và tên */}
          <div>
            <AuthInput
              label="Họ và tên"
              icon={UserIcon}
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
            />
            {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>}
          </div>

          {/* Email */}
          <div>
            <AuthInput
              label="Email"
              icon={EnvelopeIcon}
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Mật khẩu */}
          <div>
            <PasswordInput
              label="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu mạnh (ít nhất 8 ký tự)"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Nhập lại mật khẩu */}
          <div>
            <PasswordInput
              label="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>

          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center mt-2">{message}</p>}
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
