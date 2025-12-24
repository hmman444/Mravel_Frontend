import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLoadUser } from "./features/auth/hooks/useLoadUser";
import { useAuthSync } from "./features/auth/hooks/useAuthSync";
import Toast from "./components/Toast";
import "leaflet/dist/leaflet.css";

// Auth
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import VerifyOtpPage from "./features/auth/pages/VerifyOtpPage";

// Home
import HomePage from "./features/home/pages/HomePage";

// Search
import SearchPage from "./features/search/pages/SearchPage";

// Plans
import PlanListPage from "./features/planFeed/pages/PlanListPage";
import PlanDashboardPage from "./features/planBoard/pages/PlanDashboardPage";
import ListPlanPage from "./features/planBoard/pages/ListPlanPage";
import PlanTimeLinePage from "./features/planBoard/pages/PlanTimeLinePage";
import JoinPlanPage from "./features/planBoard/pages/JoinPlanPage";

// Catalog
import PlaceDetailPage from "./features/catalog/pages/PlaceDetailPage";
import LocationResultsPage from "./features/catalog/pages/LocationResultsPage";
import HotelsHomePage from "./features/catalog/pages/HotelsHomePage";
import RestaurantsHomePage from "./features/catalog/pages/RestaurantsHomePage";
import HotelDetailPage from "./features/catalog/pages/HotelDetailPage";
import RestaurantDetailPage from "./features/catalog/pages/RestaurantDetailPage";

// User
import AccountProfilePage from "./features/user/pages/AccountProfilePage";
import UserPublicProfilePage from "./features/user/pages/UserPublicProfilePage";

// Admin
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import ManageUsersPage from "./features/admin/pages/ManageUsersPage";
import ManagePartnersPage from "./features/admin/pages/ManagePartnersPage";
import ManageReportsPage from "./features/admin/pages/ManageReportsPage";
import ManageServicesPage from "./features/admin/pages/ManageServicesPage";
import ManagePlacesPage from "./features/admin/pages/ManagePlacesPage";
import ManageAmenitiesPage from "./features/admin/pages/ManageAmenitiesPage";
import ManageRequestPartnersPage from "./features/admin/pages/ManageRequestPartnersPage";
import AdminPlaceDetailPage from "./features/admin/pages/AdminPlaceDetailPage";
import PlaceDetailPageAdmin from "./features/admin/pages/PlaceDetailPage";
import AdminHotelReviewPage from "./features/admin/pages/AdminHotelReviewPage";
import AdminRestaurantReviewPage from "./features/admin/pages/AdminRestaurantReviewPage";
import { useMainSocket } from "./realtime/useMainSocket";
import { useHydrateRole } from "./features/auth/hooks/useHydrateRole";

// Booking
import HotelBookingPage from "./features/booking/pages/HotelBookingPage";
import MyBookingsPage from "./features/booking/pages/MyBookingsPage";
import RestaurantBookingPage from "./features/booking/pages/RestaurantBookingPage";
import PaymentMethodPage from "./features/booking/pages/PaymentMethodPage";

// Partner
import PartnerLoginPage from "./features/partnerAuth/pages/LoginPage";
import PartnerRegisterPage from "./features/partnerAuth/pages/RegisterPage";
import PartnerForgotPasswordPage from "./features/partnerAuth/pages/ForgotPasswordPage";
import PartnerResetPasswordPage from "./features/partnerAuth/pages/ResetPasswordPage";
import PartnerVerifyOtpPage from "./features/partnerAuth/pages/VerifyOtpPage";

import PartnerLandingPage from "./features/partner/pages/PartnerLandingPage";
import PartnerDashboardPage from "./features/partner/pages/PartnerDashboardPage";
import PartnerServicesPage from "./features/partner/pages/PartnerServicesPage";
import PartnerBookingsPage from "./features/partner/pages/PartnerBookingsPage";
import PartnerUnlockRequestsPage from "./features/partner/pages/PartnerUnlockRequestsPage";

// Guard
import PartnerProtectedRoute from "./features/partnerAuth/components/PartnerProtectedRoute";

// Others
import FeatureComingSoonPage from "./pages/FeatureComingSoonPage";
import RequireRole from "./routes/RequireRole";
import { useNotificationRealtime } from "./realtime/useNotificationRealtime";
function App() {
  useLoadUser();
  useAuthSync();
  useMainSocket();
  useHydrateRole();
  useNotificationRealtime();
  return (
    <>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />

          {/* Admin routes */}
          <Route element={<RequireRole allow={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsersPage />} />
            <Route path="/admin/partners" element={<ManagePartnersPage />} />
            <Route path="/admin/reports" element={<ManageReportsPage />} />
            <Route path="/admin/services" element={<ManageServicesPage />} />
            <Route path="/admin/places" element={<ManagePlacesPage />} />
            <Route path="/admin/amenities" element={<ManageAmenitiesPage />} />
            <Route path="/admin/partners/request" element={<ManageRequestPartnersPage />} />
            <Route path="/admin/places/:slug" element={<AdminPlaceDetailPage />} />
            <Route path="/admin/services/restaurants/:id" element={<AdminRestaurantReviewPage />} />
            <Route path="/admin/places/new" element={<AdminPlaceDetailPage />} />
            <Route path="/admin/services/hotels/:id" element={<AdminHotelReviewPage />} />
            <Route path="/admin/places/:placeId" element={<PlaceDetailPageAdmin />} />
          </Route>

          <Route element={<RequireRole allow={["USER"]} />}>
            {/* Plans routes */}
            <Route path="/plans" element={<PlanListPage />} />
            <Route path="/plans/:planId" element={<PlanDashboardPage />} />
            <Route path="/plans/join" element={<JoinPlanPage />} />
            <Route path="/plans/my-plans" element={<ListPlanPage />} />
            <Route path="/plans/timeline" element={<PlanTimeLinePage />} />

            {/* User routes */}
            <Route path="/account/profile" element={<AccountProfilePage />} />
            <Route path="/profile/:userId" element={<UserPublicProfilePage />} />
          </Route>

          {/* Catalog routes */}
          <Route path="/place/:slug" element={<PlaceDetailPage />} />
          <Route path="/locations/search" element={<LocationResultsPage />} />
          <Route path="/hotels" element={<HotelsHomePage />} />
          <Route path="/hotels/search" element={<HotelsHomePage />} />
          <Route path="/hotels/:slug" element={<HotelDetailPage />} />
          <Route path="/restaurants" element={<RestaurantsHomePage />} />
          <Route path="/restaurants/search" element={<RestaurantsHomePage />} />
          <Route path="/restaurants/:slug" element={<RestaurantDetailPage />} />

          {/* General routes */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/" element={<HomePage />} />

          {/* Booking routes */}
          <Route path="/booking/hotel" element={<HotelBookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/booking/restaurant" element={<RestaurantBookingPage />} />
          <Route path="/booking/payment-method" element={<PaymentMethodPage />} />

          {/* ===================== PARTNER (PUBLIC) ===================== */}
          <Route path="/partner" element={<PartnerLandingPage />} />
          <Route path="/partner/login" element={<PartnerLoginPage />} />
          <Route path="/partner/register" element={<PartnerRegisterPage />} />
          <Route path="/partner/forgot-password" element={<PartnerForgotPasswordPage />} />
          <Route path="/partner/reset-password" element={<PartnerResetPasswordPage />} />
          <Route path="/partner/verify-otp" element={<PartnerVerifyOtpPage />} />

          {/* ===================== PARTNER (PROTECTED) ===================== */}
          <Route element={<PartnerProtectedRoute />}>
            <Route path="/partner/dashboard" element={<PartnerDashboardPage />} />
            <Route path="/partner/services" element={<PartnerServicesPage />} />
            <Route path="/partner/bookings" element={<PartnerBookingsPage />} />
            <Route path="/partner/unlock-requests" element={<PartnerUnlockRequestsPage />} />
          </Route>

          {/* Coming soon routes */}
          <Route path="/maybe" element={<FeatureComingSoonPage />} />

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Router>

      <Toast position="top-center" autoClose={2000} />
    </>
  );
}

export default App;