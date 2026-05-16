import { Link } from "react-router-dom";
import FavoriteButton from "../../../components/FavoriteButton";

export default function ResultGrid({ items }) {
  if (!items?.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {items.map((p) => (
        <Link
          key={p.slug}
          to={`/place/${p.slug}`}
          className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
        >
          <FavoriteButton
            targetType="PLACE"
            targetId={p.id}
            className="absolute top-2 right-2 z-10"
            showCount={true}
            variant="card"
          />
          <div className="w-full h-44">
            {p.coverImageUrl ? (
              <img
                src={p.coverImageUrl}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
            )}
          </div>
          <div className="p-3">
            <div className="font-semibold line-clamp-1">{p.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{p.shortDescription || p.addressLine}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}