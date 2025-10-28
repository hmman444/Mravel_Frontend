import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import catalogReducer from "../features/catalog/slices/catalogSlice";
import planReducer from "../features/planFeed/slices/planSlice";
import planBoardReducer from "../features/planBoard/slices/planBoardSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    plan: planReducer,
    planBoard: planBoardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      thunk: true,
    }),
  devTools: import.meta.env.MODE !== "production",
});

export default store;
