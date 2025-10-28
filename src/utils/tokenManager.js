export const setTokens = (accessToken, refreshToken, rememberMe) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("accessToken", accessToken);
  storage.setItem("refreshToken", refreshToken);
};

export const getTokens = () => {
  const accessToken =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  const refreshToken =
    localStorage.getItem("refreshToken") ||
    sessionStorage.getItem("refreshToken");
  return { accessToken, refreshToken };
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
};