import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAdminPartners, lockPartner, unlockPartner } from "../services/adminPartnerService";

export const loadPartners = createAsyncThunk(
  "adminPartners/load",
  async ({ q = "", page = 0, size = 20 } = {}, { rejectWithValue }) => {
    try {
      const resp = await fetchAdminPartners({ q, page, size });
      if (!resp?.success) return rejectWithValue(resp?.message || "Load partners failed");
      return resp.data; // list
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message || "Load partners failed");
    }
  }
);

export const lockPartnerThunk = createAsyncThunk(
  "adminPartners/lock",
  async (id, { rejectWithValue }) => {
    try {
      const resp = await lockPartner(id);
      if (!resp?.success) return rejectWithValue(resp?.message || "Lock failed");
      return { id };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message || "Lock failed");
    }
  }
);

export const unlockPartnerThunk = createAsyncThunk(
  "adminPartners/unlock",
  async (id, { rejectWithValue }) => {
    try {
      const resp = await unlockPartner(id);
      if (!resp?.success) return rejectWithValue(resp?.message || "Unlock failed");
      return { id };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || e.message || "Unlock failed");
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  page: 0,
  size: 20,
  q: "",
};

const adminPartnerSlice = createSlice({
  name: "adminPartners",
  initialState,
  reducers: {
    setPartnerQuery(state, action) {
      state.q = action.payload ?? "";
      state.page = 0;
    },
    setPartnerPage(state, action) {
      state.page = action.payload ?? 0;
    },
    setPartnerSize(state, action) {
      state.size = action.payload ?? 20;
      state.page = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPartners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPartners.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(loadPartners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Load partners failed";
      })
      .addCase(lockPartnerThunk.fulfilled, (state, action) => {
        const { id } = action.payload;
        const u = state.items.find((x) => x.id === id);
        if (u) u.status = "LOCKED";
      })
      .addCase(unlockPartnerThunk.fulfilled, (state, action) => {
        const { id } = action.payload;
        const u = state.items.find((x) => x.id === id);
        if (u) u.status = "ACTIVE";
      });
  },
});

export const { setPartnerQuery, setPartnerPage, setPartnerSize } = adminPartnerSlice.actions;
export default adminPartnerSlice.reducer;
