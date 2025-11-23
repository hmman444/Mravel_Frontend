import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCatalogPlaces } from "../../catalog/hooks/useCatalogPlaces";

export default function ServiceList() {
  const { items, loading, error, fetchPlaces } = useCatalogPlaces();

  useEffect(() => {
    fetchPlaces({
      page: 0,
      size: 6,
      kind: "POI",
    });
  }, [fetchPlaces]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Đang tải các địa điểm tham quan...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-sm text-red-500">
          {error || "Không tải được danh sách địa điểm."}
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Hiện chưa có địa điểm nổi bật để hiển thị.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.slice(0, 6).map((poi) => {
          const cover =
            poi.coverImageUrl ||
            (poi.images &&
              (poi.images.find((img) => img.cover)?.url ||
                poi.images[0]?.url)) ||
            "https://via.placeholder.com/600x400?text=Mravel";

          return (
            <Link
              key={poi.id || poi.slug}
              to={`/place/${poi.slug}`}
              className="relative block overflow-hidden rounded-2xl cursor-pointer shadow-md shadow-slate-200/70 dark:shadow-black/40 group bg-gray-900"
            >
              <img
                src={cover}
                alt={poi.name}
                className="w-full h-44 md:h-52 object-cover transform group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent group-hover:from-black/80 group-hover:via-black/40 transition duration-500" />

              <div className="absolute inset-x-3 bottom-3">
                <span className="inline-flex px-2 py-1 text-[11px] rounded-full bg-white/15 text-slate-100 border border-white/20 mb-1.5">
                  Điểm đến phổ biến
                </span>
                <h3 className="text-white text-lg font-semibold drop-shadow-md tracking-wide line-clamp-2">
                  {poi.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <section className="py-12 md:py-14 bg-slate-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
              Địa điểm phổ biến
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gợi ý những nơi được nhiều du khách tìm kiếm và yêu thích.
            </p>
          </div>

          <a
            href="/places"
            className="hidden sm:inline-flex items-center text-sm text-primary hover:text-primaryHover"
          >
            Xem tất cả địa điểm →
          </a>
        </div>

        {renderContent()}
      </div>
    </section>
  );
}
