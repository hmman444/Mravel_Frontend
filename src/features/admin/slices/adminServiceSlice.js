import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAdminHotels,
  fetchAdminRestaurants,
  approveHotel,
  rejectHotel,
  blockHotel,
  unblockHotel,
  approveRestaurant,
  rejectRestaurant,
  blockRestaurant,
  unblockRestaurant,
  fetchAdminHotelById,
} from "../services/adminCatalogService";

const apiMessage = (err) => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  if (err?.response?.status === 401) return "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.";
  return msg || "Có lỗi xảy ra";
};

const initialState = {
  mode: "HOTEL",
  items: [],
  loading: false,

  // NEW
  selected: null,
  detailLoading: false,

  acting: false,
  actionError: null,
  error: null,
  lastQuery: null,
};

export const loadAdminServices = createAsyncThunk(
  "adminService/loadAdminServices",
  async ({ mode, params }, { rejectWithValue }) => {
    try {
      if (mode === "RESTAURANT") return await fetchAdminRestaurants(params);
      return await fetchAdminHotels(params);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const actOnService = createAsyncThunk(
  "adminService/actOnService",
  async ({ mode, action, id, reason }, { rejectWithValue }) => {
    try {
      // HOTEL actions
      if (mode === "HOTEL") {
        if (action === "APPROVE") return await approveHotel(id);
        if (action === "REJECT") return await rejectHotel(id, reason);
        if (action === "BLOCK") return await blockHotel(id, reason);
        if (action === "UNBLOCK") return await unblockHotel(id);
      }

      // RESTAURANT actions
      if (mode === "RESTAURANT") {
        if (action === "APPROVE") return await approveRestaurant(id);
        if (action === "REJECT") return await rejectRestaurant(id, reason);
        if (action === "BLOCK") return await blockRestaurant(id, reason);
        if (action === "UNBLOCK") return await unblockRestaurant(id);
      }

      throw new Error("Unsupported action");
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const loadAdminHotelDetail = createAsyncThunk(
  "adminService/loadAdminHotelDetail",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchAdminHotelById(id);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

const adminServiceSlice = createSlice({
  name: "adminService",
  initialState,
  reducers: {
    setMode(state, action) {
      state.mode = action.payload;
    },
    clearError(state) {
      state.error = null;
      state.actionError = null;
    },
    clearSelected(state) {          // NEW
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOAD LIST
      .addCase(loadAdminServices.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastQuery = action.meta.arg;
      })
      .addCase(loadAdminServices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.content ?? action.payload ?? [];
      })
      .addCase(loadAdminServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // LOAD DETAIL (HOTEL)
      .addCase(loadAdminHotelDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(loadAdminHotelDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selected = action.payload;
      })
      .addCase(loadAdminHotelDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || action.error.message;
      })

      // ACTION (approve/reject/block/unblock)
      .addCase(actOnService.pending, (state) => {
        state.acting = true;
        state.actionError = null;
      })
      .addCase(actOnService.fulfilled, (state, action) => {
        state.acting = false;

        const updated = action.payload;

        // update row list
        const idx = state.items.findIndex((x) => x.id === updated?.id);
        if (idx !== -1) state.items[idx] = updated;

        // update selected detail if matching
        if (state.selected?.id && state.selected.id === updated?.id) {
          state.selected = updated;
        }
      })
      .addCase(actOnService.rejected, (state, action) => {
        state.acting = false;
        state.actionError = action.payload || action.error.message;
      });
  },
});

export const { setMode, clearError, clearSelected } = adminServiceSlice.actions;
export default adminServiceSlice.reducer;