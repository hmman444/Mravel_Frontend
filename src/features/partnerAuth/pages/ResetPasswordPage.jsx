import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import PasswordInput from "../components/PasswordInput";
import { KeyIcon, LockClosedIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useResetPassword } from "../hooks/useResetPassword";
import { useForgotPassword } from "../hooks/useForgotPassword";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { validatePassword, validateConfirmPassword, validateOtp } from "../../../utils/validators";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email =
    searchParams.get("email") || localStorage.getItem("partner_last_fp_email") || "";

  const { handleResetPassword, loading, error } = useResetPassword();
  const { handleForgot, cooldown } = useForgotPassword();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inputErrors, setInputErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const otpError = validateOtp(otp);
    const passError = validatePassword(password);
    const confirmError = validateConfirmPassword(password, confirmPassword);

    if (otpError) newErrors.otp = otpError;
    if (passError) newErrors.password = passError;
    if (confirmError) newErrors.confirm = confirmError;

    setInputErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    handleResetPassword(email, otp, password);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    await handleForgot(email);
  };

  return (
    <AuthLayout>
      <LoadingOverlay show={loading} text="Đang xử lý..." />

      <Link to="/partner/login" className="text-base font-semibold text-white mb-2 inline-block">
        ← Về đăng nhập đối tác
      </Link>

      <AuthCard title="Đặt lại mật khẩu" subtitle={`Nhập mã OTP được gửi tới email: ${email}`}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <AuthInput
              label="Mã OTP"
              icon={KeyIcon}
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã OTP"
            />
            {inputErrors.otp && <p className="text-red-500 text-sm">{inputErrors.otp}</p>}

            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0}
                className={`flex items-center gap-1 text-sm ${
                  cooldown > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:underline"
                }`}
              >
                <ArrowPathIcon className="w-4 h-4" />
                {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại mã OTP"}
              </button>
            </div>
          </div>

          <div>
            <PasswordInput
              label="Mật khẩu mới"
              icon={LockClosedIcon}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
            />
            {inputErrors.password && <p className="text-red-500 text-sm">{inputErrors.password}</p>}
          </div>

          <div>
            <PasswordInput
              label="Nhập lại mật khẩu"
              icon={LockClosedIcon}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
            />
            {inputErrors.confirm && <p className="text-red-500 text-sm">{inputErrors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold disabled:opacity-60"
          >
            Xác nhận
          </button>

          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          <Link to="/partner/login" className="text-blue-500">
            Quay lại đăng nhập
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}