export default function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mt-4 mb-3" />
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
    </div>
  );
}
