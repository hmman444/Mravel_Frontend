// src/features/admin/slices/adminUserSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAdminUsers, lockUser, unlockUser } from "../services/adminUserService";

const initialState = {
  items: [],
  loading: false,
  toggling: false,
  error: null,
};

const apiMessage = (err) => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  if (err?.response?.status === 401) return "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.";
  return msg || "Có lỗi xảy ra";
};

export const loadAdminUsers = createAsyncThunk(
  "adminUser/loadAdminUsers",
  async (params, { rejectWithValue }) => {
    try {
      return await fetchAdminUsers(params);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const lockUserThunk = createAsyncThunk(
  "adminUser/lockUser",
  async (id, { rejectWithValue }) => {
    try {
      await lockUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const unlockUserThunk = createAsyncThunk(
  "adminUser/unlockUser",
  async (id, { rejectWithValue }) => {
    try {
      await unlockUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

const adminUserSlice = createSlice({
  name: "adminUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(loadAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(lockUserThunk.pending, (state) => {
        state.toggling = true;
      })
      .addCase(lockUserThunk.fulfilled, (state, action) => {
        state.toggling = false;
        const id = action.payload;
        const idx = state.items.findIndex((x) => String(x.id) === String(id));
        if (idx !== -1) state.items[idx] = { ...state.items[idx], status: "LOCKED" };
      })
      .addCase(lockUserThunk.rejected, (state, action) => {
        state.toggling = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(unlockUserThunk.pending, (state) => {
        state.toggling = true;
      })
      .addCase(unlockUserThunk.fulfilled, (state, action) => {
        state.toggling = false;
        const id = action.payload;
        const idx = state.items.findIndex((x) => String(x.id) === String(id));
        if (idx !== -1) state.items[idx] = { ...state.items[idx], status: "ACTIVE" };
      })
      .addCase(unlockUserThunk.rejected, (state, action) => {
        state.toggling = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default adminUserSlice.reducer;
