import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLoadUser } from "./features/auth/hooks/useLoadUser";
import { useAuthSync } from "./features/auth/hooks/useAuthSync";
import Toast from "./components/Toast";
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
import PlanCalendarPage from "./features/planBoard/pages/PlanCalendarPage";
import ListPlanPage from "./features/planBoard/pages/ListPlanPage";
//Catalog
import PlaceDetailPage from "./features/catalog/pages/PlaceDetailPage";
import LocationResultsPage from "./features/catalog/pages/LocationResultsPage";
import HotelsHomePage from "./features/catalog/pages/HotelsHomePage";
import RestaurantsHomePage from "./features/catalog/pages/RestaurantsHomePage";
import HotelDetailPage from "./features/catalog/pages/HotelDetailPage";
//User
import AccountProfilePage from "./features/user/pages/AccountProfilePage";
// Admin
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import ManageUsersPage from "./features/admin/pages/ManageUsersPage";
import ManagePartnersPage from "./features/admin/pages/ManagePartnersPage";
import ManageReportsPage from "./features/admin/pages/ManageReportsPage";
import ManageServicesPage from "./features/admin/pages/ManageServicesPage";
import ManageLocationsPage from "./features/admin/pages/ManageLocationsPage";
import ManageAmenitiesPage from "./features/admin/pages/ManageAmenitiesPage";
import ManageRequestPartnersPage from "./features/admin/pages/ManageRequestPartnersPage";
import LocationDetailPage from "./features/admin/pages/LocationDetailPage";
import PlaceDetailPageAdmin from "./features/admin/pages/PlaceDetailPage";
import JoinPlanPage from "./features/planBoard/pages/JoinPlanPage";
function App() {
  useLoadUser();
  useAuthSync();
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
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsersPage />} />
        <Route path="/admin/partners" element={<ManagePartnersPage />} />
        <Route path="/admin/reports" element={<ManageReportsPage />} />
        <Route path="/admin/services" element={<ManageServicesPage />} />
        <Route path="/admin/locations" element={<ManageLocationsPage />} />
        <Route path="/admin/amenities" element={<ManageAmenitiesPage />} />
        <Route path="/admin/partners/request" element={<ManageRequestPartnersPage />} />
        <Route path="/admin/locations/:id" element={<LocationDetailPage />} />
        <Route path="/admin/places/:placeId" element={<PlaceDetailPageAdmin />} />

        {/* Plans routes */}
        <Route path="/plans" element={<PlanListPage />} />
        <Route path="/plans/:planId" element={<PlanDashboardPage />} />
        <Route path="/plans/join" element={<JoinPlanPage />} />
        <Route path="/plans/calendar" element={<PlanCalendarPage />} />
        <Route path="/plans/my-plans" element={<ListPlanPage />} />

        {/* Catalog routes */}       
        <Route path="/place/:slug" element={<PlaceDetailPage />} />
        <Route path="/locations/search" element={<LocationResultsPage />} />
        <Route path="/hotels" element={<HotelsHomePage />} />
        <Route path="/hotels/:slug" element={<HotelDetailPage />} />
        <Route path="/restaurants" element={<RestaurantsHomePage />} />

        {/* User routes */}
        <Route path="/account/profile" element={<AccountProfilePage />} />

        {/* General routes */}
        <Route path="/search" element={<SearchPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
    <Toast position="top-center" autoClose={2000} />
    </>
  );
}

export default App;
