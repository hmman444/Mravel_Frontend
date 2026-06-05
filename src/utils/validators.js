import i18n from "../i18n";

export const validateEmail = (email) => {
  if (!email.trim()) return i18n.t("validation.email_required");
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) return i18n.t("validation.email_invalid");
  return "";
};

export const validateFullname = (fullname) => {
  if (!fullname.trim()) return i18n.t("validation.fullname_required");
  if (fullname.length < 3) return i18n.t("validation.fullname_min");
  return "";
};

export const validatePassword = (password) => {
  if (!password.trim()) return i18n.t("validation.password_required");
  if (password.length < 8) return i18n.t("validation.password_min");
  if (!/[A-Z]/.test(password)) return i18n.t("validation.password_uppercase");
  if (!/[a-z]/.test(password)) return i18n.t("validation.password_lowercase");
  if (!/[0-9]/.test(password)) return i18n.t("validation.password_digit");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return i18n.t("validation.password_special");
  return "";
};

export const validateOtp = (otp) => {
  if (!otp.trim()) return i18n.t("validation.otp_required");
  if (!/^\d{6}$/.test(otp)) return i18n.t("validation.otp_format");
  return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword.trim()) return i18n.t("validation.confirm_password_required");
  if (password !== confirmPassword)
    return i18n.t("validation.confirm_password_mismatch");
  return "";
};
