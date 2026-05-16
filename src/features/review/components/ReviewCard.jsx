import StarRating from "./StarRating";

const defaultAvatar =
  "https://ui-avatars.com/api/?background=e2e8f0&color=64748b&name=U";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export default function ReviewCard({ review, isOwner, onDelete }) {
  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      {/* Avatar */}
      <img
        src={review.userAvatar || defaultAvatar}
        alt={review.userFullname || "User"}
        className="h-10 w-10 rounded-full object-cover flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {review.userFullname || "Người dùng"}
            </span>
            <span className="ml-2 text-xs text-gray-400">
              {timeAgo(review.createdAt)}
              {review.updatedAt && " (đã chỉnh sửa)"}
            </span>
          </div>
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(review.id)}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Stars */}
        <div className="mt-1">
          <StarRating value={review.rating} readonly size={16} />
        </div>

        {/* Content */}
        {review.content && (
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {review.content}
          </p>
        )}

        {/* Aspect comments */}
        {review.aspects?.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {review.aspects.map((a) => (
              <div key={a.code} className="flex items-start gap-2 text-xs">
                <span className="shrink-0 font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-2 py-0.5 rounded-full">
                  {a.labelVi}
                </span>
                <span className="text-gray-600 dark:text-gray-400 pt-0.5">{a.comment}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
