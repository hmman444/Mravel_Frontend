// src/features/planBoard/slices/planListSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchMyPlans } from "../services/planListService";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const loadMyPlans = createAsyncThunk(
  "planList/loadMyPlans",
  async () => {
    return await fetchMyPlans();
  }
);

const planListSlice = createSlice({
  name: "planList",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadMyPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMyPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(loadMyPlans.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error?.message || "Không thể tải danh sách kế hoạch";
      });
  },
});

export default planListSlice.reducer;
