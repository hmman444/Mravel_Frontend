import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  LockClosedIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function PartnerSidebar() {
  const location = useLocation();

  const menuItems = [
    { to: "/partner/dashboard", label: "Tổng quan", icon: HomeIcon },
    { to: "/partner/services", label: "Dịch vụ của tôi", icon: BuildingStorefrontIcon },
    { to: "/partner/bookings", label: "Đơn đặt", icon: ClipboardDocumentListIcon },
    { to: "/partner/unlock-requests", label: "Yêu cầu mở khóa", icon: LockClosedIcon },
  ];

  return (
    <aside className="w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200">
      <nav className="p-3 space-y-1">
        {menuItems.map((item, idx) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== "/partner" && location.pathname.startsWith(item.to));

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