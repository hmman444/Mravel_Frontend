import { Link, useLocation } from "react-router-dom";
import {
    HomeIcon,
    UsersIcon,
    BuildingOfficeIcon,
    ChartBarIcon,
    MapIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
    { to: "/admin", label: "Dashboard", icon: HomeIcon },
    { to: "/admin/users", label: "Quản lý người dùng", icon: UsersIcon },
    { to: "/admin/partners", label: "Quản lý đối tác", icon: BuildingOfficeIcon },
    { to: "/admin/services", label: "Quản lý dịch vụ", icon: Cog6ToothIcon },
    { to: "/admin/locations", label: "Quản lý địa điểm", icon: MapIcon },
    { to: "/admin/amenities", label: "Quản lý tiện ích", icon: ChartBarIcon },
    { to: "/admin/reports", label: "Báo cáo", icon: ChartBarIcon },
];

export default function AdminSidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200">

        {/* Menu */}
        <nav className="p-3 space-y-1">
            {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.to;
            return (
                <Link
                key={idx}
                to={item.to}
                className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                    isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                </Link>
            );
            })}
        </nav>
        </aside>
    );
}