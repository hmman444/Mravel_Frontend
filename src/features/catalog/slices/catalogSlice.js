// src/features/catalog/slices/catalogSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getHotels, getPlaces, getRestaurants, getPlaceDetail, suggestPlaces as apiSuggest } from "../services/catalogService";

// ===== Thunks =====
export const searchHotels = createAsyncThunk(
  "catalog/searchHotels",
  async (params, { rejectWithValue }) => {
    const res = await getHotels(params);              // { success, data, message }
    if (res.success) return { data: res.data, params }; // <-- unwrap data
    return rejectWithValue(res.message || "Lỗi tải danh sách khách sạn");
  }
);

export const searchRestaurants = createAsyncThunk(
  "catalog/searchRestaurants",
  async (params, { rejectWithValue }) => {
    const res = await getRestaurants(params);
    if (res.success) return { data: res.data, params };
    return rejectWithValue(res.message || "Lỗi tải danh sách quán ăn");
  }
);

export const searchPlaces = createAsyncThunk(
  "catalog/searchPlaces",
  async (params, { rejectWithValue }) => {
    const res = await getPlaces(params);
    if (res.success) return { data: res.data, params };
    return rejectWithValue(res.message || "Lỗi tải danh sách địa điểm");
  }
);

export const fetchPlaceDetail = createAsyncThunk(
  "catalog/fetchPlaceDetail",
  async (slug, { rejectWithValue }) => {
    const res = await getPlaceDetail(slug);
    if (res.success) return res.data;
    return rejectWithValue(res.message || "Không tìm thấy địa điểm");
  }
);

export const suggestPlaces = createAsyncThunk(
  "catalog/suggestPlaces",
  async ({ q, limit = 6 }, { rejectWithValue }) => {
    if (!q || !q.trim()) return { data: [] };
    const res = await apiSuggest(q, limit);
    if (res.success) return { data: res.data, q };
    return rejectWithValue(res.message || "Lỗi gợi ý địa điểm");
  }
);

// ===== Slice =====
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
  hotels: { ...initialListState },
  restaurants: { ...initialListState },
  poi: { ...initialListState },
  detail: {
    data: null,
    loading: false,
    error: null,
  },
  suggest: { items: [], loading: false, error: null, q: "" },
};

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    clearCatalogErrors(state) {
      state.hotels.error = null;
      state.restaurants.error = null;
      state.poi.error = null;
      state.detail.error = null;
      state.suggest.error = null;
    },
    clearSuggest(state) {
      state.suggest = { items: [], loading: false, error: null, q: "" };
    }
  },
  extraReducers: (builder) => {
    // Hotels
    builder
      .addCase(searchHotels.pending, (state) => {
        state.hotels.loading = true;
        state.hotels.error = null;
      })
      .addCase(searchHotels.fulfilled, (state, action) => {
        const { data, params } = action.payload; // data = normalizePage(...)
        state.hotels.loading = false;
        state.hotels.items = data.items ?? [];
        state.hotels.page = data.page ?? 0;
        state.hotels.size = data.size ?? 0;
        state.hotels.totalElements = data.totalElements ?? 0;
        state.hotels.totalPages = data.totalPages ?? 0;
        state.hotels.lastQuery = params || null;
      })
      .addCase(searchHotels.rejected, (state, action) => {
        state.hotels.loading = false;
        state.hotels.error = action.payload || "Lỗi tải dữ liệu";
        state.hotels.items = state.hotels.items ?? [];
      });

    // Restaurants
    builder
      .addCase(searchRestaurants.pending, (state) => {
        state.restaurants.loading = true;
        state.restaurants.error = null;
      })
      .addCase(searchRestaurants.fulfilled, (state, action) => {
        const { data, params } = action.payload;
        state.restaurants.loading = false;
        state.restaurants.items = data.items ?? [];
        state.restaurants.page = data.page ?? 0;
        state.restaurants.size = data.size ?? 0;
        state.restaurants.totalElements = data.totalElements ?? 0;
        state.restaurants.totalPages = data.totalPages ?? 0;
        state.restaurants.lastQuery = params || null;
      })
      .addCase(searchRestaurants.rejected, (state, action) => {
        state.restaurants.loading = false;
        state.restaurants.error = action.payload || "Lỗi tải dữ liệu";
        state.restaurants.items = state.restaurants.items ?? [];
      });

    // POI
    builder
      .addCase(searchPlaces.pending, (state) => {
        state.poi.loading = true;
        state.poi.error = null;
      })
      .addCase(searchPlaces.fulfilled, (state, action) => {
        const { data, params } = action.payload;
        state.poi.loading = false;
        state.poi.items = data.items ?? [];
        state.poi.page = data.page ?? 0;
        state.poi.size = data.size ?? 0;
        state.poi.totalElements = data.totalElements ?? 0;
        state.poi.totalPages = data.totalPages ?? 0;
        state.poi.lastQuery = params || null;
      })
      .addCase(searchPlaces.rejected, (state, action) => {
        state.poi.loading = false;
        state.poi.error = action.payload || "Lỗi tải dữ liệu";
        state.poi.items = state.poi.items ?? [];
      });

    // Detail
    builder
      .addCase(fetchPlaceDetail.pending, (state) => {
        state.detail.loading = true;
        state.detail.error = null;
        state.detail.data = null;
      })
      .addCase(fetchPlaceDetail.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.data = action.payload || null;
      })
      .addCase(fetchPlaceDetail.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.error = action.payload || "Không tìm thấy địa điểm";
      });

      // Suggest
    builder
      .addCase(suggestPlaces.pending, (state) => {
        state.suggest.loading = true;
        state.suggest.error = null;
      })
      .addCase(suggestPlaces.fulfilled, (state, action) => {
        state.suggest.loading = false;
        state.suggest.items = action.payload?.data ?? [];
        state.suggest.q = action.payload?.q ?? "";
      })
      .addCase(suggestPlaces.rejected, (state, action) => {
        state.suggest.loading = false;
        state.suggest.error = action.payload || "Lỗi gợi ý địa điểm";
      });
  },
});

export const { clearCatalogErrors, clearSuggest  } = catalogSlice.actions;
export default catalogSlice.reducer;