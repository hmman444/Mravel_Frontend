import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getHotelAvailability } from "../services/bookingService";

export const fetchHotelAvailability = createAsyncThunk(
  "booking/fetchHotelAvailability",
  async (params, { rejectWithValue }) => {
    const res = await getHotelAvailability(params);
    if (res.success) return { data: res.data, params };
    return rejectWithValue(res.message || "Lỗi kiểm tra phòng trống");
  }
);

const initialState = {
  hotelAvailability: {
    loading: false,
    error: null,
    data: null,      // { remainingRooms, isEnough, requestedRooms }
    lastQuery: null,
  },
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingErrors(state) {
      state.hotelAvailability.error = null;
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
      });
  },
});

export const { clearBookingErrors } = bookingSlice.actions;
export default bookingSlice.reducer;