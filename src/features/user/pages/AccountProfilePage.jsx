import { useEffect, useState } from "react";
import { useLoadUser } from "../../auth/hooks/useLoadUser";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import AccountSidebar from "../components/AccountSidebar";
import AccountInfoCard from "../components/AccountInfoCard";
import EmailCard from "../components/EmailCard";
import PhoneCard from "../components/PhoneCard";
import LinkedAccountsCard from "../components/LinkedAccountsCard";
import MyPlanListPage from "../pages/MyPlanListPage";

// AccountProfilePage.jsx
export default function AccountProfilePage() {
  useLoadUser();

  const [selectedTab, setSelectedTabState] = useState(
    localStorage.getItem("account_tab") || "account"
  );

  // hàm chọn tab: vừa setState vừa lưu localStorage
  const handleSelectTab = (tab) => {
    setSelectedTabState(tab);
    localStorage.setItem("account_tab", tab);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* spacer cho navbar */}
      <div className="h-[56px]" aria-hidden />

      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-10 md:pt-7 md:pb-12">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-slate-900 dark:text-slate-50">
          Hồ sơ cá nhân
        </h1>

        {/* tăng width sidebar: 280px và làm sticky */}
        <div className="grid gap-6 md:grid-cols-[280px,1fr]">
          {/* SIDEBAR */}
          <div className="md:relative">
            <div className="md:sticky md:top-[72px] md:self-start">
              <AccountSidebar
                selectedTab={selectedTab}
                onSelectTab={handleSelectTab}
              />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <section className="space-y-6 min-w-0">
            {selectedTab === "account" && (
              <>
                <AccountInfoCard />
                <EmailCard />
                <PhoneCard />
                <LinkedAccountsCard />
              </>
            )}

            {selectedTab === "my-plans" && <MyPlanListPage />}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
