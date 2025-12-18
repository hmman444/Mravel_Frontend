import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAmenities,
  fetchGroupedAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
} from "../services/adminAmenityService";

const initialState = {
  items: [],
  grouped: null,

  loading: false,
  saving: false,
  deleting: false,

  error: null,
};

export const loadAmenities = createAsyncThunk(
  "adminAmenity/loadAmenities",
  async (params, { rejectWithValue }) => {
    try {
      return await fetchAmenities(params);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const loadGroupedAmenities = createAsyncThunk(
  "adminAmenity/loadGroupedAmenities",
  async (scope, { rejectWithValue }) => {
    try {
      return await fetchGroupedAmenities(scope);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const createAmenityThunk = createAsyncThunk(
  "adminAmenity/createAmenity",
  async (payload, { rejectWithValue }) => {
    try {
      return await createAmenity(payload);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const updateAmenityThunk = createAsyncThunk(
  "adminAmenity/updateAmenity",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateAmenity(id, payload);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const deleteAmenityThunk = createAsyncThunk(
  "adminAmenity/deleteAmenity",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAmenity(id);
      return id;
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

const apiMessage = (err) => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  if (err?.response?.status === 401) return "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.";
  return msg || "Có lỗi xảy ra";
};

const adminAmenitySlice = createSlice({
  name: "adminAmenity",
  initialState,
  reducers: {
    clearGrouped(state) {
      state.grouped = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* -------- LOAD -------- */
      .addCase(loadAmenities.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadAmenities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadAmenities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      /* -------- GROUPED -------- */
      .addCase(loadGroupedAmenities.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadGroupedAmenities.fulfilled, (state, action) => {
        state.loading = false;
        state.grouped = action.payload;
      })
      .addCase(loadGroupedAmenities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      /* -------- CREATE -------- */
      .addCase(createAmenityThunk.pending, (state) => {
        state.saving = true;
      })
      .addCase(createAmenityThunk.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
      })
      .addCase(createAmenityThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || action.error.message;
      })

      /* -------- UPDATE -------- */
      .addCase(updateAmenityThunk.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateAmenityThunk.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateAmenityThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || action.error.message;
      })

      /* -------- DELETE -------- */
      .addCase(deleteAmenityThunk.pending, (state) => {
        state.deleting = true;
      })
      .addCase(deleteAmenityThunk.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter((i) => i.id !== action.payload);
      })
      .addCase(deleteAmenityThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearGrouped } = adminAmenitySlice.actions;
export default adminAmenitySlice.reducer;
