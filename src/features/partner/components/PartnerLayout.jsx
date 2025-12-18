import PartnerHeader from "./PartnerHeader";
import PartnerSidebar from "./PartnerSidebar";

export default function PartnerLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerHeader />
      <PartnerSidebar />
      <main className="pt-20 ml-64 min-h-screen p-6">{children}</main>
    </div>
  );
}