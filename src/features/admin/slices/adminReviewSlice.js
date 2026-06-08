import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import i18n from "../../../i18n";
import {
  fetchNegativeReviews,
  fetchNegativeCount,
  deleteReview,
} from "../services/adminReviewService";

const apiMessage = (err) => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  if (err?.response?.status === 401) return i18n.t("admin.session_expired");
  return msg || i18n.t("admin.error_occurred");
};

const initialState = {
  mode: "HOTEL", // HOTEL | RESTAURANT | PLACE
  maxRating: 2, // ngưỡng "tiêu cực"

  items: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  negativeCount: 0,

  loading: false,
  acting: false,
  error: null,
  actionError: null,
};

export const loadNegativeReviews = createAsyncThunk(
  "adminReview/loadNegativeReviews",
  async (params, { rejectWithValue }) => {
    try {
      return await fetchNegativeReviews(params);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const loadNegativeCount = createAsyncThunk(
  "adminReview/loadNegativeCount",
  async (params, { rejectWithValue }) => {
    try {
      return await fetchNegativeCount(params);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const removeReview = createAsyncThunk(
  "adminReview/removeReview",
  async (id, { rejectWithValue }) => {
    try {
      await deleteReview(id);
      return id;
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

const adminReviewSlice = createSlice({
  name: "adminReview",
  initialState,
  reducers: {
    setMode(state, action) {
      state.mode = action.payload;
    },
    setMaxRating(state, action) {
      state.maxRating = action.payload;
    },
    clearError(state) {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LIST
      .addCase(loadNegativeReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNegativeReviews.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload || {};
        state.items = p.items ?? [];
        state.page = p.page ?? 0;
        state.size = p.size ?? state.size;
        state.totalElements = p.totalElements ?? 0;
        state.totalPages = p.totalPages ?? 0;
      })
      .addCase(loadNegativeReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // COUNT
      .addCase(loadNegativeCount.fulfilled, (state, action) => {
        state.negativeCount = action.payload ?? 0;
      })

      // DELETE
      .addCase(removeReview.pending, (state) => {
        state.acting = true;
        state.actionError = null;
      })
      .addCase(removeReview.fulfilled, (state, action) => {
        state.acting = false;
        state.items = state.items.filter((x) => x.id !== action.payload);
        if (state.totalElements > 0) state.totalElements -= 1;
        if (state.negativeCount > 0) state.negativeCount -= 1;
      })
      .addCase(removeReview.rejected, (state, action) => {
        state.acting = false;
        state.actionError = action.payload || action.error.message;
      });
  },
});

export const { setMode, setMaxRating, clearError } = adminReviewSlice.actions;
export default adminReviewSlice.reducer;
