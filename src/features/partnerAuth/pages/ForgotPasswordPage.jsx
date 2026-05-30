import { useState } from "react";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useForgotPassword } from "../hooks/useForgotPassword";
import LoadingOverlay from "../../../components/LoadingOverlay";
import { validateEmail } from "../../../utils/validators";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const { handleForgot, message, loading, error, cooldown } = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    handleForgot(email);
  };

  return (
    <AuthLayout>
      <LoadingOverlay show={loading} text={t("partnerAuth.forgot.sending_otp")} />

      <a href="/partner/login" className="text-base font-semibold text-white mb-2 inline-block">
        ← {t("partnerAuth.forgot.back_to_login")}
      </a>

      <AuthCard title={t("partnerAuth.forgot.title")} subtitle={t("partnerAuth.forgot.subtitle")}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <AuthInput
              label={t("common.email")}
              type="text"
              icon={EnvelopeIcon}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("partnerAuth.forgot.email_placeholder")}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold disabled:opacity-60"
          >
            {cooldown > 0 ? t("partnerAuth.forgot.resend_otp_in", { n: cooldown }) : t("partnerAuth.forgot.send_otp")}
          </button>

          {error && !errors.email && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
          {message && !error && (
            <p className="text-green-600 text-sm text-center mt-2">{message}</p>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          <a href="/partner/login" className="text-blue-500">
            {t("partnerAuth.forgot.back_to_login_link")}
          </a>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}