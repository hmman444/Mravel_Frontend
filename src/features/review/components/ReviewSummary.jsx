import { useTranslation } from "react-i18next";
import StarRating from "./StarRating";

export default function ReviewSummary({ summary }) {
  const { t, i18n } = useTranslation();
  const aspectLabel = (a) =>
    i18n.language === "en" ? a?.labelEn || a?.labelVi : a?.labelVi;
  if (!summary) return null;

  const {
    averageRating = 0,
    totalReviews = 0,
    ratingDistribution = {},
    popularAspects,
  } = summary;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        {/* Rating lớn */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">/ 5</span>
          </div>
          <StarRating value={averageRating} readonly size={20} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("review.reviews_count", { count: totalReviews })}
          </span>
        </div>

        {/* Phân bố sao */}
        <div className="flex-1 w-full space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-gray-600 dark:text-gray-400">{star}</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-500 dark:text-gray-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular aspects */}
      {popularAspects?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {t("review.popular_aspects")}
          </p>
          <div className="flex flex-wrap gap-2">
            {popularAspects.map((a) => (
              <span
                key={a.code}
                className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300
                           border border-blue-100 dark:border-blue-800 px-2.5 py-1 rounded-full"
              >
                {aspectLabel(a)}
                <span className="ml-1 text-blue-400 dark:text-blue-500">·{a.mentionCount}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
