// src/features/planBoard/slices/planGeneralSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  apiUpdateTitle,
  apiUpdateDescription,
  apiUpdateDates,
  apiUpdateStatus,
  apiUpdateThumbnail,
  apiAddImage,
  apiRemoveImage,
  apiUpdateBudget,
} from "../services/planGeneralService";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";

const asyncAction = (type, fn) =>
  createAsyncThunk(`planGeneral/${type}`, async (payload) => await fn(payload));

export const updatePlanTitle = asyncAction("updateTitle", async ({ planId, title }) => {
  return apiUpdateTitle(planId, title);
});

export const updatePlanDescription = asyncAction("updateDesc", async ({ planId, description }) => {
  return apiUpdateDescription(planId, description);
});

export const updatePlanDates = asyncAction("updateDates", async ({ planId, startDate, endDate }) => {
  return apiUpdateDates(planId, startDate, endDate);
});

export const updatePlanStatus = asyncAction("updateStatus", async ({ planId, status }) => {
  return apiUpdateStatus(planId, status);
});

export const updatePlanThumbnail = asyncAction("updateThumbnail", async ({ planId, file }) => {
  const url = await uploadToCloudinary(file);
  await apiUpdateThumbnail(planId, url);
  return url;
});

export const addPlanImage = asyncAction("addImage", async ({ planId, file }) => {
  const url = await uploadToCloudinary(file);
  await apiAddImage(planId, url);
  return url;
});

export const removePlanImage = asyncAction("removeImage", async ({ planId, url }) => {
  await apiRemoveImage(planId, url);
  return url;
});

export const updatePlanBudget = asyncAction(
  "updateBudget",
  async ({ planId, budgetTotal, budgetPerPerson, budgetCurrency }) => {
    return apiUpdateBudget(planId, {
      budgetTotal,
      budgetPerPerson,
      budgetCurrency,
    });
  }
);

const slice = createSlice({
  name: "planGeneral",
  initialState: {
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (a) => a.type.startsWith("planGeneral/") && a.type.endsWith("/pending"),
        (state) => { state.saving = true; state.error = null; }
      )
      .addMatcher(
        (a) => a.type.startsWith("planGeneral/") && a.type.endsWith("/fulfilled"),
        (state) => { state.saving = false; }
      )
      .addMatcher(
        (a) => a.type.startsWith("planGeneral/") && a.type.endsWith("/rejected"),
        (state, action) => { state.saving = false; state.error = action.error?.message; }
      );
  }
});

export default slice.reducer;
