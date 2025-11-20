import { useSelector } from "react-redux";
import { useLogout } from "../../auth/hooks/useLogout";
import {
  Ticket,
  CreditCard,
  BookmarkCheck,
  Gift,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const letters = parts.map((p) => p[0]).join("");
  return letters.slice(-2).toUpperCase();
}

const TIER_LABEL = {
  BRONZE: "Bronze Priority",
  SILVER: "Silver Priority",
  GOLD: "Gold Priority",
  PLATINUM: "Platinum Priority",
};

const TIER_EMOJI = {
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
  PLATINUM: "🏆",
};

export default function AccountSidebar() {
  const { user } = useSelector((state) => state.auth);
  const { handleLogout } = useLogout();

  const initials = getInitials(user?.fullname || "User");
  const tier = user?.membershipTier || "BRONZE";
  const tierLabel = TIER_LABEL[tier] || "Bronze Priority";
  const tierEmoji = TIER_EMOJI[tier] || "🥉";
  const avatarUrl = user?.avatar;

  return (
    <aside className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Avatar + tên */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user?.fullname || "Avatar"}
            className="w-12 h-12 rounded-full object-cover border border-white shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center text-lg font-semibold">
            {initials}
          </div>
        )}

        <div>
          <p className="font-semibold text-sm text-slate-900 dark:text-slate-50 line-clamp-1">
            {user?.fullname || "Người dùng Mravel"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user?.email || "Tài khoản Mravel"}
          </p>
        </div>
      </div>

      {/* Membership dynamic */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 flex items-center gap-2">
        <span className="text-lg">{tierEmoji}</span>
        <div className="text-xs text-white">
          <p>Bạn là thành viên</p>
          <p className="font-semibold">{tierLabel}</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="py-2 text-sm">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <Ticket className="w-4 h-4 text-sky-500" />
          <span>0 Điểm</span>
        </button>

        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <CreditCard className="w-4 h-4 text-sky-500" />
          <span>Thẻ của tôi</span>
        </button>

        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <BookmarkCheck className="w-4 h-4 text-sky-500" />
          <span>Đặt chỗ của tôi</span>
        </button>

        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <Gift className="w-4 h-4 text-sky-500" />
          <span>Khuyến mãi</span>
        </button>

        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <Bell className="w-4 h-4 text-sky-500" />
          <span>Cài đặt thông báo</span>
        </button>

        {/* Tài khoản – active giống Traveloka */}
        <div className="mt-1">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/40 border-l-4 border-sky-500 font-semibold"
          >
            <Settings className="w-4 h-4 text-sky-500" />
            <span>Tài khoản</span>
          </button>
        </div>

        {/* Đăng xuất */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 mt-2 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </nav>
    </aside>
  );
}