import { Link } from "react-router-dom";

export default function ResultList({ items }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-4">
      {items.map((p) => (
        <Link
          key={p.slug}
          to={`/place/${p.slug}`}
          className="block rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col md:flex-row">
            <div className="md:w-[280px] md:h-[180px] w-full h-48 shrink-0 overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
              {p.coverImageUrl
                ? <img src={p.coverImageUrl} alt={p.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gray-200" />}
            </div>

            <div className="flex-1 p-4">
              <div className="min-w-0">
                <div className="text-lg font-semibold truncate">{p.name}</div>
                <div className="text-sm text-gray-500 mt-1 line-clamp-2">{p.shortDescription || p.addressLine}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
                  {p.addressLine && <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">{p.addressLine}</span>}
                  {p.provinceName && <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">{p.provinceName}</span>}
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}