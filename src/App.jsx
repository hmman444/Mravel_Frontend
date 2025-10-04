import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
import PlanListPage from "./features/plans/pages/PlanListPage";
import PlanDashboardPage from "./features/plans/pages/PlanDashboardPage";
// Admin
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import ManageUsersPage from "./features/admin/pages/ManageUsersPage";
import ManagePartnersPage from "./features/admin/pages/ManagePartnersPage";
import ManageReportsPage from "./features/admin/pages/ManageReportsPage";
import ManageServicesPage from "./features/admin/pages/ManageServicesPage";
import ManageLocationsPage from "./features/admin/pages/ManageLocationsPage";
import ManageAmenitiesPage from "./features/admin/pages/ManageAmenitiesPage";
import ManageRequestPartnersPage from "./features/admin/pages/ManageRequestPartnersPage";

function App() {
  return (
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

        {/* Plans routes */}
        <Route path="/plans" element={<PlanListPage />} />
        <Route path="/plans/:planId" element={<PlanDashboardPage />} />

        {/* General routes */}
        <Route path="/search" element={<SearchPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
