import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import catalogReducer from "../features/catalog/slices/catalogSlice";
import planReducer from "../features/planFeed/slices/planSlice";
import planBoardReducer from "../features/planBoard/slices/planBoardSlice";
import userProfileReducer from "../features/user/slices/userProfileSlice";
import planListReducer from "../features/planBoard/slices/planListSlice";
import planGeneralReducer from "../features/planBoard/slices/planGeneralSlice";
import bookingReducer from "../features/booking/slices/bookingSlice";
import bookingPublicReducer from "../features/booking/slices/bookingPublicSlice";
import bookingPrivateReducer from "../features/booking/slices/bookingPrivateSlice";
import bookingRestaurantReducer from "../features/booking/slices/bookingRestaurantSlice";
import bookingRestaurantPrivateReducer from "../features/booking/slices/bookingRestaurantPrivateSlice";
import bookingRestaurantPublicReducer from "../features/booking/slices/bookingRestaurantPublicSlice";
import partnerAuthReducer from "../features/partnerAuth/slices/partnerAuthSlice";
import adminAmenityReducer from "../features/admin/slices/adminAmenitySlice";
import profileReducer from "../features/user/slices/profileSlice";
import adminPlaceReducer from "../features/admin/slices/adminPlaceSlice";
import notificationsReducer from "../features/notifications/slices/notificationSlice";
import partnerReducer from "../features/partner/slices/partnerSlice";
import adminUserReducer from "../features/admin/slices/adminUserSlice";
import adminPartnerReducer from "../features/admin/slices/adminPartnerSlice";
import adminServiceReducer from "../features/admin/slices/adminServiceSlice";
import { injectStore } from "./storeInjector";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    plan: planReducer,
    planBoard: planBoardReducer,
    userProfile: userProfileReducer,
    planList: planListReducer,
    planGeneral: planGeneralReducer,
    profile: profileReducer,
    bookingPublic: bookingPublicReducer,
    bookingPrivate: bookingPrivateReducer,
    bookingRestaurant: bookingRestaurantReducer,
    bookingRestaurantPrivate: bookingRestaurantPrivateReducer,
    bookingRestaurantPublic: bookingRestaurantPublicReducer,
    booking: bookingReducer,
    partnerAuth: partnerAuthReducer,
    adminAmenity: adminAmenityReducer,
    adminPlace: adminPlaceReducer,
    notifications:notificationsReducer,
    partner: partnerReducer,
    adminUser: adminUserReducer,
    adminPartners: adminPartnerReducer,
    adminService: adminServiceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      thunk: true,
    }),
  devTools: import.meta.env.MODE !== "production",
});
injectStore(store);
export default store;
