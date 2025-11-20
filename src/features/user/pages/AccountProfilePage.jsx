// src/features/user/pages/AccountProfilePage.jsx
import { useEffect } from "react";
import { useLoadUser } from "../../auth/hooks/useLoadUser";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import AccountSidebar from "../components/AccountSidebar";
import AccountInfoCard from "../components/AccountInfoCard";
import EmailCard from "../components/EmailCard";
import PhoneCard from "../components/PhoneCard";
import LinkedAccountsCard from "../components/LinkedAccountsCard";

export default function AccountProfilePage() {
  useLoadUser(); // đảm bảo auth.user được fetch từ /auth/me

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <div className="h-[56px]" aria-hidden />

      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-10 md:pt-7 md:pb-12">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-5 text-slate-900 dark:text-slate-50">
          Cài đặt
        </h1>

        <div className="grid gap-6 md:grid-cols-[260px,1fr] md:items-start">
          <AccountSidebar />

          <section className="space-y-6">
            <AccountInfoCard />
            <EmailCard />
            <PhoneCard />
            <LinkedAccountsCard />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}