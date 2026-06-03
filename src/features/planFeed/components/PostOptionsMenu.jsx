import { useState, useRef, useEffect } from "react";
import {
  EllipsisHorizontalIcon,
  EyeSlashIcon,
  NoSymbolIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

/**
 * Menu «…» trên mỗi bài viết (chỉ phần UI). Hành động thực tế + modal xác nhận
 * được xử lý ở component cha (PlanPostCard) để modal vẫn tồn tại sau khi ẩn bài.
 */
export default function PostOptionsMenu({ isOwnPost, onHide, onBlock, onReport }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const run = (fn) => () => {
    setOpen(false);
    fn?.();
  };

  const itemBase =
    "flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition"
        title={t("feed.post.options", "Tùy chọn")}
        aria-label={t("feed.post.options", "Tùy chọn")}
      >
        <EllipsisHorizontalIcon className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-1 w-56 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1 text-sm">
          <button type="button" onClick={run(onHide)} className={`${itemBase} text-gray-700 dark:text-gray-200`}>
            <EyeSlashIcon className="w-4 h-4" /> {t("feed.post.hide", "Ẩn bài viết")}
          </button>
          {!isOwnPost && (
            <button
              type="button"
              onClick={run(onBlock)}
              className={`${itemBase} text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30`}
            >
              <NoSymbolIcon className="w-4 h-4" /> {t("feed.post.block_author", "Chặn người này")}
            </button>
          )}
          <button type="button" onClick={run(onReport)} className={`${itemBase} text-gray-700 dark:text-gray-200`}>
            <FlagIcon className="w-4 h-4" /> {t("feed.post.report", "Báo cáo")}
          </button>
        </div>
      )}
    </div>
  );
}
