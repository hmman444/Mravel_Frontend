export default function PostSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-md p-5 sm:p-6 animate-pulse">
      {/* Author header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-lg w-32" />
          <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>

      {/* Title */}
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mb-2" />

      {/* Meta row */}
      <div className="flex items-center gap-4 mb-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>

      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6" />
      </div>

      {/* Media placeholder */}
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />

      {/* Action bar */}
      <div className="h-px bg-gray-100 dark:bg-gray-800 mb-3" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14" />
        </div>
      </div>
    </div>
  );
}
