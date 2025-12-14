import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getRestaurantAvailability,
  createRestaurantBookingAndPay,
} from "../services/restaurantBookingService";

export const fetchRestaurantAvailability = createAsyncThunk(
  "bookingRestaurant/fetchRestaurantAvailability",
  async (params, { rejectWithValue }) => {
    const res = await getRestaurantAvailability(params);
    if (res.success) return { data: res.data, params };
    return rejectWithValue(res.message || "Lỗi kiểm tra bàn trống");
  }
);

export const createRestaurantPayment = createAsyncThunk(
  "bookingRestaurant/createRestaurantPayment",
  async (payload, { rejectWithValue }) => {
    const res = await createRestaurantBookingAndPay(payload);
    if (res.success) return res.data; // { bookingCode, payUrl, ... }
    return rejectWithValue(res.message || "Lỗi tạo thanh toán");
  }
);

const initialState = {
  availability: { loading: false, error: null, data: null, lastQuery: null },
  payment: { loading: false, error: null, data: null },
};

const slice = createSlice({
  name: "bookingRestaurant",
  initialState,
  reducers: {
    clearRestaurantBookingErrors(state) {
      state.availability.error = null;
      state.payment.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchRestaurantAvailability.pending, (s) => {
      s.availability.loading = true;
      s.availability.error = null;
    });
    b.addCase(fetchRestaurantAvailability.fulfilled, (s, a) => {
      s.availability.loading = false;
      s.availability.data = a.payload?.data ?? null;
      s.availability.lastQuery = a.payload?.params ?? null;
    });
    b.addCase(fetchRestaurantAvailability.rejected, (s, a) => {
      s.availability.loading = false;
      s.availability.error = a.payload || "Lỗi kiểm tra bàn trống";
    });

    b.addCase(createRestaurantPayment.pending, (s) => {
      s.payment.loading = true;
      s.payment.error = null;
      s.payment.data = null;
    });
    b.addCase(createRestaurantPayment.fulfilled, (s, a) => {
      s.payment.loading = false;
      s.payment.data = a.payload || null;
    });
    b.addCase(createRestaurantPayment.rejected, (s, a) => {
      s.payment.loading = false;
      s.payment.error = a.payload || "Lỗi tạo thanh toán";
    });
  },
});

export const { clearRestaurantBookingErrors } = slice.actions;
export default slice.reducer;