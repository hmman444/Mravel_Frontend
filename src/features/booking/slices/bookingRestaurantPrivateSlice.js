import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getMyUserRestaurantBookings, claimGuestRestaurantBookings } from "../services/restaurantBookingPrivateService";
import i18n from "../../../i18n";

export const fetchMyUserRestaurantBookings = createAsyncThunk(
  "bookingRestaurantPrivate/fetchMyUserRestaurantBookings",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyUserRestaurantBookings();
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || i18n.t("booking.load_user_restaurant_bookings_failed"));
    }
  }
);

export const claimMyGuestRestaurantBookings = createAsyncThunk(
  "bookingRestaurantPrivate/claimMyGuestRestaurantBookings",
  async (_, { rejectWithValue }) => {
    try {
      const claimed = await claimGuestRestaurantBookings();
      return claimed;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || i18n.t("booking.claim_guest_restaurant_bookings_failed"));
    }
  }
);

const slice = createSlice({
  name: "bookingRestaurantPrivate",
  initialState: {
    my: { loading: false, error: null, items: [] },
    claim: { loading: false, error: null, claimed: 0 },
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyUserRestaurantBookings.pending, (s) => {
      s.my.loading = true; s.my.error = null;
    });
    b.addCase(fetchMyUserRestaurantBookings.fulfilled, (s, a) => {
      s.my.loading = false; s.my.items = a.payload || [];
    });
    b.addCase(fetchMyUserRestaurantBookings.rejected, (s, a) => {
      s.my.loading = false; s.my.error = a.payload;
    });

    b.addCase(claimMyGuestRestaurantBookings.pending, (s) => {
      s.claim.loading = true; s.claim.error = null; s.claim.claimed = 0;
    });
    b.addCase(claimMyGuestRestaurantBookings.fulfilled, (s, a) => {
      s.claim.loading = false; s.claim.claimed = a.payload ?? 0;
    });
    b.addCase(claimMyGuestRestaurantBookings.rejected, (s, a) => {
      s.claim.loading = false; s.claim.error = a.payload;
    });
  },
});

export default slice.reducer;