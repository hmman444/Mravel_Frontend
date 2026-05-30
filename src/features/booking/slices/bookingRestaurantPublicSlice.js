// src/features/booking/slices/bookingRestaurantPublicSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getMyGuestRestaurantBookings,
  lookupGuestRestaurantBooking,
  clearGuestRestaurantBookings,
} from "../services/restaurantBookingPublicService";
import i18n from "../../../i18n";

export const fetchGuestMyRestaurantBookings = createAsyncThunk(
  "bookingRestaurantPublic/fetchGuestMyRestaurantBookings",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyGuestRestaurantBookings();
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || i18n.t("booking.load_restaurant_bookings_failed"));
    }
  }
);

export const lookupRestaurantBookingPublic = createAsyncThunk(
  "bookingRestaurantPublic/lookupRestaurantBookingPublic",
  async (payload, { rejectWithValue }) => {
    try {
      const result = await lookupGuestRestaurantBooking(payload);
      return { result, scope: "LOOKUP" }; // hoặc PUBLIC
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || i18n.t("booking.lookup_failed"));
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
      return rejectWithValue(e?.response?.data?.message || i18n.t("booking.clear_failed"));
    }
  }
);

const slice = createSlice({
  name: "bookingRestaurantPublic",
  initialState: {
    my: { loading: false, error: null, items: [] },
    //  thêm scope
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