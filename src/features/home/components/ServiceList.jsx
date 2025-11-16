// src/features/home/components/ServiceList.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCatalogPlaces } from "../../catalog/hooks/useCatalogPlaces";

export default function ServiceList() {
  const { items, loading, error, fetchPlaces } = useCatalogPlaces();

  useEffect(() => {
    // Lấy 6 POI phổ biến (page=0, size=6)
    fetchPlaces({
      page: 0,
      size: 6,
      // nếu backend có sort theo popularity thì có thể thêm:
      // sort: "popularity,DESC",
      kind: "POI", // phòng khi backend còn filter theo kind
    });
  }, [fetchPlaces]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-sm text-gray-500">
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
        <div className="text-sm text-gray-500">
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
              // ❗ Nếu route detail của bạn là dạng khác (vd: "/places/:slug")
              // thì đổi lại cho đúng:
              // to={`/places/${poi.slug}`}
              to={`/place/${poi.slug}`}
              className="relative block overflow-hidden rounded-2xl cursor-pointer shadow-md group"
            >
              {/* Ảnh nền */}
              <img
                src={cover}
                alt={poi.name}
                className="w-full h-44 md:h-52 object-cover transform group-hover:scale-105 transition duration-700"
              />

              {/* Overlay mờ khi hover */}
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition duration-500" />

              {/* Tên địa điểm trên ảnh */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-lg md:text-xl font-semibold drop-shadow-lg tracking-wide text-center px-3">
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
    <section className="py-12 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-black">
        Địa điểm phổ biến
      </h2>
      {renderContent()}
    </section>
  );
}