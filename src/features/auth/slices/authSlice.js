import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  login,
  register,
  verifyOtp,
  requestForgotPassword,
  resetPassword,
  logout,
} from "../services/authService";
import { setTokens, getTokens, clearTokens } from "../../../utils/tokenManager";
import { socialLogin, getCurrentUser } from "../services/authService";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    const result = await login(email, password);
    if (result.success) {
      const { accessToken, refreshToken } = result.data;
      setTokens(accessToken, refreshToken, rememberMe);
      return result.data;
    } else {
      console.error("❌ Login failed:", result.message);
      return rejectWithValue(result.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const { refreshToken } = getTokens();
      const result = await logout(refreshToken);
      clearTokens();
      if (result.success) return "Đăng xuất thành công";
      return rejectWithValue(result.message);
    } catch {
      clearTokens();
      return rejectWithValue("Lỗi khi đăng xuất");
    }
  }
);
const { accessToken, refreshToken } = getTokens();

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ fullname, email, password }, { rejectWithValue }) => {
    const result = await register(fullname, email, password);
    if (result.success) return result.message;
    return rejectWithValue(result.message);
  }
);

export const verifyOtpUser = createAsyncThunk(
  "auth/verifyOtpUser",
  async ({ email, otpCode }, { rejectWithValue }) => {
    const result = await verifyOtp(email, otpCode);
    if (result.success) return result.message;
    return rejectWithValue(result.message);
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    const result = await requestForgotPassword(email);
    if (result.success) return result.message;
    return rejectWithValue(result.message);
  }
);

export const resetPasswordAction = createAsyncThunk(
  "auth/resetPasswordAction",
  async ({ email, otpCode, newPassword }, { rejectWithValue }) => {
    const result = await resetPassword(email, otpCode, newPassword);
    if (result.success) return result.message;
    return rejectWithValue(result.message);
  }
);

export const socialLoginUser = createAsyncThunk(
  "auth/socialLoginUser",
  async ({ provider, token, rememberMe }, { rejectWithValue }) => {
    const result = await socialLogin(provider, token);
    if (result.success) {
      const { accessToken, refreshToken } = result.data;
      setTokens(accessToken, refreshToken, rememberMe);
      return result.data;
    } else {
      return rejectWithValue(result.message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.accessToken;
    if (!token) {
      console.warn("⚠️ Không có token trong Redux state");
      return rejectWithValue("Không có token");
    }

    const result = await getCurrentUser(token);

    if (result.success) {
      return result.data; // user info từ backend
    } else {
      console.error("❌ fetchCurrentUser failed:", result.message);
      return rejectWithValue(result.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    accessToken,
    refreshToken,
    role: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    setTokensRedux: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload; // "ADMIN" | "USER"
    },
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.role = action.payload.role;
        state.message = "Đăng nhập thành công!";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(socialLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(socialLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.role = action.payload.role;
        state.message = "Đăng nhập mạng xã hội thành công!";
      })
      .addCase(socialLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(logoutUser.fulfilled, (state, action) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.role = null;
        state.message = action.payload;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.error = action.payload;
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(verifyOtpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(verifyOtpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(resetPasswordAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordAction.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(resetPasswordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // user info từ backend
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
                console.error("❌ [Reducer] fetchCurrentUser.rejected:", action.payload);

        state.loading = false;
        state.error = action.payload;
      });

  },
});

export const { setTokensRedux, setUser, setRole, clearMessage } = authSlice.actions;
export default authSlice.reducer;
