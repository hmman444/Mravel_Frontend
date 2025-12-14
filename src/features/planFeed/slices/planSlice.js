import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPlans, sendReaction, sendComment, sharePlan, fetchMyPlans, searchPlansAndUsers } from "../services/planService";

const initialState = {
  items: [],
  current: null,
  loading: false,
  hasMore: true,
  page: 1,

  myItems: [],
  myLoading: false,
  myHasMore: true,
  myPage: 1,

  searchQuery: "",
  searchLoading: false,
  searchPlans: [],
  searchUsers: [],
  searchMeta: { page: 1, size: 10, total: 0, hasMore: false },

  error: null,
};

export const loadPlans = createAsyncThunk("plan/loadPlans", async ({ page = 1 }) => {
  const res = await fetchPlans(page, 3);
  return { data: res, page };
});

export const reactPlan = createAsyncThunk("plan/reactPlan", async ({ planId, type }) => {
  const res = await sendReaction(planId, type);
  return { planId, data: res };
});

export const commentPlan = createAsyncThunk("plan/commentPlan", async ({ planId, comment }) => {
  const res = await sendComment(planId, comment);
  return { planId, data: res };
});

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

export const searchAll = createAsyncThunk("plan/searchAll", async ({ q, page = 1, size = 10 }) => {
  const res = await searchPlansAndUsers(q, page, size);
  return { q, res };
});

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
      state.searchPlans = [];
      state.searchUsers = [];
      state.searchMeta = { page: 1, size: 10, total: 0, hasMore: false };
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
        if (page === 1) state.items = data.items;
        else state.items.push(...data.items);
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
      })

      .addCase(loadMyPlans.pending, (state) => {
        state.myLoading = true;
      })
      .addCase(loadMyPlans.fulfilled, (state, action) => {
        const { data, page } = action.payload;
        state.myLoading = false;
        state.myPage = page;

        if (page === 1) state.myItems = data.items;
        else state.myItems.push(...data.items);

        state.myHasMore = data.hasMore;
      })
      .addCase(loadMyPlans.rejected, (state, action) => {
        state.myLoading = false;
        state.error = action.error.message;
      })
      .addCase(searchAll.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchAll.fulfilled, (state, action) => {
        const { q, res } = action.payload;

        state.searchLoading = false;
        state.searchQuery = q;

        state.searchPlans = res?.plans?.items || [];
        state.searchUsers = res?.users || [];
        state.searchMeta = {
          page: res?.plans?.page || 1,
          size: res?.plans?.size || 10,
          total: res?.plans?.total || 0,
          hasMore: !!res?.plans?.hasMore,
        };
      })
      .addCase(searchAll.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { resetPlans, clearSearch } = planSlice.actions;
export default planSlice.reducer;
