import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getMyUserBookings, claimGuestBookings } from "../services/bookingPrivateService";

export const fetchMyUserBookings = createAsyncThunk(
  "bookingPrivate/fetchMyUserBookings",
  async (userId, { rejectWithValue }) => {
    try {
      return await getMyUserBookings(userId);
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Không tải được đơn theo tài khoản");
    }
  }
);

export const claimMyGuestBookings = createAsyncThunk(
  "bookingPrivate/claimMyGuestBookings",
  async (userId, { rejectWithValue }) => {
    try {
      const claimed = await claimGuestBookings(userId);
      return claimed; // number
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Gộp đơn thất bại");
    }
  }
);

const slice = createSlice({
  name: "bookingPrivate",
  initialState: {
    my: { loading: false, error: null, items: [] },
    claim: { loading: false, error: null, claimed: 0 },
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyUserBookings.pending, (s) => {
      s.my.loading = true; s.my.error = null;
    });
    b.addCase(fetchMyUserBookings.fulfilled, (s, a) => {
      s.my.loading = false; s.my.items = a.payload || [];
    });
    b.addCase(fetchMyUserBookings.rejected, (s, a) => {
      s.my.loading = false; s.my.error = a.payload;
    });

    b.addCase(claimMyGuestBookings.pending, (s) => {
      s.claim.loading = true; s.claim.error = null; s.claim.claimed = 0;
    });
    b.addCase(claimMyGuestBookings.fulfilled, (s, a) => {
      s.claim.loading = false; s.claim.claimed = a.payload ?? 0;
    });
    b.addCase(claimMyGuestBookings.rejected, (s, a) => {
      s.claim.loading = false; s.claim.error = a.payload;
    });
  },
});

export default slice.reducer;