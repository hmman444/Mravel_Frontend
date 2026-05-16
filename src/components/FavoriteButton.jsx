import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
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
          showSuccess("Đã thêm vào yêu thích");
        }
      } else {
        setFavorited(prevFavorited);
        setCount(prevCount);
        showError(res?.message || "Không thể thực hiện yêu thích");
      }
    } catch (err) {
      setFavorited(prevFavorited);
      setCount(prevCount);
      showError("Lỗi kết nối");
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
      containerStyles += "justify-center shadow-lg rounded-full ";
      buttonStyles += "w-8 h-8 rounded-full bg-white dark:bg-gray-800 ";
      // Not favorited: text-gray-700 dark:text-gray-300 + border for visibility
      buttonStyles += favorited ? "bg-red-500 text-white " : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 ";
      iconStyles += "w-4 h-4 ";
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
        title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
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
