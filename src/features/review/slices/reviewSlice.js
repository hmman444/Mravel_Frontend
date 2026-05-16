import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as reviewService from "../services/reviewService";

export const fetchReviews = createAsyncThunk(
  "review/fetchReviews",
  async ({ targetType, targetId, page = 0, size = 5 }, { rejectWithValue }) => {
    const res = await reviewService.getReviews({ targetType, targetId, page, size });
    if (res.success) return { data: res.data, page };
    return rejectWithValue(res.message);
  },
);

export const fetchReviewSummary = createAsyncThunk(
  "review/fetchReviewSummary",
  async ({ targetType, targetId }, { rejectWithValue }) => {
    const res = await reviewService.getReviewSummary({ targetType, targetId });
    if (res.success) return res.data;
    return rejectWithValue(res.message);
  },
);

export const fetchMyReview = createAsyncThunk(
  "review/fetchMyReview",
  async ({ targetType, targetId }, { rejectWithValue }) => {
    const res = await reviewService.getMyReview({ targetType, targetId });
    if (res.success) return res.data;
    return rejectWithValue(res.message);
  },
);

export const submitReview = createAsyncThunk(
  "review/submitReview",
  async (payload, { rejectWithValue }) => {
    const res = await reviewService.createReview(payload);
    if (res.success) return res.data;
    return rejectWithValue(res.message);
  },
);

export const editReview = createAsyncThunk(
  "review/editReview",
  async ({ reviewId, payload }, { rejectWithValue }) => {
    const res = await reviewService.updateReview(reviewId, payload);
    if (res.success) return res.data;
    return rejectWithValue(res.message);
  },
);

export const removeReview = createAsyncThunk(
  "review/removeReview",
  async (reviewId, { rejectWithValue }) => {
    const res = await reviewService.deleteReview(reviewId);
    if (res.success) return reviewId;
    return rejectWithValue(res.message);
  },
);

export const fetchAspectDefinitions = createAsyncThunk(
  "review/fetchAspectDefinitions",
  async (category, { rejectWithValue, getState }) => {
    // skip if already cached
    const cached = getState().review.aspectDefinitions[category];
    if (cached?.length) return { category, items: cached };
    const res = await reviewService.getAspectDefinitions(category);
    if (res.success) return { category, items: res.data };
    return rejectWithValue(res.message);
  },
);

const initialState = {
  reviews: [],
  page: 0,
  totalPages: 0,
  totalElements: 0,
  hasMore: true,
  loading: false,
  error: null,
  summary: null,
  summaryLoading: false,
  myReview: null,
  submitting: false,
  // aspect definitions cached per category key (HOTEL / RESTAURANT / PLACE)
  aspectDefinitions: {},
  aspectsLoading: false,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    clearReviews(state) {
      state.reviews = [];
      state.page = 0;
      state.totalPages = 0;
      state.totalElements = 0;
      state.hasMore = true;
      state.loading = false;
      state.error = null;
      state.summary = null;
      state.myReview = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchReviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        const { data, page } = action.payload;
        const items = data?.content ?? [];
        if (page === 0) {
          state.reviews = items;
        } else {
          state.reviews = [...state.reviews, ...items];
        }
        state.page = data?.number ?? page;
        state.totalPages = data?.totalPages ?? 0;
        state.totalElements = data?.totalElements ?? 0;
        state.hasMore = (data?.number ?? 0) + 1 < (data?.totalPages ?? 0);
        state.loading = false;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchReviewSummary
      .addCase(fetchReviewSummary.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchReviewSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.summaryLoading = false;
      })
      .addCase(fetchReviewSummary.rejected, (state) => {
        state.summaryLoading = false;
      })

      // fetchMyReview
      .addCase(fetchMyReview.fulfilled, (state, action) => {
        state.myReview = action.payload;
      })

      // submitReview
      .addCase(submitReview.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.myReview = action.payload;
        state.reviews = [action.payload, ...state.reviews];
        state.totalElements += 1;
      })
      .addCase(submitReview.rejected, (state) => {
        state.submitting = false;
      })

      // editReview
      .addCase(editReview.pending, (state) => {
        state.submitting = true;
      })
      .addCase(editReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.myReview = action.payload;
        state.reviews = state.reviews.map((r) =>
          r.id === action.payload.id ? action.payload : r,
        );
      })
      .addCase(editReview.rejected, (state) => {
        state.submitting = false;
      })

      // removeReview
      .addCase(removeReview.fulfilled, (state, action) => {
        state.myReview = null;
        state.reviews = state.reviews.filter((r) => r.id !== action.payload);
        state.totalElements = Math.max(0, state.totalElements - 1);
      })

      // fetchAspectDefinitions
      .addCase(fetchAspectDefinitions.pending, (state) => {
        state.aspectsLoading = true;
      })
      .addCase(fetchAspectDefinitions.fulfilled, (state, action) => {
        const { category, items } = action.payload;
        state.aspectDefinitions[category] = items;
        state.aspectsLoading = false;
      })
      .addCase(fetchAspectDefinitions.rejected, (state) => {
        state.aspectsLoading = false;
      });
  },
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
