import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
        {/* Header cố định */}
        <AdminHeader />

        {/* Sidebar cố định */}
        <AdminSidebar />

        {/* Nội dung chính */}
        <main className="pt-20 ml-64 min-h-screen p-6">
            {children}
        </main>
        </div>
    );
}