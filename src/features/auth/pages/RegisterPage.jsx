import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        ← {t('auth.back_to_home')}
      </a>

      <AuthCard title={t('auth.create_new_account')} subtitle={t('auth.fill_info_to_register')}>
        <form onSubmit={handleSubmit} noValidate className="space-y-2">
          {/* Họ và tên */}
          <div>
            <AuthInput
              label={t('auth.fullname')}
              icon={UserIcon}
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder={t('auth.fullname_placeholder')}
            />
            {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>}
          </div>

          {/* Email */}
          <div>
            <AuthInput
              label={t('common.email')}
              icon={EnvelopeIcon}
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email_placeholder')}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Mật khẩu */}
          <div>
            <PasswordInput
              label={t('common.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.password_placeholder')}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Nhập lại mật khẩu */}
          <div>
            <PasswordInput
              label={t('auth.confirm_password')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirm_password_placeholder')}
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
            {loading ? t('common.processing') : t('common.register')}
          </button>

          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center mt-2">{message}</p>}
        </form>

        <SocialLogin />

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          {t('auth.already_have_account')}{" "}
          <a href="/login" className="text-blue-500">
            {t('auth.login_now')}
          </a>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
