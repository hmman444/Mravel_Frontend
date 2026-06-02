import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useLogout } from "../../auth/hooks/useLogout";
import {
  Ticket,
  CreditCard,
  BookmarkCheck,
  Gift,
  Bell,
  Settings,
  Ban,
  EyeOff,
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

export default function AccountSidebar({ selectedTab, onSelectTab }) {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { handleLogout } = useLogout();

  const initials = getInitials(user?.fullname || "User");
  const tier = user?.membershipTier || "BRONZE";
  const tierLabel = TIER_LABEL[tier] || "Bronze Priority";
  const tierEmoji = TIER_EMOJI[tier] || "🥉";
  const avatarUrl = user?.avatar;

  return (
    <aside
      className="
        bg-white dark:bg-slate-900 rounded-xl border border-slate-200 
        dark:border-slate-700 shadow-sm overflow-hidden
        max-h-[calc(100vh-96px)] overflow-y-auto
      "
    >
      {/* Avatar + tên */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user?.fullname || 'Avatar'}
            className="w-12 h-12 rounded-full object-cover border border-white shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center text-lg font-semibold">
            {initials}
          </div>
        )}

        <div className="min-w-0">
          <p className="font-semibold text-sm text-slate-900 dark:text-slate-50 line-clamp-1">
            {user?.fullname || t("user.default_user_name")}
          </p>
          {/* EMAIL: không tràn nữa, tự xuống dòng / cắt */}
          <p className="text-xs text-slate-500 dark:text-slate-400 break-all leading-snug">
            {user?.email || t("user.default_account")}
          </p>
        </div>
      </div>

      {/* Membership dynamic */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 flex items-center gap-2">
        <span className="text-lg">{tierEmoji}</span>
        <div className="text-xs text-white">
          <p>{t("user.membership_label")}</p>
          <p className="font-semibold">{tierLabel}</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="py-2 text-sm">
        <div className="mt-1">
          <button
            type="button"
            onClick={() => onSelectTab("account")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 transition
              ${
                selectedTab === "account"
                  ? "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/40 border-l-4 border-sky-500 font-semibold"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
          >
            <Settings className="w-4 h-4 text-sky-500" />
            <span>{t("user.profile_settings")}</span>
          </button>

          <Link
            to="/account/blocked-users"
            className="w-full flex items-center gap-3 px-4 py-2.5 transition text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Ban className="w-4 h-4 text-rose-500" />
            <span>{t("user.blocked_users_title", "Người đã chặn")}</span>
          </Link>

          <Link
            to="/account/hidden-posts"
            className="w-full flex items-center gap-3 px-4 py-2.5 transition text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <EyeOff className="w-4 h-4 text-slate-500" />
            <span>{t("user.hidden_posts_title", "Bài đã ẩn")}</span>
          </Link>

        </div>

        {/* Đăng xuất */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 mt-2 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>{t("user.logout")}</span>
        </button>
      </nav>
    </aside>
  );
}
