import { Link, useLocation } from "react-router-dom";
import {
    HomeIcon,
    UsersIcon,
    BuildingOfficeIcon,
    MapIcon,
    Cog6ToothIcon,
    SparklesIcon,
    FlagIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function AdminSidebar() {
    const location = useLocation();
    const { t } = useTranslation();

    const menuItems = [
        { to: "/admin", label: t("overview"), icon: HomeIcon },
        { to: "/admin/users", label: t("manage_users"), icon: UsersIcon },
        { to: "/admin/partners", label: t("manage_partners"), icon: BuildingOfficeIcon },
        { to: "/admin/services", label: t("manage_services"), icon: Cog6ToothIcon },
        { to: "/admin/locations", label: t("manage_locations"), icon: MapIcon },
        { to: "/admin/amenities", label: t("manage_amenities"), icon: SparklesIcon },
        { to: "/admin/reports", label: t("reports"), icon: FlagIcon },
    ];

    return (
        <aside className="w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200">
        <nav className="p-3 space-y-1">
            {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.to;
            return (
                <Link
                key={idx}
                to={item.to}
                className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                    isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
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