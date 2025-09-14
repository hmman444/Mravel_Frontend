const isEmailValid = (email) => /\S+@\S+\.\S+/.test(email);

const validateRequired = (field, value, minLength = 0) => {
  if (!value || !value.trim()) return `${field} is required`;
  if (minLength > 0 && value.length < minLength) {
    return `${field} must be at least ${minLength} characters`;
  }
  return "";
};

// Login
export const validateLogin = ({ email, password }) => {
  const errors = {};

  const emailError = validateRequired("Email", email);
  if (emailError) errors.email = emailError;
  else if (!isEmailValid(email)) errors.email = "Invalid email format";

  const passwordError = validateRequired("Password", password, 6);
  if (passwordError) errors.password = passwordError;

  return errors;
};

// Register
export const validateRegister = ({ name, email, password, confirmPassword }) => {
  const errors = {};

  const nameError = validateRequired("Name", name, 2);
  if (nameError) errors.name = nameError;

  const emailError = validateRequired("Email", email);
  if (emailError) errors.email = emailError;
  else if (!isEmailValid(email)) errors.email = "Invalid email format";

  const passwordError = validateRequired("Password", password, 6);
  if (passwordError) errors.password = passwordError;

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm Password is required";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

// Email
export const validateEmail = (email) => {
  if (!email) return { email: "Email là bắt buộc" };
  if (!isEmailValid(email)) return { email: "Email không hợp lệ" };
  return {};
};

// Reset Password
export const validateResetPassword = (newPassword) => {
  if (!newPassword) return { newPassword: "Mật khẩu mới là bắt buộc" };
  if (newPassword.length < 6)
    return { newPassword: "Mật khẩu phải dài ít nhất 6 ký tự" };
  return {};
};

// OTP
export const validateOTP = (otp) => {
  if (!otp) return { otp: "OTP là bắt buộc" };
  if (otp.length !== 6) return { otp: "OTP phải có 6 ký tự" };
  return {};
};
