export const validateEmail = (email) => {
  if (!email.trim()) return "Email không được để trống";
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) return "Địa chỉ email không hợp lệ";
  return "";
};

export const validateFullname = (fullname) => {
  if (!fullname.trim()) return "Họ và tên không được để trống";
  if (fullname.length < 3) return "Họ và tên phải có ít nhất 3 ký tự";
  return "";
};

export const validatePassword = (password) => {
  if (!password.trim()) return "Mật khẩu không được để trống";
  if (password.length < 8)
    return "Mật khẩu phải có ít nhất 8 ký tự";
  if (!/[A-Z]/.test(password))
    return "Mật khẩu phải chứa ít nhất một chữ hoa";
  if (!/[a-z]/.test(password))
    return "Mật khẩu phải chứa ít nhất một chữ thường";
  if (!/[0-9]/.test(password))
    return "Mật khẩu phải chứa ít nhất một số";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt";
  return "";
};

export const validateOtp = (otp) => {
  if (!otp.trim()) return "Mã OTP không được để trống";
  if (!/^\d{6}$/.test(otp)) return "Mã OTP phải gồm 6 chữ số";
  return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword.trim()) return "Vui lòng nhập lại mật khẩu";
  if (password !== confirmPassword)
    return "Mật khẩu nhập lại không khớp";
  return "";
};
