// src/features/partnerAuth/slices/partnerAuthSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  partnerLogin,
  partnerRegister,
  partnerVerifyOtp,
  partnerRequestForgotPassword,
  partnerResetPassword,
  partnerLogout,
  partnerSocialLogin,
  getCurrentPartner,
} from "../services/partnerAuthService";

import {
  setPartnerTokens,
  getPartnerTokens,
  clearPartnerTokens,
} from "../../../utils/partnerTokenManager";

export const partnerLoginUser = createAsyncThunk(
  "partnerAuth/login",
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    const result = await partnerLogin(email, password);
    if (result.success) {
      const { accessToken, refreshToken } = result.data;
      setPartnerTokens(accessToken, refreshToken, rememberMe);
      return result.data;
    }
    return rejectWithValue(result.message);
  }
);

export const partnerLogoutUser = createAsyncThunk(
  "partnerAuth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { refreshToken } = getPartnerTokens();
      const result = await partnerLogout(refreshToken);
      clearPartnerTokens();
      if (result.success) return "Đăng xuất đối tác thành công";
      return rejectWithValue(result.message);
    } catch {
      clearPartnerTokens();
      return rejectWithValue("Lỗi khi đăng xuất");
    }
  }
);

export const partnerRegisterUser = createAsyncThunk(
  "partnerAuth/register",
  async ({ fullname, email, password }, { rejectWithValue }) => {
    const result = await partnerRegister(fullname, email, password);
    if (result.success) return result.message;
    return rejectWithValue(result.message);
  }
);

export const partnerVerifyOtpUser = createAsyncThunk(
  "partnerAuth/verifyOtp",
  async ({ email, otpCode }, { rejectWithValue }) => {
    const result = await partnerVerifyOtp(email, otpCode);
    if (result.success) return result.message;
    return rejectWithValue(result.message);
  }
);

export const partnerForgotPassword = createAsyncThunk(
  "partnerAuth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    const result = await partnerRequestForgotPassword(email);
    if (result.success) return result.message;
    return rejectWithValue(result.message);
  }
);

export const partnerResetPasswordAction = createAsyncThunk(
  "partnerAuth/resetPassword",
  async ({ email, otpCode, newPassword }, { rejectWithValue }) => {
    const result = await partnerResetPassword(email, otpCode, newPassword);
    if (result.success) return result.message;
    return rejectWithValue(result.message);
  }
);

export const partnerSocialLoginUser = createAsyncThunk(
  "partnerAuth/socialLogin",
  async ({ provider, token, rememberMe }, { rejectWithValue }) => {
    const result = await partnerSocialLogin(provider, token);
    if (result.success) {
      const { accessToken, refreshToken } = result.data;
      setPartnerTokens(accessToken, refreshToken, rememberMe);
      return result.data;
    }
    return rejectWithValue(result.message);
  }
);

export const fetchCurrentPartner = createAsyncThunk(
  "partnerAuth/me",
  async (_, { rejectWithValue }) => {
    const result = await getCurrentPartner();
    if (!result?.success) return rejectWithValue(result?.message || "Không lấy được thông tin đối tác");

    return result.data;
  }
);

const { accessToken, refreshToken } = getPartnerTokens();

const partnerAuthSlice = createSlice({
  name: "partnerAuth",
  initialState: {
    partner: null,
    accessToken,
    refreshToken,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    setPartnerTokensRedux: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setPartnerUser: (state, action) => {
      state.partner = action.payload;
    },
    clearPartnerMessage: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(partnerLoginUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(partnerLoginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.accessToken = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
        s.message = "Đăng nhập đối tác thành công!";
      })
      .addCase(partnerLoginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(partnerSocialLoginUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(partnerSocialLoginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.accessToken = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
        s.message = "Đăng nhập mạng xã hội thành công!";
      })
      .addCase(partnerSocialLoginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(partnerLogoutUser.fulfilled, (s, a) => {
        s.accessToken = null;
        s.refreshToken = null;
        s.partner = null;
        s.message = a.payload;
      })
      .addCase(partnerLogoutUser.rejected, (s, a) => {
        s.accessToken = null;
        s.refreshToken = null;
        s.partner = null;
        s.error = a.payload;
      })

      .addCase(partnerRegisterUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(partnerRegisterUser.fulfilled, (s, a) => {
        s.loading = false;
        s.message = a.payload;
      })
      .addCase(partnerRegisterUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(partnerVerifyOtpUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(partnerVerifyOtpUser.fulfilled, (s, a) => {
        s.loading = false;
        s.message = a.payload;
      })
      .addCase(partnerVerifyOtpUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(partnerForgotPassword.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(partnerForgotPassword.fulfilled, (s, a) => {
        s.loading = false;
        s.message = a.payload;
      })
      .addCase(partnerForgotPassword.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(partnerResetPasswordAction.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(partnerResetPasswordAction.fulfilled, (s, a) => {
        s.loading = false;
        s.message = a.payload;
      })
      .addCase(partnerResetPasswordAction.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchCurrentPartner.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchCurrentPartner.fulfilled, (s, a) => {
        s.loading = false;
        s.partner = a.payload;
      })
      .addCase(fetchCurrentPartner.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export const { setPartnerTokensRedux, setPartnerUser, clearPartnerMessage } =
  partnerAuthSlice.actions;

export default partnerAuthSlice.reducer;