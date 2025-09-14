export const setTokens = (accessToken, refreshToken, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  } else {
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
  }
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
};

export const getAccessToken = () =>
  localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

export const getRefreshToken = () =>
  localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

export const setUser = (user) => {
  const fullName = user.personalInfo?.fullName || "";
  const avatar = user.avatar || "";

  sessionStorage.setItem("user", JSON.stringify({ personalInfo: { fullName }, avatar }));
};

export const getUser = () => {
  return JSON.parse(sessionStorage.getItem("user"));
};

export const clearUser = () => {
  sessionStorage.removeItem("user");
};