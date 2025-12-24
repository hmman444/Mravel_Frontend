import PartnerHeader from "./PartnerHeader";
import PartnerSidebar from "./PartnerSidebar";
import { useAuthSync } from "../../partnerAuth/hooks/useAuthSync";

export default function PartnerLayout({ children }) {
  useAuthSync();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PartnerHeader />
      <PartnerSidebar />

      {/* CONTENT – match sidebar width khi expand/collapse */}
      <main
        className="
          min-h-screen
          pt-20
          px-6
          transition-[margin-left] duration-300 ease-out
        "
        style={{
          marginLeft: "var(--partner-sidebar-w, 272px)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
