import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import i18n from "../../../i18n";
import {
  getPartnerMe,

  listPartnerHotels,
  createPartnerHotel,
  updatePartnerHotel,
  softDeletePartnerHotel,
  pausePartnerHotel,
  resumePartnerHotel,
  requestUnlockPartnerHotel,

  listPartnerRestaurants,
  createPartnerRestaurant,
  updatePartnerRestaurant,
  softDeletePartnerRestaurant,
  pausePartnerRestaurant,
  resumePartnerRestaurant,
  requestUnlockPartnerRestaurant,

  listPartnerHotelBookings,
  getPartnerHotelBookingDetail,
  cancelPartnerHotelBooking,

  listPartnerRestaurantBookings,
  getPartnerRestaurantBookingDetail,
  cancelPartnerRestaurantBooking,

  getPartnerStatsByStatus,
  getPartnerRevenue,
} from "../services/partnerService";

/* == THUNKS == */

// ME
export const fetchPartnerMe = createAsyncThunk(
  "partner/me",
  async (_, { rejectWithValue }) => {
    const res = await getPartnerMe();
    if (res.success) return res.data;
    return rejectWithValue(res.message || i18n.t("partner.error.load_partner_info"));
  }
);

// SERVICES (list)
export const fetchPartnerHotels = createAsyncThunk(
  "partner/fetchHotels",
  async (params, { rejectWithValue }) => {
    const res = await listPartnerHotels(params);
    if (res.success) return { data: res.data, params };
    return rejectWithValue(res.message || i18n.t("partner.error.load_hotels"));
  }
);

export const fetchPartnerRestaurants = createAsyncThunk(
  "partner/fetchRestaurants",
  async (params, { rejectWithValue }) => {
    const res = await listPartnerRestaurants(params);
    if (res.success) return { data: res.data, params };
    return rejectWithValue(res.message || i18n.t("partner.error.load_restaurants"));
  }
);

// SERVICES (mutations) — sau khi gọi xong, thường refresh list theo tab hiện tại
export const partnerCreateHotel = createAsyncThunk(
  "partner/createHotel",
  async (payload, { rejectWithValue }) => {
    const res = await createPartnerHotel(payload);
    if (res.success) return res.data;
    return rejectWithValue(res.message || i18n.t("partner.error.create_hotel"));
  }
);

export const partnerUpdateHotel = createAsyncThunk(
  "partner/updateHotel",
  async ({ id, payload }, { rejectWithValue }) => {
    const res = await updatePartnerHotel(id, payload);
    if (res.success) return res.data;
    return rejectWithValue(res.message || i18n.t("partner.error.update_hotel"));
  }
);

export const partnerDeleteHotel = createAsyncThunk(
  "partner/deleteHotel",
  async (id, { rejectWithValue }) => {
    const res = await softDeletePartnerHotel(id);
    if (res.success) return { id };
    return rejectWithValue(res.message || i18n.t("partner.error.delete_hotel"));
  }
);

export const partnerPauseHotel = createAsyncThunk(
  "partner/pauseHotel",
  async (id, { rejectWithValue }) => {
    const res = await pausePartnerHotel(id);
    if (res.success) return { id };
    return rejectWithValue(res.message || i18n.t("partner.error.pause_hotel"));
  }
);

export const partnerResumeHotel = createAsyncThunk(
  "partner/resumeHotel",
  async (id, { rejectWithValue }) => {
    const res = await resumePartnerHotel(id);
    if (res.success) return { id };
    return rejectWithValue(res.message || i18n.t("partner.error.resume_hotel"));
  }
);

export const partnerUnlockHotel = createAsyncThunk(
  "partner/unlockHotel",
  async ({ id, reason }, { rejectWithValue }) => {
    const res = await requestUnlockPartnerHotel(id, reason);
    if (res.success) return { id };
    return rejectWithValue(res.message || i18n.t("partner.error.unlock_request"));
  }
);

// Restaurants
export const partnerCreateRestaurant = createAsyncThunk(
  "partner/createRestaurant",
  async (payload, { rejectWithValue }) => {
    const res = await createPartnerRestaurant(payload);
    if (res.success) return res.data;
    return rejectWithValue(res.message || i18n.t("partner.error.create_restaurant"));
  }
);

export const partnerUpdateRestaurant = createAsyncThunk(
  "partner/updateRestaurant",
  async ({ id, payload }, { rejectWithValue }) => {
    const res = await updatePartnerRestaurant(id, payload);
    if (res.success) return res.data;
    return rejectWithValue(res.message || i18n.t("partner.error.update_restaurant"));
  }
);

export const partnerDeleteRestaurant = createAsyncThunk(
  "partner/deleteRestaurant",
  async (id, { rejectWithValue }) => {
    const res = await softDeletePartnerRestaurant(id);
    if (res.success) return { id };
    return rejectWithValue(res.message || i18n.t("partner.error.delete_restaurant"));
  }
);

export const partnerPauseRestaurant = createAsyncThunk(
  "partner/pauseRestaurant",
  async (id, { rejectWithValue }) => {
    const res = await pausePartnerRestaurant(id);
    if (res.success) return { id };
    return rejectWithValue(res.message || i18n.t("partner.error.pause_restaurant"));
  }
);

export const partnerResumeRestaurant = createAsyncThunk(
  "partner/resumeRestaurant",
  async (id, { rejectWithValue }) => {
    const res = await resumePartnerRestaurant(id);
    if (res.success) return { id };
    return rejectWithValue(res.message || i18n.t("partner.error.resume_restaurant"));
  }
);

export const partnerUnlockRestaurant = createAsyncThunk(
  "partner/unlockRestaurant",
  async ({ id, reason }, { rejectWithValue }) => {
    const res = await requestUnlockPartnerRestaurant(id, reason);
    if (res.success) return { id };
    return rejectWithValue(res.message || i18n.t("partner.error.unlock_request"));
  }
);

// BOOKINGS
export const fetchPartnerHotelBookings = createAsyncThunk(
  "partner/fetchHotelBookings",
  async (params, { rejectWithValue }) => {
    const res = await listPartnerHotelBookings(params);
    if (res.success) return { data: res.data, params };
    return rejectWithValue(res.message || i18n.t("partner.error.load_hotel_bookings"));
  }
);

export const fetchPartnerRestaurantBookings = createAsyncThunk(
  "partner/fetchRestaurantBookings",
  async (params, { rejectWithValue }) => {
    const res = await listPartnerRestaurantBookings(params);
    if (res.success) return { data: res.data, params };
    return rejectWithValue(res.message || i18n.t("partner.error.load_restaurant_bookings"));
  }
);

export const fetchPartnerBookingDetail = createAsyncThunk(
  "partner/fetchBookingDetail",
  async ({ type, code }, { rejectWithValue }) => {
    const fn = type === "HOTEL" ? getPartnerHotelBookingDetail : getPartnerRestaurantBookingDetail;
    const res = await fn(code);
    if (res.success) return { type, data: res.data };
    return rejectWithValue(res.message || i18n.t("partner.error.load_booking_detail"));
  }
);

export const cancelPartnerBooking = createAsyncThunk(
  "partner/cancelBooking",
  async ({ type, code, reason }, { rejectWithValue }) => {
    const fn = type === "HOTEL" ? cancelPartnerHotelBooking : cancelPartnerRestaurantBooking;
    const res = await fn(code, reason);
    if (res.success) return { type, code };
    return rejectWithValue(res.message || i18n.t("partner.error.cancel_booking"));
  }
);

// STATS
export const fetchPartnerStatsByStatus = createAsyncThunk(
  "partner/statsByStatus",
  async (params, { rejectWithValue }) => {
    const res = await getPartnerStatsByStatus(params);
    if (res.success) return res.data;
    return rejectWithValue(res.message || i18n.t("partner.error.load_stats_status"));
  }
);

export const fetchPartnerRevenue = createAsyncThunk(
  "partner/revenue",
  async (params, { rejectWithValue }) => {
    const res = await getPartnerRevenue(params);
    if (res.success) return res.data;
    return rejectWithValue(res.message || i18n.t("partner.error.load_stats_revenue"));
  }
);

/* == STATE == */

const initialListState = {
  items: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  loading: false,
  error: null,
  lastQuery: null,
};

const initialState = {
  me: { data: null, loading: false, error: null },

  hotels: { ...initialListState },
  restaurants: { ...initialListState },

  hotelBookings: { ...initialListState },
  restaurantBookings: { ...initialListState },

  bookingDetail: { data: null, loading: false, error: null },

  statsByStatus: { data: null, loading: false, error: null },
  revenue: { data: null, loading: false, error: null },

  // dùng cho toast/UI
  action: { loading: false, error: null, lastAction: null },
};

/* == SLICE == */

const partnerSlice = createSlice({
  name: "partner",
  initialState,
  reducers: {
    clearPartnerErrors(state) {
      state.me.error = null;
      state.hotels.error = null;
      state.restaurants.error = null;
      state.hotelBookings.error = null;
      state.restaurantBookings.error = null;
      state.bookingDetail.error = null;
      state.statsByStatus.error = null;
      state.revenue.error = null;
      state.action.error = null;
    },
    clearBookingDetail(state) {
      state.bookingDetail = { data: null, loading: false, error: null };
    },
    clearPartnerAction(state) {
      state.action = { loading: false, error: null, lastAction: null };
    },
  },
  extraReducers: (builder) => {
    // ME
    builder
      .addCase(fetchPartnerMe.pending, (s) => {
        s.me.loading = true; s.me.error = null;
      })
      .addCase(fetchPartnerMe.fulfilled, (s, a) => {
        s.me.loading = false; s.me.data = a.payload ?? null;
      })
      .addCase(fetchPartnerMe.rejected, (s, a) => {
        s.me.loading = false; s.me.error = a.payload || i18n.t("partner.error.load_info");
      });

    // HOTELS list
    builder
      .addCase(fetchPartnerHotels.pending, (s) => {
        s.hotels.loading = true; s.hotels.error = null;
      })
      .addCase(fetchPartnerHotels.fulfilled, (s, a) => {
        const { data, params } = a.payload;
        s.hotels.loading = false;
        s.hotels.items = data.items ?? [];
        s.hotels.page = data.page ?? 0;
        s.hotels.size = data.size ?? 0;
        s.hotels.totalElements = data.totalElements ?? 0;
        s.hotels.totalPages = data.totalPages ?? 0;
        s.hotels.lastQuery = params || null;
      })
      .addCase(fetchPartnerHotels.rejected, (s, a) => {
        s.hotels.loading = false;
        s.hotels.error = a.payload || i18n.t("partner.error.load_data");
      });

    // RESTAURANTS list
    builder
      .addCase(fetchPartnerRestaurants.pending, (s) => {
        s.restaurants.loading = true; s.restaurants.error = null;
      })
      .addCase(fetchPartnerRestaurants.fulfilled, (s, a) => {
        const { data, params } = a.payload;
        s.restaurants.loading = false;
        s.restaurants.items = data.items ?? [];
        s.restaurants.page = data.page ?? 0;
        s.restaurants.size = data.size ?? 0;
        s.restaurants.totalElements = data.totalElements ?? 0;
        s.restaurants.totalPages = data.totalPages ?? 0;
        s.restaurants.lastQuery = params || null;
      })
      .addCase(fetchPartnerRestaurants.rejected, (s, a) => {
        s.restaurants.loading = false;
        s.restaurants.error = a.payload || i18n.t("partner.error.load_data");
      });

    // BOOKINGS list
    builder
      .addCase(fetchPartnerHotelBookings.pending, (s) => {
        s.hotelBookings.loading = true; s.hotelBookings.error = null;
      })
      .addCase(fetchPartnerHotelBookings.fulfilled, (s, a) => {
        const { data, params } = a.payload;
        s.hotelBookings.loading = false;
        s.hotelBookings.items = data.items ?? [];
        s.hotelBookings.page = data.page ?? 0;
        s.hotelBookings.size = data.size ?? 0;
        s.hotelBookings.totalElements = data.totalElements ?? 0;
        s.hotelBookings.totalPages = data.totalPages ?? 0;
        s.hotelBookings.lastQuery = params || null;
      })
      .addCase(fetchPartnerHotelBookings.rejected, (s, a) => {
        s.hotelBookings.loading = false;
        s.hotelBookings.error = a.payload || i18n.t("partner.error.load_bookings");
      });

    builder
      .addCase(fetchPartnerRestaurantBookings.pending, (s) => {
        s.restaurantBookings.loading = true; s.restaurantBookings.error = null;
      })
      .addCase(fetchPartnerRestaurantBookings.fulfilled, (s, a) => {
        const { data, params } = a.payload;
        s.restaurantBookings.loading = false;
        s.restaurantBookings.items = data.items ?? [];
        s.restaurantBookings.page = data.page ?? 0;
        s.restaurantBookings.size = data.size ?? 0;
        s.restaurantBookings.totalElements = data.totalElements ?? 0;
        s.restaurantBookings.totalPages = data.totalPages ?? 0;
        s.restaurantBookings.lastQuery = params || null;
      })
      .addCase(fetchPartnerRestaurantBookings.rejected, (s, a) => {
        s.restaurantBookings.loading = false;
        s.restaurantBookings.error = a.payload || i18n.t("partner.error.load_bookings");
      });

    // BOOKING detail
    builder
      .addCase(fetchPartnerBookingDetail.pending, (s) => {
        s.bookingDetail.loading = true; s.bookingDetail.error = null; s.bookingDetail.data = null;
      })
      .addCase(fetchPartnerBookingDetail.fulfilled, (s, a) => {
        s.bookingDetail.loading = false;
        s.bookingDetail.data = a.payload?.data ?? null;
      })
      .addCase(fetchPartnerBookingDetail.rejected, (s, a) => {
        s.bookingDetail.loading = false;
        s.bookingDetail.error = a.payload || i18n.t("partner.error.load_detail");
      });

    // STATS
    builder
      .addCase(fetchPartnerStatsByStatus.pending, (s) => {
        s.statsByStatus.loading = true; s.statsByStatus.error = null;
      })
      .addCase(fetchPartnerStatsByStatus.fulfilled, (s, a) => {
        s.statsByStatus.loading = false; s.statsByStatus.data = a.payload ?? null;
      })
      .addCase(fetchPartnerStatsByStatus.rejected, (s, a) => {
        s.statsByStatus.loading = false; s.statsByStatus.error = a.payload || i18n.t("partner.error.stats");
      });

    builder
      .addCase(fetchPartnerRevenue.pending, (s) => {
        s.revenue.loading = true; s.revenue.error = null;
      })
      .addCase(fetchPartnerRevenue.fulfilled, (s, a) => {
        s.revenue.loading = false; s.revenue.data = a.payload ?? null;
      })
      .addCase(fetchPartnerRevenue.rejected, (s, a) => {
        s.revenue.loading = false; s.revenue.error = a.payload || i18n.t("partner.error.stats_revenue");
      });

    // ACTION (mutations) — gom chung loading/error
    const actionPendings = [
      partnerCreateHotel, partnerUpdateHotel, partnerDeleteHotel, partnerPauseHotel, partnerResumeHotel, partnerUnlockHotel,
      partnerCreateRestaurant, partnerUpdateRestaurant, partnerDeleteRestaurant, partnerPauseRestaurant, partnerResumeRestaurant, partnerUnlockRestaurant,
      cancelPartnerBooking,
    ];
    actionPendings.forEach((th) => {
      builder.addCase(th.pending, (s) => {
        s.action.loading = true; s.action.error = null; s.action.lastAction = th.typePrefix;
      });
      builder.addCase(th.fulfilled, (s) => {
        s.action.loading = false;
      });
      builder.addCase(th.rejected, (s, a) => {
        s.action.loading = false;
        s.action.error = a.payload || i18n.t("partner.error.action_failed");
      });
    });
  },
});

export const { clearPartnerErrors, clearBookingDetail, clearPartnerAction } = partnerSlice.actions;
export default partnerSlice.reducer;