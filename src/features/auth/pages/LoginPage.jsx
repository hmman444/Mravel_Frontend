import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import PasswordInput from "../components/PasswordInput";
import SocialLogin from "../components/SocialLogin";
import { UserIcon } from "@heroicons/react/24/outline";
import { useLogin } from "../hooks/useLogin";
import { validateEmail, validatePassword } from "../../../utils/validators";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { useLocation, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const { handleLogin, loading, error } = useLogin();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectParam = new URLSearchParams(location.search).get("redirect");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const emailError = validateEmail(email);
    const passError = validatePassword(password);

    if (emailError) newErrors.email = emailError;
    if (passError) newErrors.password = passError;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const {ok, role} = await handleLogin(email, password, rememberMe);

    if (ok) {
      if (redirectParam) {
        const redirectPath = decodeURIComponent(redirectParam);
        navigate(redirectPath);
        return;
      }

      navigate(role === "ADMIN" ? "/admin" : "/");
    }
  };

  return (
    <AuthLayout>
      <LoadingOverlay show={loading} text="Đang đăng nhập..." />

      <a
        href="/"
        className="text-base font-semibold text-white mb-2 inline-block"
      >
        ← Về Trang chủ Mravel
      </a>

      <AuthCard
        title="Tận hưởng kỳ nghỉ của bạn"
        subtitle="Đăng nhập với email và mật khẩu"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <AuthInput
              label="Email"
              icon={UserIcon}
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <PasswordInput
              label="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu của bạn"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="rounded accent-blue-600"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
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

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
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
