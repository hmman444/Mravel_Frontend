import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReviews,
  fetchReviewSummary,
  fetchMyReview,
  fetchAspectDefinitions,
  removeReview,
  clearReviews,
} from "../slices/reviewSlice";
import ReviewSummary from "./ReviewSummary";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";
import { toast } from "react-toastify";
import ConfirmModal from "../../../components/ConfirmModal";

export default function ReviewSection({ targetType, targetId }) {
  const dispatch = useDispatch();
  const {
    reviews,
    loading,
    hasMore,
    page,
    summary,
    myReview,
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
      toast.success("Đã xóa đánh giá");
      dispatch(fetchReviewSummary({ targetType, targetId }));
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
        Đánh giá
      </h2>

      {/* Summary */}
      <ReviewSummary summary={summary} />

      {/* Form */}
      <div className="mt-6">
        <ReviewForm
          targetType={targetType}
          targetId={targetId}
          onSubmitted={handleSubmitted}
        />
      </div>

      {/* Danh sách review */}
      <div className="mt-6">
        {reviews.length === 0 && !loading && (
          <p className="text-sm text-gray-400 text-center py-4">
            Chưa có đánh giá nào. Hãy là người đầu tiên!
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
            Đang tải...
          </p>
        )}

        {hasMore && !loading && reviews.length > 0 && (
          <div className="text-center mt-4">
            <button
              onClick={handleLoadMore}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium
                         transition-colors"
            >
              Xem thêm đánh giá
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa nhận xét này hay không?"
        confirmText="Đồng ý"
        cancelText="Hủy"
      />
    </div>
  );
}
