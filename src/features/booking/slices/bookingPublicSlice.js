import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getMyGuestBookings, lookupGuestBooking, clearGuestBookings } from "../services/bookingPublicService";

export const fetchGuestMyBookings = createAsyncThunk(
  "bookingPublic/fetchGuestMyBookings",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyGuestBookings();
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Không tải được danh sách đơn");
    }
  }
);

export const lookupBookingPublic = createAsyncThunk(
  "bookingPublic/lookupBookingPublic",
  async (payload, { rejectWithValue }) => {
    try {
      return await lookupGuestBooking(payload);
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Tra cứu thất bại");
    }
  }
);

export const clearGuestDevice = createAsyncThunk(
  "bookingPublic/clearGuestDevice",
  async (_, { rejectWithValue }) => {
    try {
      await clearGuestBookings();
      return true;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Xoá thất bại");
    }
  }
);

const slice = createSlice({
  name: "bookingPublic",
  initialState: {
    my: { loading: false, error: null, items: [] },
    lookup: { loading: false, error: null, result: null, scope: "PUBLIC" },
  },
  reducers: {
    clearLookup(state) {
      state.lookup.result = null;
      state.lookup.error = null;
      state.lookup.scope = "PUBLIC";
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchGuestMyBookings.pending, (s) => {
      s.my.loading = true; s.my.error = null;
    });
    b.addCase(fetchGuestMyBookings.fulfilled, (s, a) => {
      s.my.loading = false; s.my.items = a.payload || [];
    });
    b.addCase(fetchGuestMyBookings.rejected, (s, a) => {
      s.my.loading = false; s.my.error = a.payload;
    });

    b.addCase(lookupBookingPublic.pending, (s) => {
      s.lookup.loading = true; s.lookup.error = null; s.lookup.result = null;
    });
    b.addCase(lookupBookingPublic.fulfilled, (s, a) => {
      s.lookup.loading = false; s.lookup.result = a.payload || null;
    });
    b.addCase(lookupBookingPublic.rejected, (s, a) => {
      s.lookup.loading = false; s.lookup.error = a.payload;
    });

    b.addCase(clearGuestDevice.fulfilled, (s) => {
      s.my.items = [];
    });
  },
});

export const { clearLookup } = slice.actions;
export default slice.reducer;