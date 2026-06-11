import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getFavoriteSummary, toggleFavorite } from "../features/catalog/services/favoriteService";
import { showError, showSuccess } from "../utils/toastUtils";

/**
 * Reusable Favorite Button component with optimistic UI and auth check.
 * 
 * @param {string} targetType - HOTEL, RESTAURANT, PLACE
 * @param {string} targetId - ID của đối tượng
 * @param {string} className - CSS classes bổ sung cho button
 * @param {number} initialCount - (Optional) Số lượng yêu thích ban đầu
 * @param {boolean} showCount - (Optional) Hiển thị text số lượng bên cạnh tim
 */
/**
 * Reusable Favorite Button component with optimistic UI and auth check.
 * 
 * @param {string} targetType - HOTEL, RESTAURANT, PLACE
 * @param {string} targetId - ID của đối tượng
 * @param {string} className - CSS classes bổ sung cho container
 * @param {number} initialCount - (Optional) Số lượng yêu thích ban đầu
 * @param {boolean} showCount - (Optional) Hiển thị text số lượng bên cạnh tim
 * @param {string} variant - "card" (trên ảnh), "detail" (trong trang chi tiết)
 */
export default function FavoriteButton({
  targetType,
  targetId,
  className = "",
  initialCount = 0,
  showCount = false,
  variant = "card"
}) {
  const { t } = useTranslation();
  const { accessToken } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const [favorited, setFavorited] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  // Load trạng thái ban đầu
  useEffect(() => {
    let alive = true;
    const loadStatus = async () => {
      const res = await getFavoriteSummary(targetType, targetId);
      if (alive && res?.success) {
        setFavorited(res.data.favorited);
        setCount(res.data.count);
      }
    };
    loadStatus();
    return () => { alive = false; };
  }, [targetType, targetId, accessToken]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!accessToken) {
      navigate("/login", { state: { from: location } });
      return;
    }

    if (cooldown || loading) return;

    // Optimistic Update
    const prevFavorited = favorited;
    const prevCount = count;

    setFavorited(!prevFavorited);
    setCount(Math.max(0, prevCount + (prevFavorited ? -1 : 1)));

    setCooldown(true);
    setTimeout(() => setCooldown(false), 1000);

    setLoading(true);
    try {
      const res = await toggleFavorite(targetType, targetId);
      if (res?.success) {
        setFavorited(res.data.favorited);
        setCount(res.data.favoriteCount);
        if (res.data.favorited) {
          showSuccess(t("common.favorite_added"));
        }
      } else {
        setFavorited(prevFavorited);
        setCount(prevCount);
        showError(res?.message || t("common.favorite_failed"));
      }
    } catch (err) {
      setFavorited(prevFavorited);
      setCount(prevCount);
      showError(t("common.connection_error"));
    } finally {
      setLoading(false);
    }
  };

  // Styles dựa trên variant
  const isPlace = targetType === "PLACE";

  let containerStyles = "flex items-center transition-all duration-300 ";
  let buttonStyles = "flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ";
  let iconStyles = "w-full h-full ";
  let countStyles = "font-bold ";

  if (variant === "card") {
    if (isPlace) {
      // Pill style for place cards (top-right, heart + count)
      containerStyles += "gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white ";
      buttonStyles += favorited ? "text-red-500 " : "text-white ";
      iconStyles += "w-4 h-4 ";
      countStyles += "text-[11px] ";
    } else {
      // Circle style for hotel/restaurant cards
      containerStyles += "inline-flex items-center justify-center overflow-hidden rounded-full shadow-lg ring-1 ring-black/5 backdrop-blur-sm ";
      buttonStyles += "flex w-full h-full items-center justify-center p-0 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ";
      // Glass circle for better contrast over photos
      buttonStyles += favorited
        ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-[0_8px_24px_rgba(244,63,94,0.35)] ring-0 "
        : "bg-white/85 dark:bg-slate-950/45 text-rose-500 dark:text-rose-200 border border-white/60 dark:border-white/10 hover:bg-white dark:hover:bg-slate-900/65 hover:text-rose-600 dark:hover:text-rose-100 ";
      iconStyles += "w-[15px] h-[15px] shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)] ";
    }
  } else {
    // Detail style: inline with rating
    containerStyles += "gap-1.5 ";
    // Use text-black for visibility as requested (avoid white outline)
    buttonStyles += favorited ? "text-red-500 " : "text-black dark:text-white ";
    iconStyles += "w-5 h-5 md:w-6 md:h-6 ";
    countStyles += "text-sm font-bold text-gray-800 dark:text-gray-200 ";
  }

  return (
    <div className={`${containerStyles} ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className={buttonStyles}
        disabled={loading}
        title={favorited ? t("common.unfavorite") : t("common.favorite")}
      >
        {favorited ? (
          <FaHeart className={`${iconStyles} drop-shadow-sm animate-heart-beat`} />
        ) : (
          <FiHeart className={iconStyles} strokeWidth={variant === "detail" ? 2.8 : 2.5} />
        )}
      </button>

      {showCount && count >= 0 && (
        <span className={countStyles}>
          {count.toLocaleString()}
        </span>
      )}

      <style>{`
        @keyframes heart-beat {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-heart-beat {
          animation: heart-beat 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
