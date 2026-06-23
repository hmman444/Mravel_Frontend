import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReviews,
  fetchReviewSummary,
  fetchMyReview,
  fetchAspectDefinitions,
  fetchCanReview,
  removeReview,
  clearReviews,
} from "../slices/reviewSlice";
import ReviewSummary from "./ReviewSummary";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../../../components/ConfirmModal";

export default function ReviewSection({ targetType, targetId, targetSlug, targetName }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    reviews,
    loading,
    hasMore,
    page,
    summary,
    myReview,
    canReview,
  } = useSelector((s) => s.review);
  const currentUserId = useSelector((s) => s.auth.user?.id);
  const myReviewFetchedRef = useRef(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [reviewIdToDelete, setReviewIdToDelete] = useState(null);

  useEffect(() => {
    if (!targetType || !targetId) return;
    myReviewFetchedRef.current = null;
    dispatch(clearReviews());
    dispatch(fetchReviews({ targetType, targetId, page: 0, size: 5 }));
    dispatch(fetchReviewSummary({ targetType, targetId }));
    dispatch(fetchAspectDefinitions(targetType));
    return () => {
      dispatch(clearReviews());
    };
  }, [targetType, targetId, dispatch]);

  useEffect(() => {
    if (!currentUserId || !targetType || !targetId) return;
    dispatch(fetchCanReview({ targetType, targetId, slug: targetSlug, name: targetName }));
  }, [currentUserId, targetType, targetId, targetSlug, targetName, dispatch]);

  useEffect(() => {
    if (!currentUserId || !targetType || !targetId) return;
    dispatch(fetchCanReview({ targetType, targetId, slug: targetSlug, name: targetName }));
  }, [currentUserId, targetType, targetId, targetSlug, targetName, dispatch]);

  useEffect(() => {
    const key = `${currentUserId}_${targetType}_${targetId}`;
    if (currentUserId && targetType && targetId && myReviewFetchedRef.current !== key) {
      myReviewFetchedRef.current = key;
      dispatch(fetchMyReview({ targetType, targetId }));
    }
  }, [currentUserId, targetType, targetId, dispatch]);

  const handleLoadMore = () => {
    dispatch(fetchReviews({ targetType, targetId, page: page + 1, size: 5 }));
  };

  const handleDelete = (reviewId) => {
    setReviewIdToDelete(reviewId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewIdToDelete) return;
    const result = await dispatch(removeReview(reviewIdToDelete));
    if (!result.error) {
      toast.success(t("review.delete_success"));
      dispatch(fetchReviewSummary({ targetType, targetId }));
    } else {
      toast.error(result.payload || t("common.error_occurred"));
    }
    handleCloseConfirm();
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setReviewIdToDelete(null);
  };

  const handleSubmitted = () => {
    dispatch(fetchReviewSummary({ targetType, targetId }));
  };

  return (
    <div className="px-6 py-8 sm:px-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t("review.title")}
      </h2>

      {/* Summary */}
      <ReviewSummary summary={summary} />

      {/* Form — chỉ hiện khi user đã trải nghiệm dịch vụ (hoặc đã từng đánh giá) */}
      <div className="mt-6">
        {!currentUserId ? (
          <ReviewForm
            targetType={targetType}
            targetId={targetId}
            targetSlug={targetSlug}
            targetName={targetName}
            onSubmitted={handleSubmitted}
          />
        ) : canReview === false ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
            {t("review.not_experienced")}
          </div>
        ) : canReview === true ? (
          <ReviewForm
            targetType={targetType}
            targetId={targetId}
            targetSlug={targetSlug}
            targetName={targetName}
            onSubmitted={handleSubmitted}
          />
        ) : null}
      </div>

      {/* Danh sách review */}
      <div className="mt-6">
        {reviews.length === 0 && !loading && (
          <p className="text-sm text-gray-400 text-center py-4">
            {t("review.empty")}
          </p>
        )}

        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwner={currentUserId === review.userId}
            onDelete={handleDelete}
          />
        ))}

        {loading && (
          <p className="text-center text-sm text-gray-400 py-4">
            {t("common.loading")}
          </p>
        )}

        {hasMore && !loading && reviews.length > 0 && (
          <div className="text-center mt-4">
            <button
              onClick={handleLoadMore}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium
                         transition-colors"
            >
              {t("review.load_more")}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        title={t("review.confirm_delete_title")}
        message={t("review.confirm_delete_message")}
        confirmText={t("review.confirm_delete_yes")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
}
