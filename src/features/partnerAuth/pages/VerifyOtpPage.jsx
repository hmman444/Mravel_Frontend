import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import { KeyIcon } from "@heroicons/react/24/outline";
import { useVerifyOtp } from "../hooks/useVerifyOtp";
import { validateOtp } from "../../../utils/validators";

export default function VerifyOtpPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const email =
    searchParams.get("email") || localStorage.getItem("partner_last_reg_email") || "";
  const { handleVerifyOtp, message, loading, error } = useVerifyOtp();
  const [otp, setOtp] = useState("");
  const [inputError, setInputError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpError = validateOtp(otp);
    if (otpError) {
      setInputError(otpError);
      return;
    }
    setInputError("");
    handleVerifyOtp(email, otp);
  };

  return (
    <AuthLayout>
      <Link to="/partner/login" className="text-base font-semibold text-white mb-2 inline-block">
        ← {t('partnerAuth.verify_otp.back_to_login')}
      </Link>

      <AuthCard title={t('partnerAuth.verify_otp.title')} subtitle={t('partnerAuth.verify_otp.subtitle', { email })}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthInput
            label={t('partnerAuth.verify_otp.otp_label')}
            icon={KeyIcon}
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder={t('partnerAuth.verify_otp.otp_placeholder')}
          />
          {inputError && <p className="text-red-500 text-sm mt-1">{inputError}</p>}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold disabled:opacity-60"
          >
            {loading ? t('partnerAuth.verify_otp.verifying') : t('partnerAuth.verify_otp.verify')}
          </button>

          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center mt-2">{message}</p>}
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          {t('partnerAuth.verify_otp.not_received')}{" "}
          <Link to="/partner/register" className="text-blue-500">
            {t('partnerAuth.verify_otp.register_again')}
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}