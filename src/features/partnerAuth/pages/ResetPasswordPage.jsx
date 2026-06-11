import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const email =
    searchParams.get("email") || localStorage.getItem("partner_last_fp_email") || "";

  const { handleResetPassword, loading, error, message } = useResetPassword();
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
      <LoadingOverlay show={loading} text={t("common.processing")} />

      <Link to="/partner/login" className="text-base font-semibold text-white mb-2 inline-block">
        ← {t("partnerAuth.reset_password.back_to_login")}
      </Link>

      <AuthCard title={t("partnerAuth.reset_password.title")} subtitle={t("partnerAuth.reset_password.subtitle", { email })}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <AuthInput
              label={t("partnerAuth.reset_password.otp_label")}
              icon={KeyIcon}
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder={t("partnerAuth.reset_password.otp_placeholder")}
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
                {cooldown > 0 ? t("partnerAuth.reset_password.resend_cooldown", { cooldown }) : t("partnerAuth.reset_password.resend_otp")}
              </button>
            </div>
          </div>

          <div>
            <PasswordInput
              label={t("partnerAuth.reset_password.new_password_label")}
              icon={LockClosedIcon}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("partnerAuth.reset_password.new_password_placeholder")}
            />
            {inputErrors.password && <p className="text-red-500 text-sm">{inputErrors.password}</p>}
          </div>

          <div>
            <PasswordInput
              label={t("partnerAuth.reset_password.confirm_password_label")}
              icon={LockClosedIcon}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("partnerAuth.reset_password.confirm_password_placeholder")}
            />
            {inputErrors.confirm && <p className="text-red-500 text-sm">{inputErrors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold disabled:opacity-60"
          >
            {t("common.confirm")}
          </button>

          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center mt-2">{message}</p>}
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          <Link to="/partner/login" className="text-blue-500">
            {t("partnerAuth.reset_password.back_to_login_link")}
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}