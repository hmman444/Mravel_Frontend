"use client";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header cố định */}
      <AdminHeader />

      {/* Sidebar cố định */}
      <AdminSidebar />

      {/* Nội dung chính */}
      <main
        className="
          pt-20
          min-h-screen
          p-6
          transition-[margin-left] duration-300 ease-out
        "
        style={{
          // mặc định nếu chưa set biến (tránh nhảy layout)
          marginLeft: "var(--admin-sidebar-w, 272px)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
