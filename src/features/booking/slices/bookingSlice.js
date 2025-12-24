import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getHotelAvailability, createHotelBookingAndPay } from "../services/bookingService";

export const fetchHotelAvailability = createAsyncThunk(
  "booking/fetchHotelAvailability",
  async (params, { rejectWithValue }) => {
    const res = await getHotelAvailability(params);
    if (res.success) return { data: res.data, params };
    return rejectWithValue(res.message || "Lỗi kiểm tra phòng trống");
  }
);

export const createHotelPayment = createAsyncThunk(
  "booking/createHotelPayment",
  async (payload, { rejectWithValue }) => {
    const res = await createHotelBookingAndPay(payload);
    if (res.success) return res.data; // { bookingCode, payUrl, ... }
    return rejectWithValue(res.message || "Lỗi tạo thanh toán");
  }
);

const initialState = {
  hotelAvailability: { loading: false, error: null, data: null, lastQuery: null },
  payment: { loading: false, error: null, data: null },

  //  NEW: draft để trang PaymentMethodPage dùng
  draftPayment: {
    type: null,     // "HOTEL" | "RESTAURANT" (chuẩn bị cho phần res)
    payload: null,  // payload gửi BE để tạo payment
    meta: null,     // data hiển thị UI (tên, số tiền...)
  },
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingErrors(state) {
      state.hotelAvailability.error = null;
      state.payment.error = null;
    },

    //  NEW
    setDraftPayment(state, action) {
      state.draftPayment.type = action.payload?.type ?? null;
      state.draftPayment.payload = action.payload?.payload ?? null;
      state.draftPayment.meta = action.payload?.meta ?? null;
    },
    clearDraftPayment(state) {
      state.draftPayment.type = null;
      state.draftPayment.payload = null;
      state.draftPayment.meta = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotelAvailability.pending, (state) => {
        state.hotelAvailability.loading = true;
        state.hotelAvailability.error = null;
      })
      .addCase(fetchHotelAvailability.fulfilled, (state, action) => {
        state.hotelAvailability.loading = false;
        state.hotelAvailability.data = action.payload?.data ?? null;
        state.hotelAvailability.lastQuery = action.payload?.params ?? null;
      })
      .addCase(fetchHotelAvailability.rejected, (state, action) => {
        state.hotelAvailability.loading = false;
        state.hotelAvailability.error = action.payload || "Lỗi kiểm tra phòng trống";
      })
      .addCase(createHotelPayment.pending, (state) => {
        state.payment.loading = true;
        state.payment.error = null;
        state.payment.data = null;
      })
      .addCase(createHotelPayment.fulfilled, (state, action) => {
        state.payment.loading = false;
        state.payment.data = action.payload || null;
      })
      .addCase(createHotelPayment.rejected, (state, action) => {
        state.payment.loading = false;
        state.payment.error = action.payload || "Lỗi tạo thanh toán";
      });
  },
});

export const { clearBookingErrors, setDraftPayment, clearDraftPayment } = bookingSlice.actions;
export default bookingSlice.reducer;