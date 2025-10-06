import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import PasswordInput from "../components/PasswordInput";
import { KeyIcon, LockClosedIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useResetPassword } from "../hooks/useResetPassword";
import { useForgotPassword } from "../hooks/useForgotPassword"; // dùng lại resend OTP
import LoadingOverlay from "../../../components/LoadingOverlay";
import { toast } from "react-toastify";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email =
    searchParams.get("email") ||
    localStorage.getItem("last_fp_email") ||
    "";

  const { handleResetPassword, loading, error } = useResetPassword();
  const { handleForgot, cooldown } = useForgotPassword(); // dùng cho resend OTP

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inputErrors, setInputErrors] = useState({});

  useEffect(() => {
    // reset input khi load lại trang
    setOtp("");
    setPassword("");
    setConfirmPassword("");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!otp.trim()) newErrors.otp = "Vui lòng nhập mã OTP.";
    if (!password.trim()) newErrors.password = "Vui lòng nhập mật khẩu mới.";
    if (password !== confirmPassword)
      newErrors.confirm = "Mật khẩu nhập lại không khớp.";

    setInputErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    handleResetPassword(email, otp, password);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    await handleForgot(email);
    toast.success("OTP mới đã được gửi đến email của bạn!");
  };

  return (
    <AuthLayout>
      <LoadingOverlay show={loading} text="Vui lòng chờ trong giây lát..." />

      <Link to="/" className="text-base font-semibold text-white mb-2 inline-block">
        ← Về Trang chủ Mravel
      </Link>

      <AuthCard
        title="Đặt lại mật khẩu"
        subtitle={`Nhập mã OTP được gửi tới email: ${email}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ô nhập OTP */}
          <div>
            <AuthInput
              label="Mã OTP"
              icon={KeyIcon}
              type="text"
              name="otpCode"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã OTP"
              required
            />
            {inputErrors.otp && <p className="text-red-500 text-sm">{inputErrors.otp}</p>}

            {/* Nút gửi lại OTP */}
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0}
                className={`flex items-center gap-1 text-sm ${
                  cooldown > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-500 hover:underline"
                }`}
              >
                <ArrowPathIcon className="w-4 h-4" />
                {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại mã OTP"}
              </button>
            </div>
          </div>

          {/* Ô nhập mật khẩu */}
          <div>
            <PasswordInput
              label="Mật khẩu mới"
              icon={LockClosedIcon}
              name="newPassword"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              required
            />
            {inputErrors.password && (
              <p className="text-red-500 text-sm">{inputErrors.password}</p>
            )}
          </div>

          {/* Ô nhập lại mật khẩu */}
          <div>
            <PasswordInput
              label="Nhập lại mật khẩu"
              icon={LockClosedIcon}
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu mới"
              required
            />
            {inputErrors.confirm && (
              <p className="text-red-500 text-sm">{inputErrors.confirm}</p>
            )}
          </div>

          {/* Nút xác nhận */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold disabled:opacity-60"
          >
            Xác nhận
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          <Link to="/login" className="text-blue-500">
            Quay lại đăng nhập
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
