import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trans, useTranslation } from "react-i18next";
import { submitReview, editReview } from "../slices/reviewSlice";
import StarRating from "./StarRating";
import { toast } from "react-toastify";

export default function ReviewForm({ targetType, targetId, targetSlug, targetName, onSubmitted }) {
  const { t, i18n } = useTranslation();
  const aspectLabel = (a) =>
    i18n.language === "en" ? a?.labelEn || a?.labelVi : a?.labelVi;
  const dispatch = useDispatch();
  const { myReview, submitting } = useSelector((s) => s.review);
  const aspectDefinitions = useSelector(
    (s) => s.review.aspectDefinitions[targetType] ?? []
  );
  const isLoggedIn = useSelector((s) => !!s.auth.user);

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  // { [code]: comment } — only selected aspects appear here
  const [selectedAspects, setSelectedAspects] = useState({});

  const isEditing = !!myReview;

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setContent(myReview.content || "");
      if (myReview.aspects?.length) {
        const map = {};
        myReview.aspects.forEach((a) => { map[a.code] = a.comment; });
        setSelectedAspects(map);
      } else {
        setSelectedAspects({});
      }
    } else {
      setRating(0);
      setContent("");
      setSelectedAspects({});
    }
  }, [myReview]);

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <Trans
          i18nKey="review.login_to_review"
          components={{ a: <a href="/login" className="text-blue-600 dark:text-sky-300 hover:underline font-medium" /> }}
        />

      </div>
    );
  }

  const toggleAspect = (code) => {
    setSelectedAspects((prev) => {
      if (prev[code] !== undefined) {
        const { [code]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [code]: "" };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.warning(t("review.please_select_rating"));
      return;
    }

    const aspects = Object.entries(selectedAspects)
      .filter(([, comment]) => comment.trim())
      .map(([aspectCode, comment]) => ({ aspectCode, comment }));

    const payload = { rating, content, ...(aspects.length ? { aspects } : {}) };

    let result;
    if (isEditing) {
      result = await dispatch(editReview({ reviewId: myReview.id, payload }));
    } else {
      result = await dispatch(submitReview({ targetType, targetId, targetSlug, targetName, ...payload }));
    }

    if (!result.error) {
      toast.success(isEditing ? t("review.update_success") : t("review.submit_success"));
      onSubmitted?.();
    } else {
      toast.error(result.payload || t("review.error_generic"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {isEditing ? t("review.edit_your_review_label") : t("review.your_review_label")}
        </span>
        <StarRating value={rating} onChange={setRating} size={28} />
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("review.content_placeholder")}
        rows={3}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-3 text-sm
                   focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none
                   resize-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
      />

      {/* Aspect chips — only show when definitions are loaded */}
      {aspectDefinitions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t("review.detailed_optional")}
          </p>
          <div className="flex flex-wrap gap-2">
            {aspectDefinitions.map((def) => {
              const isSelected = selectedAspects[def.code] !== undefined;
              return (
                <button
                  key={def.code}
                  type="button"
                  onClick={() => toggleAspect(def.code)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-400"
                  }`}
                >
                  {aspectLabel(def)}
                </button>
              );
            })}
          </div>

          {/* Textareas for selected aspects */}
          {Object.keys(selectedAspects).length > 0 && (
            <div className="space-y-2 pt-1">
              {aspectDefinitions
                .filter((def) => selectedAspects[def.code] !== undefined)
                .map((def) => (
                  <div key={def.code} className="grid grid-cols-[8rem_1fr] gap-3 items-start">
                    <span className="pt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 leading-snug">
                      {aspectLabel(def)}
                    </span>
                    <textarea
                      value={selectedAspects[def.code]}
                      onChange={(e) =>
                        setSelectedAspects((prev) => ({
                          ...prev,
                          [def.code]: e.target.value,
                        }))
                      }
                      placeholder={t("review.aspect_comment_placeholder", { aspect: aspectLabel(def).toLowerCase() })}
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm
                                 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none
                                 resize-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white
                     hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting
            ? t("review.submitting")
            : isEditing
              ? t("review.update_btn")
              : t("review.submit_review")}
        </button>
      </div>
    </form>
  );
}
