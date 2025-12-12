// src/features/user/slices/userProfileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateMyProfile } from "../services/userProfileService";
import { getTokens } from "../../../utils/tokenManager";
import { setUser } from "../../auth/slices/authSlice";

export const updateUserProfile = createAsyncThunk(
  "userProfile/updateUserProfile",
  async (payload, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const accessTokenFromState = state.auth?.accessToken;
    const { accessToken: accessTokenFromStorage } = getTokens();
    const accessToken = accessTokenFromState || accessTokenFromStorage;

    if (!accessToken) {
      return rejectWithValue("Không có token, vui lòng đăng nhập lại.");
    }

    const result = await updateMyProfile(payload);

    if (result.success) {
      // Cập nhật lại auth.user để toàn app dùng chung data mới
      dispatch(setUser(result.data));
      return result.data;
    } else {
      return rejectWithValue(result.message || "Cập nhật hồ sơ thất bại.");
    }
  }
);

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState: {
    saving: false,
    error: null,
    success: null,
  },
  reducers: {
    clearUserProfileStatus: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateUserProfile.fulfilled, (state) => {
        state.saving = false;
        state.success = "Cập nhật hồ sơ thành công!";
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserProfileStatus } = userProfileSlice.actions;
export default userProfileSlice.reducer;