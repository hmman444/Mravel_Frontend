import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAdminPlaces,
  fetchAdminChildren,
  fetchAdminPlaceDetail,
  updateAdminPlace,
  deleteAdminPlace,
  createAdminPlace,
  lockAdminPlace,
  unlockAdminPlace
} from "../services/adminPlaceService";

const apiMessage = (err) => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  if (err?.response?.status === 401)
    return "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.";
  return msg || "Có lỗi xảy ra";
};

/* ====== THUNKS ====== */
export const loadDestinations = createAsyncThunk(
  "adminPlace/loadDestinations",
  async (params, { rejectWithValue }) => {
    try {
      return await fetchAdminPlaces({ kind: "DESTINATION", ...params });
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const loadChildren = createAsyncThunk(
  "adminPlace/loadChildren",
  async ({ parentSlug, params }, { rejectWithValue }) => {
    try {
      const data = await fetchAdminChildren(parentSlug, params);
      return { parentSlug, data };
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const loadPlaceDetailAdmin = createAsyncThunk(
  "adminPlace/loadPlaceDetailAdmin",
  async (slug, { rejectWithValue }) => {
    try {
      return await fetchAdminPlaceDetail(slug);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const updatePlaceThunk = createAsyncThunk(
  "adminPlace/updatePlace",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateAdminPlace(id, payload);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const lockPlaceThunk = createAsyncThunk(
  "adminPlace/lockPlace",
  async (id, { rejectWithValue }) => {
    try {
      await lockAdminPlace(id);
      return id;
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const unlockPlaceThunk = createAsyncThunk(
  "adminPlace/unlockPlace",
  async (id, { rejectWithValue }) => {
    try {
      await unlockAdminPlace(id);
      return id;
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const deletePlaceThunk = createAsyncThunk(
  "adminPlace/hardDeletePlace",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAdminPlace(id);
      return id;
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

export const createPlaceThunk = createAsyncThunk(
  "adminPlace/createPlace",
  async (payload, { rejectWithValue }) => {
    try {
      return await createAdminPlace(payload);
    } catch (err) {
      return rejectWithValue(apiMessage(err));
    }
  }
);

/* ====== STATE ====== */
const initialListState = {
  items: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
};

const initialState = {
  destinations: {
    ...initialListState,
    loading: false,
    error: null,
  },

  children: {
    parentSlug: null,
    ...initialListState,
    loading: false,
    error: null,
  },

  detail: {
    data: null,
    loading: false,
    saving: false,
    deleting: false,
    error: null,
  },
};

const adminPlaceSlice = createSlice({
  name: "adminPlace",
  initialState,
  reducers: {
    clearChildren(state) {
      state.children = { parentSlug: null, ...initialListState, loading: false, error: null };
    },
    clearPlaceDetail(state) {
      state.detail = { data: null, loading: false, saving: false, deleting: false, error: null };
    },
  },
  extraReducers: (builder) => {
    // destinations
    builder
      .addCase(createPlaceThunk.pending, (state) => {
        state.detail.saving = true;
        state.detail.error = null;
      })
      .addCase(createPlaceThunk.fulfilled, (state, action) => {
        state.detail.saving = false;
        state.detail.data = action.payload || null;
      })
      .addCase(createPlaceThunk.rejected, (state, action) => {
        state.detail.saving = false;
        state.detail.error = action.payload || "Tạo mới thất bại";
      })
      .addCase(loadDestinations.pending, (state) => {
        state.destinations.loading = true;
        state.destinations.error = null;
      })
      .addCase(loadDestinations.fulfilled, (state, action) => {
        state.destinations.loading = false;
        Object.assign(state.destinations, action.payload);
      })
      .addCase(loadDestinations.rejected, (state, action) => {
        state.destinations.loading = false;
        state.destinations.error = action.payload || "Lỗi tải destinations";
      });

    // children
    builder
      .addCase(loadChildren.pending, (state) => {
        state.children.loading = true;
        state.children.error = null;
      })
      .addCase(loadChildren.fulfilled, (state, action) => {
        state.children.loading = false;
        state.children.parentSlug = action.payload.parentSlug;
        Object.assign(state.children, action.payload.data);
      })
      .addCase(loadChildren.rejected, (state, action) => {
        state.children.loading = false;
        state.children.error = action.payload || "Lỗi tải children";
      });

      //lock
    builder
      .addCase(lockPlaceThunk.pending, (state) => {
        state.detail.deleting = true; // tái dụng flag
        state.detail.error = null;
      })
      .addCase(lockPlaceThunk.fulfilled, (state, action) => {
        state.detail.deleting = false;
        const id = action.payload;

        // detail
        if (state.detail?.data?.id === id) state.detail.data.active = false;

        // destinations list
        state.destinations.items = (state.destinations.items || []).map((x) =>
          x.id === id ? { ...x, active: false } : x
        );

        // children list
        state.children.items = (state.children.items || []).map((x) =>
          x.id === id ? { ...x, active: false } : x
        );
      })
      .addCase(lockPlaceThunk.rejected, (state, action) => {
        state.detail.deleting = false;
        state.detail.error = action.payload || "Khóa thất bại";
      });

    // unlock 
    builder
      .addCase(unlockPlaceThunk.pending, (state) => {
        state.detail.deleting = true;
        state.detail.error = null;
      })
      .addCase(unlockPlaceThunk.fulfilled, (state, action) => {
        state.detail.deleting = false;
        const id = action.payload;

        if (state.detail?.data?.id === id) state.detail.data.active = true;

        state.destinations.items = (state.destinations.items || []).map((x) =>
          x.id === id ? { ...x, active: true } : x
        );

        state.children.items = (state.children.items || []).map((x) =>
          x.id === id ? { ...x, active: true } : x
        );
      })
      .addCase(unlockPlaceThunk.rejected, (state, action) => {
        state.detail.deleting = false;
        state.detail.error = action.payload || "Mở khóa thất bại";
      });

    // detail
    builder
      .addCase(loadPlaceDetailAdmin.pending, (state) => {
        state.detail.loading = true;
        state.detail.error = null;
        state.detail.data = null;
      })
      .addCase(loadPlaceDetailAdmin.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.data = action.payload || null;
      })
      .addCase(loadPlaceDetailAdmin.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.error = action.payload || "Không tải được chi tiết";
      });

    // update
    builder
      .addCase(updatePlaceThunk.pending, (state) => {
        state.detail.saving = true;
        state.detail.error = null;
      })
      .addCase(updatePlaceThunk.fulfilled, (state, action) => {
        state.detail.saving = false;
        state.detail.data = action.payload || state.detail.data;
      })
      .addCase(updatePlaceThunk.rejected, (state, action) => {
        state.detail.saving = false;
        state.detail.error = action.payload || "Cập nhật thất bại";
      });

    // delete
    builder
      .addCase(deletePlaceThunk.pending, (state) => {
        state.detail.deleting = true;
        state.detail.error = null;
      })
      .addCase(deletePlaceThunk.fulfilled, (state) => {
        state.detail.deleting = false;
      })
      .addCase(deletePlaceThunk.rejected, (state, action) => {
        state.detail.deleting = false;
        state.detail.error = action.payload || "Xóa thất bại";
      });
  },
});

export const { clearChildren, clearPlaceDetail } = adminPlaceSlice.actions;
export default adminPlaceSlice.reducer;
