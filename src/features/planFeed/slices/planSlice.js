import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPlans, sendReaction, sendComment, sharePlan } from "../services/planService";

const initialState = {
  items: [],
  current: null,
  loading: false,
  hasMore: true,
  page: 1,
  error: null,
};

// Lấy danh sách plan
export const loadPlans = createAsyncThunk("plan/loadPlans", async (page = 1) => {
  const res = await fetchPlans(page, 3);
  return { data: res, page };
});

// Gửi reaction
export const reactPlan = createAsyncThunk("plan/reactPlan", async ({ planId, type, user }) => {
  const res = await sendReaction(planId, type, user);
  return { planId, data: res };
});

// Gửi comment
export const commentPlan = createAsyncThunk("plan/commentPlan", async ({ planId, comment }) => {
  const res = await sendComment(planId, comment);
  return { planId, data: res };
});

// Chia sẻ plan
export const sharePlanInvite = createAsyncThunk("plan/sharePlanInvite", async ({ planId, email }) => {
  const res = await sharePlan(planId, email);
  return { planId, email, data: res };
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
  },
  extraReducers: (builder) => {
    builder
      // Load list
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

      // React
      .addCase(reactPlan.fulfilled, (state, action) => {
        const { planId, data } = action.payload;
        const plan = state.items.find((p) => p.id === planId);
        if (plan) {
          plan.reactions = data.reactions;
          plan.reactionUsers = data.reactionUsers;
        }
      })

      // Comment
      .addCase(commentPlan.fulfilled, (state, action) => {
        const { planId, data } = action.payload;
        const plan = state.items.find((p) => p.id === planId);
        if (plan) plan.comments.push(data);
      });
  },
});

export const { resetPlans } = planSlice.actions;
export default planSlice.reducer;
