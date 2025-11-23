export default function PostSkeleton() {
  return (
    <div
      className="
        bg-white/95 dark:bg-gray-900/90
        rounded-2xl border border-gray-100 dark:border-gray-800
        shadow-md p-4 sm:p-5 animate-pulse
      "
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>

      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mt-4 mb-3" />
      <div className="h-40 sm:h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mt-4" />
    </div>
  );
}
