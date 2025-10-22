import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import planReducer from "../features/planFeed/slices/planSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    plan: planReducer,
  },
});

export default store;
