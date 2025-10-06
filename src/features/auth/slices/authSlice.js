import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  login,
  register,
  verifyOtp,
  requestForgotPassword,
  resetPassword,
} from "../services/authService";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    const result = await login(email, password);
    if (result.success) {
      localStorage.setItem("token", result.data.token);
      return result.data;
    } else {
      return rejectWithValue(result.message);
    }
  }
);

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

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.message = null;
      state.error = null;
      localStorage.removeItem("token");
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
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.message = "Đăng nhập thành công!";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
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
      });
  },
});

export const { logout, clearMessage } = authSlice.actions;
export default authSlice.reducer;
