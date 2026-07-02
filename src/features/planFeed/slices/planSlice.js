import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import i18n from "../../../i18n";
import {
  fetchPlans,
  sendReaction,
  sendComment,
  reactToComment,
  sharePlan,
  fetchMyPlans,
  searchPlansAndUsers,
  fetchPlanFeedDetail,
} from "../services/planService";

export const DEFAULT_FILTERS = {
  budgetMin: "",
  budgetMax: "",
  daysMin: "",
  daysMax: "",
  startDateFrom: "",
  startDateTo: "",
  destinations: [],
  sortBy: "RELEVANCE",
};

const initialState = {
  items: [],
  current: null,
  loading: false,
  hasMore: true,
  page: 1,

  currentLoading: false,
  currentError: null,

  myItems: [],
  myLoading: false,
  myHasMore: true,
  myPage: 1,

  searchQuery: "",
  searchLoading: false,
  // True whenever a search/filter is active — decoupled from searchQuery so that
  // filter-only searches (empty keyword + active filters) still render results.
  searchActive: false,
  searchPlans: [],
  searchUsers: [],
  searchMeta: { nextCursor: null, size: 10, total: 0, hasMore: false },

  // Advanced filter state
  activeFilters: { ...DEFAULT_FILTERS },
  filterSidebarOpen: false,

  error: null,
};

export const loadPlans = createAsyncThunk("plan/loadPlans", async ({ page = 1 }) => {
  const res = await fetchPlans(page, 3);
  return { data: res, page };
});

export const loadPlanFeedDetail = createAsyncThunk(
  "plan/loadPlanFeedDetail",
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await fetchPlanFeedDetail(id);
      return res;
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          i18n.t("feed.detail.loadError")
      );
    }
  }
);

export const reactPlan = createAsyncThunk("plan/reactPlan", async ({ planId, type }) => {
  const res = await sendReaction(planId, type);
  return { planId, data: res };
});

export const commentPlan = createAsyncThunk("plan/commentPlan", async ({ planId, comment }) => {
  const res = await sendComment(planId, comment);
  return { planId, data: res };
});

export const reactComment = createAsyncThunk(
  "plan/reactComment",
  async ({ planId, commentId, type }) => {
    const res = await reactToComment(commentId, type);
    return { planId, ...res }; // { planId, commentId, reactions, myReaction }
  }
);

export const sharePlanInvite = createAsyncThunk("plan/sharePlanInvite", async ({ planId, email }) => {
  const res = await sharePlan(planId, email);
  return { planId, email, data: res };
});

export const loadMyPlans = createAsyncThunk(
  "plan/loadMyPlans",
  async ({ page = 1 }) => {
    const res = await fetchMyPlans(page, 5);
    return { data: res, page };
  }
);

export const searchAll = createAsyncThunk(
  "plan/searchAll",
  async ({ q, filters = {}, cursor = null, size = 10 }) => {
    const res = await searchPlansAndUsers(q, filters, cursor, size);
    return { q, res, isLoadMore: cursor != null };
  }
);

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    resetPlans(state) {
      state.items = [];
      state.page = 1;
      state.hasMore = true;
    },
    clearSearch(state) {
      state.searchQuery = "";
      state.searchLoading = false;
      state.searchActive = false;
      state.searchPlans = [];
      state.searchUsers = [];
      state.searchMeta = { nextCursor: null, size: 10, total: 0, hasMore: false };
    },
    setActiveFilters(state, action) {
      state.activeFilters = { ...DEFAULT_FILTERS, ...action.payload };
    },
    resetFilters(state) {
      state.activeFilters = { ...DEFAULT_FILTERS };
    },
    setFilterSidebarOpen(state, action) {
      state.filterSidebarOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPlans.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadPlans.fulfilled, (state, action) => {
        const { data, page } = action.payload;
        state.loading = false;
        state.page = page;
        if (page === 1) {
          state.items = data.items;
        } else {
          // Dedupe by id when appending pages to guard against React Strict Mode
          // double-firing the IntersectionObserver and duplicate-page responses.
          const existingIds = new Set(state.items.map((p) => p.id));
          state.items.push(...data.items.filter((p) => !existingIds.has(p.id)));
        }
        state.hasMore = data.hasMore;
      })
      .addCase(loadPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(reactPlan.fulfilled, (state, action) => {
        const { planId, data } = action.payload;
          const update = (p) => {
            if (!p) return;
            p.reactions = data.reactions;
            p.reactionUsers = data.reactionUsers;
          };

          update(state.items.find(p => p.id === planId));
          update(state.myItems.find(p => p.id === planId));
          update(state.searchPlans.find((p) => p.id === planId));
          update(state.current && state.current.id === planId ? state.current : null);
      })
      .addCase(reactComment.fulfilled, (state, action) => {
        const { planId, commentId, reactions, myReaction, reactionUsers } = action.payload;

        const updateInTree = (comments) => {
          for (const c of comments) {
            if (c.id === commentId) {
              c.reactions = reactions;
              c.myReaction = myReaction ?? null;
              c.reactionUsers = reactionUsers ?? [];
              return true;
            }
            if (c.replies && updateInTree(c.replies)) return true;
          }
          return false;
        };

        const updatePlan = (plan) => {
          if (!plan) return;
          updateInTree(plan.comments || []);
        };

        updatePlan(state.items.find((p) => p.id === planId));
        updatePlan(state.myItems.find((p) => p.id === planId));
        updatePlan(state.searchPlans.find((p) => p.id === planId));
        updatePlan(state.current && state.current.id === planId ? state.current : null);
      })
      .addCase(commentPlan.fulfilled, (state, action) => {
        const { planId, data } = action.payload;

        // Hàm tìm parent trong cây comment
        const findParent = (comments, parentId) => {
          for (const c of comments) {
            if (c.id === parentId) return c;
            if (c.replies) {
              const found = findParent(c.replies, parentId);
              if (found) return found;
            }
          }
          return null;
        };

        // Hàm update comment cho 1 plan
        const updateComments = (plan) => {
          if (!plan) return;

          if (data.parentId) {
            const parent = findParent(plan.comments, data.parentId);
            if (parent) {
              parent.replies = parent.replies || [];
              parent.replies.push(data);
            }
          } else {
            plan.comments.push(data);
          }
        };

        // Cập nhật cho feed
        updateComments(state.items.find((p) => p.id === planId));

        // Cập nhật cho My Plans
        updateComments(state.myItems.find((p) => p.id === planId));
        updateComments(state.searchPlans.find((p) => p.id === planId));
        updateComments(state.current && state.current.id === planId ? state.current : null);
      })

      .addCase(loadMyPlans.pending, (state) => {
        state.myLoading = true;
      })
      .addCase(loadMyPlans.fulfilled, (state, action) => {
        const { data, page } = action.payload;
        state.myLoading = false;
        state.myPage = page;

        if (page === 1) {
          state.myItems = data.items;
        } else {
          // Dedupe by id when appending pages (guards against double-fired loads).
          const existingIds = new Set(state.myItems.map((p) => p.id));
          state.myItems.push(...data.items.filter((p) => !existingIds.has(p.id)));
        }

        state.myHasMore = data.hasMore;
      })
      .addCase(loadMyPlans.rejected, (state, action) => {
        state.myLoading = false;
        state.error = action.error.message;
      })
      .addCase(searchAll.pending, (state, action) => {
        state.searchLoading = true;
        state.searchActive = true;
        // Always update the visible query label immediately
        state.searchQuery = action.meta.arg.q;
      })
      .addCase(searchAll.fulfilled, (state, action) => {
        const { q, res, isLoadMore } = action.payload;

        state.searchLoading = false;
        state.searchQuery = q;

        const newPlans = res?.plans?.items || [];

        if (isLoadMore) {
          // Append, deduplicating by id to guard against React Strict Mode
          // double-firing the IntersectionObserver callback.
          const existingIds = new Set(state.searchPlans.map((p) => p.id));
          state.searchPlans = [
            ...state.searchPlans,
            ...newPlans.filter((p) => !existingIds.has(p.id)),
          ];
        } else {
          // Fresh search — replace the list and reset user results
          state.searchPlans = newPlans;
          state.searchUsers = res?.users || [];
        }

        state.searchMeta = {
          nextCursor: res?.plans?.nextCursor || null,
          size: res?.plans?.size || 10,
          total: res?.plans?.total || 0,
          hasMore: !!res?.plans?.hasMore,
        };
      })
      .addCase(searchAll.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.error.message;
      })
      .addCase(loadPlanFeedDetail.pending, (state) => {
        state.currentLoading = true;
        state.currentError = null;
      })
      .addCase(loadPlanFeedDetail.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.current = action.payload;
      })
      .addCase(loadPlanFeedDetail.rejected, (state, action) => {
        state.currentLoading = false;
        state.currentError = action.payload || action.error.message;
      });
  },
});

export const {
  resetPlans,
  clearSearch,
  setActiveFilters,
  resetFilters,
  setFilterSidebarOpen,
} = planSlice.actions;
export default planSlice.reducer;
