import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import planReducer from "../features/planFeed/slices/planSlice";
import planBoardReducer from "../features/planBoard/slices/planBoardSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    plan: planReducer,
    planBoard: planBoardReducer
  },
});

export default store;
