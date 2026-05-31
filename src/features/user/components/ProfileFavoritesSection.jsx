import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeartIcon } from "@heroicons/react/24/solid";
import { getMyFavorites } from "../../catalog/services/favoriteService";

const SUB_TABS = [
  { key: "PLACE", labelKey: "user.fav_places" },
  { key: "HOTEL", labelKey: "user.fav_hotels" },
  { key: "RESTAURANT", labelKey: "user.fav_restaurants" },
];

const detailPath = (type, slug) => {
  switch (type) {
    case "HOTEL":
      return `/hotels/${slug}`;
    case "RESTAURANT":
      return `/restaurants/${slug}`;
    case "PLACE":
      return `/place/${slug}`;
    default:
      return "#";
  }
};

export default function ProfileFavoritesSection() {
  const { t } = useTranslation();
  const [type, setType] = useState("PLACE");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (targetType) => {
    setLoading(true);
    const res = await getMyFavorites({ targetType, page: 0, size: 24 });
    setItems(res?.success ? res.data?.content ?? [] : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(type);
  }, [type, load]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80">
      {/* Sub-tabs (lằn gạch xanh dưới mục đang chọn) */}
      <div className="flex gap-1 border-b border-slate-200 px-2 dark:border-slate-800 sm:px-4">
        {SUB_TABS.map((st) => {
          const active = type === st.key;
          return (
            <button
              key={st.key}
              type="button"
              onClick={() => setType(st.key)}
              className={
                "relative px-4 py-3 text-sm font-semibold transition-colors " +
                (active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")
              }
            >
              {t(st.labelKey)}
              {active && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Nội dung */}
      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
            <HeartIcon className="h-10 w-10 text-slate-200 dark:text-slate-700" />
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("user.fav_empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((it) => (
              <Link
                key={it.id}
                to={detailPath(it.targetType, it.targetSlug)}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-lg dark:ring-slate-800"
              >
                {/* Ảnh */}
                {it.targetImage ? (
                  <img
                    src={it.targetImage}
                    alt={it.targetName}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
                )}

                {/* Lớp phủ gradient để chữ nổi */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                {/* Icon tim */}
                <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm backdrop-blur">
                  <HeartIcon className="h-4 w-4" />
                </span>

                {/* Tên */}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow-md">
                    {it.targetName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
