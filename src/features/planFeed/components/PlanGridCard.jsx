import { useMemo } from "react";
import { MapPin, Calendar, Wallet, Star, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { truncate } from "../utils/utils";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80";
const DEFAULT_AVATAR =
  "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg";

function HighlightText({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = String(text).split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-yellow-200 dark:bg-yellow-800/50 text-inherit rounded-sm px-0.5 not-italic"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function formatBudget(amount) {
  const num = Number(amount);
  if (!amount || isNaN(num) || num <= 0) return null;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${Math.round(num / 1_000_000)}tr`;
  if (num >= 1_000) return `${Math.round(num / 1_000)}k`;
  return String(num);
}

/**
 * Compact grid card for PlanListPage feed.
 * Props:
 *   plan        — plan object from Redux state
 *   searchQuery — current search keyword (for highlight)
 */
export default function PlanGridCard({ plan, searchQuery = "" }) {
  const { t } = useTranslation();
  const desc = truncate(plan.description || "", 90);

  const coverImage = useMemo(() => {
    const imgs = plan.images;
    if (!imgs || imgs.length === 0) return DEFAULT_COVER;
    const first = imgs[0];
    if (typeof first === "string") return first;
    return first.url || first.imageUrl || first.src || DEFAULT_COVER;
  }, [plan.images]);

  const destinations = useMemo(
    () =>
      (plan.destinations || [])
        .map((d) => d?.name?.trim())
        .filter(Boolean),
    [plan.destinations]
  );

  const totalReactions = useMemo(
    () =>
      Object.values(plan.reactions || {}).reduce(
        (a, b) => a + Number(b),
        0
      ),
    [plan.reactions]
  );

  const budgetStr = formatBudget(plan.budgetTotal);
  const rating = plan.averageRating ?? plan.rating ?? null;

  return (
    <motion.article
      whileHover={{ y: -6, transition: { duration: 0.2, ease: "easeOut" } }}
      className="group rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-shadow duration-300 cursor-pointer flex flex-col"
      onClick={() => {
        window.location.href = `/plans/${plan.id}`;
      }}
    >
      {/* Cover image — 16:9 */}
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
        <img
          src={coverImage}
          alt={plan.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = DEFAULT_COVER;
          }}
        />
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Rating badge — top right */}
        {rating != null && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
              {Number(rating).toFixed(1)}
            </span>
          </div>
        )}

        {/* Duration badge — bottom left */}
        {plan.days != null && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-sky-500/90 backdrop-blur-sm text-white text-xs font-semibold shadow">
            {t("feed.card.days", { count: plan.days })}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-gray-50 line-clamp-2 leading-snug text-[15px] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-200">
          <HighlightText text={plan.title} query={searchQuery} />
        </h3>

        {/* Description */}
        {desc.short && (
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            <HighlightText text={desc.short} query={searchQuery} />
          </p>
        )}

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {plan.startDate && (
            <span className="flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              {plan.startDate}
            </span>
          )}
          {destinations.length > 0 && (
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">
                {destinations.slice(0, 2).join(", ")}
                {destinations.length > 2 && ` +${destinations.length - 2}`}
              </span>
            </span>
          )}
        </div>

        {/* Footer: budget / reactions + author */}
        <div className="mt-auto pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {budgetStr ? (
              <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                <Wallet className="w-3.5 h-3.5" />
                {budgetStr}
              </span>
            ) : totalReactions > 0 ? (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                {totalReactions}
              </span>
            ) : null}
          </div>

          {/* Author */}
          <div className="flex items-center gap-1.5 shrink-0">
            <img
              src={plan.author?.avatar || DEFAULT_AVATAR}
              alt={plan.author?.name || "user"}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-white dark:ring-gray-900"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate max-w-[80px]">
              {plan.author?.name || t("feed.card.anonymous")}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
