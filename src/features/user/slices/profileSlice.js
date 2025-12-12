// src/features/profile/slices/profileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserProfilePage, updateMyProfile  } from "../../user/services/userProfileService";
import { reactPlan, commentPlan } from "../../planFeed/slices/planSlice";

export const loadProfilePage = createAsyncThunk(
  "profile/loadProfilePage",
  async (userId, { rejectWithValue }) => {
    const result = await getUserProfilePage(userId);
    if (!result.success) return rejectWithValue(result.message);
    return result.data; // có thể là {data:{...}} hoặc {...}
  }
);

export const updateProfileThunk = createAsyncThunk(
  "profile/update",
  async (payload, { rejectWithValue }) => {
    const res = await updateMyProfile(payload);
    if (!res.success) return rejectWithValue(res.message);
    return res.data;
  }
);

const initialState = {
  currentUserId: null,
  data: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile(state) {
      state.currentUserId = null;
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProfilePage.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentUserId = action.meta.arg;
      })
      .addCase(loadProfilePage.fulfilled, (state, action) => {
        state.loading = false;

        // nếu BE trả {data:{...}} → unwrap
        state.data = action.payload?.data || action.payload;
      })
      .addCase(loadProfilePage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể tải hồ sơ người dùng";
      })
      .addCase(reactPlan.fulfilled, (state, action) => {
        if (!state.data?.plansPreview) return;

        const { planId, data } = action.payload;
        const plan = state.data.plansPreview.find(
          (p) => Number(p.id) === Number(planId)
        );
        if (!plan) return;

        plan.reactions = data.reactions;
        plan.reactionUsers = data.reactionUsers;
      })

      .addCase(commentPlan.fulfilled, (state, action) => {
        if (!state.data?.plansPreview) return;

        const { planId, data } = action.payload;

        const plan = state.data.plansPreview.find(
          (p) => Number(p.id) === Number(planId)
        );
        if (!plan) return;

        // copy lại logic từ planSlice
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

        if (!Array.isArray(plan.comments)) {
          plan.comments = [];
        }

        if (data.parentId) {
          const parent = findParent(plan.comments, data.parentId);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(data);
          }
        } else {
          plan.comments.push(data);
        }
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        if (state.data?.user) {
          Object.assign(state.data.user, action.payload);
        }
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
