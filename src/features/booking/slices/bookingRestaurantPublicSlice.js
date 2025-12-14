// src/features/booking/slices/bookingRestaurantPublicSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getMyGuestRestaurantBookings,
  lookupGuestRestaurantBooking,
  clearGuestRestaurantBookings,
  getUserRestaurantBookingDetail,
} from "../services/restaurantBookingPublicService";

export const fetchGuestMyRestaurantBookings = createAsyncThunk(
  "bookingRestaurantPublic/fetchGuestMyRestaurantBookings",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyGuestRestaurantBookings();
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Không tải được danh sách đơn đặt bàn");
    }
  }
);

export const lookupRestaurantBookingPublic = createAsyncThunk(
  "bookingRestaurantPublic/lookupRestaurantBookingPublic",
  async (payload, { rejectWithValue, getState }) => {
    try {
      const result = await lookupGuestRestaurantBooking(payload);
      return { result, scope: "PUBLIC" };
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Tra cứu thất bại";
      const status = e?.response?.status;

      const { auth } = getState() || {};
      const isLoggedIn = !!auth?.accessToken && !!auth?.user?.id;

      // chỉ fallback khi login + đúng case “thuộc tài khoản”
      const isBelongsToAccount =
        status === 409 || /thuộc tài khoản/i.test(msg);

      if (isLoggedIn && isBelongsToAccount) {
        try {
          const detail = await getUserRestaurantBookingDetail(payload.bookingCode);
          return { result: detail, scope: "PRIVATE" };
        } catch (e2) {
          const msg2 = e2?.response?.data?.message || e2?.message || msg;
          return rejectWithValue(msg2);
        }
      }

      return rejectWithValue(msg);
    }
  }
);

export const clearRestaurantGuestDevice = createAsyncThunk(
  "bookingRestaurantPublic/clearRestaurantGuestDevice",
  async (_, { rejectWithValue }) => {
    try {
      await clearGuestRestaurantBookings();
      return true;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Xoá thất bại");
    }
  }
);

const slice = createSlice({
  name: "bookingRestaurantPublic",
  initialState: {
    my: { loading: false, error: null, items: [] },
    // ✅ thêm scope
    lookup: { loading: false, error: null, result: null, scope: "PUBLIC" },
  },
  reducers: {
    clearRestaurantLookup(state) {
      state.lookup.result = null;
      state.lookup.error = null;
      state.lookup.scope = "PUBLIC";
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchGuestMyRestaurantBookings.pending, (s) => {
      s.my.loading = true; s.my.error = null;
    });
    b.addCase(fetchGuestMyRestaurantBookings.fulfilled, (s, a) => {
      s.my.loading = false; s.my.items = a.payload || [];
    });
    b.addCase(fetchGuestMyRestaurantBookings.rejected, (s, a) => {
      s.my.loading = false; s.my.error = a.payload;
    });

    b.addCase(lookupRestaurantBookingPublic.pending, (s) => {
      s.lookup.loading = true;
      s.lookup.error = null;
      s.lookup.result = null;
      s.lookup.scope = "PUBLIC";
    });
    b.addCase(lookupRestaurantBookingPublic.fulfilled, (s, a) => {
      s.lookup.loading = false;
      s.lookup.result = a.payload?.result || null;
      s.lookup.scope = a.payload?.scope || "PUBLIC";
    });
    b.addCase(lookupRestaurantBookingPublic.rejected, (s, a) => {
      s.lookup.loading = false;
      s.lookup.error = a.payload;
      // scope giữ nguyên PUBLIC là ok
    });

    b.addCase(clearRestaurantGuestDevice.fulfilled, (s) => {
      s.my.items = [];
    });
  },
});

export const { clearRestaurantLookup } = slice.actions;
export default slice.reducer;