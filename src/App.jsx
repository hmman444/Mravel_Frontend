import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import VerifyOtpPage from "./features/auth/pages/VerifyOtpPage";
import HomePage from "./features/home/pages/HomePage";
import SearchPage from "./features/search/pages/SearchPage";
import PlanListPage from "./features/plans/pages/PlanListPage";
import PlanBoardPage from "./features/plans/pages/PlanBoardPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="*" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/plans" element={<PlanListPage />} />
        <Route path="/plans/editor" element={<PlanBoardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
