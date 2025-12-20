// src/utils/partnerTokenManager.js
export const setPartnerTokens = (accessToken, refreshToken, rememberMe) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("partnerAccessToken", accessToken);
  storage.setItem("partnerRefreshToken", refreshToken);
};

export const getPartnerTokens = () => {
  const accessToken =
    localStorage.getItem("partnerAccessToken") ||
    sessionStorage.getItem("partnerAccessToken");
  const refreshToken =
    localStorage.getItem("partnerRefreshToken") ||
    sessionStorage.getItem("partnerRefreshToken");
  return { accessToken, refreshToken };
};

export const clearPartnerTokens = () => {
  localStorage.removeItem("partnerAccessToken");
  localStorage.removeItem("partnerRefreshToken");
  sessionStorage.removeItem("partnerAccessToken");
  sessionStorage.removeItem("partnerRefreshToken");
};