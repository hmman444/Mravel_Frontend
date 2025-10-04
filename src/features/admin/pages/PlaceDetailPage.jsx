import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  BuildingOfficeIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function PlaceDetailPage() {
  const { t } = useTranslation();
  const { placeId } = useParams();
  const navigate = useNavigate();

  // Dữ liệu demo
  const allPlaces = [
    {
      id: "dn1",
      name: "Bà Nà Hills",
      city: "Đà Nẵng",
      desc: t("place_desc_banahills"),
      gallery: [
        "https://i1-dulich.vnecdn.net/2025/04/14/BNtop-1744278998-9185-1744598184.jpg?w=0&h=0&q=100&dpr=1&fit=crop&s=hvBuLuNPiwUzBDJTr5mcTw",
        "https://i1-dulich.vnecdn.net/2025/04/14/BN1-1744276317-5431-1744598185.jpg?w=0&h=0&q=100&dpr=1&fit=crop&s=_ti5M-_n87ZjstZkL2HU8g",
        "https://i1-dulich.vnecdn.net/2025/04/14/BN6-1744278386-4629-1744598185.jpg?w=0&h=0&q=100&dpr=1&fit=crop&s=bQ3eznZtKWNb7IfJybBBKw",
        "https://i1-dulich.vnecdn.net/2025/04/14/BN10-1744278733-8227-1744598186.jpg?w=0&h=0&q=100&dpr=1&fit=crop&s=ha0x31m6sxlUSccZTsMJvQ",
      ],
      openTime: "07:00 - 17:00",
      category: t("tourist_area"),
      address: t("place_address_banahills"),
      highlights: [
        t("highlight_golden_bridge"),
        t("highlight_cool_weather"),
        t("highlight_french_village"),
        t("highlight_city_view"),
      ],
      reviews: [
        {
          name: "Trần Thị Na",
          rating: 5,
          comment: t("review_comment_1"),
          image:
            "https://i1-dulich.vnecdn.net/2025/04/14/BN12-1744279214-9090-1744598186.jpg?w=0&h=0&q=100&dpr=1&fit=crop&s=eYZAqVVg3WJiuL9riEt_fA",
        },
        {
          name: "Hà Thị Mỹ Huyền",
          rating: 5,
          comment: t("review_comment_2"),
          image:
            "https://duonggiahotel.vn/wp-content/uploads/2023/04/tour-ba-na-hills-1-ngay-4.jpg",
        },
      ],
      related: [
        {
          id: "dn2",
          name: "Cầu Rồng",
          image:
            "https://ticotravel.com.vn/wp-content/uploads/2022/04/Cau-Rong-Da-Nang-13-1025x600.jpg",
          duration: t("duration_1_day"),
          price: t("free"),
        },
        {
          id: "dn3",
          name: "Biển Mỹ Khê",
          image:
            "https://static.vinwonders.com/2022/04/bai-bien-my-khe-da-nang-2.jpg",
          duration: t("duration_all_day"),
          price: t("free"),
        },
      ],
    },
  ];

  const place = allPlaces.find((p) => p.id === placeId);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) =>
        prev === place.gallery.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [place.gallery.length]);

  if (!place) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
          <p className="text-lg mb-4">{t("place_not_found")}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {t("go_back")}
          </button>
        </div>
      </AdminLayout>
    );
  }

  const avgRating =
    place.reviews.reduce((a, r) => a + r.rating, 0) / place.reviews.length;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title={t("go_back")}
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">{place.name}</h1>
      </div>

      {/* Carousel ảnh */}
      <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-lg mb-6">
        <img
          src={place.gallery[currentImage]}
          alt={place.name}
          className="w-full h-full object-cover transition-all duration-700"
        />
        <button
          onClick={() =>
            setCurrentImage((prev) =>
              prev === 0 ? place.gallery.length - 1 : prev - 1
            )
          }
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() =>
            setCurrentImage((prev) =>
              prev === place.gallery.length - 1 ? 0 : prev + 1
            )
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {place.gallery.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`w-3 h-3 rounded-full cursor-pointer ${
                i === currentImage ? "bg-white" : "bg-gray-400"
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Điểm nổi bật */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {t("highlights")}
        </h2>
        <ul className="list-disc list-inside grid md:grid-cols-2 gap-y-2 text-gray-700 leading-relaxed">
          {place.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </section>

      {/* Đánh giá */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {t("reviews")}
        </h2>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl font-bold text-yellow-500">
            {avgRating.toFixed(1)}
          </span>
          <div>
            <p className="text-lg font-semibold text-gray-700">
              {t("excellent")}
            </p>
            <p className="text-gray-500 text-sm">
              {t("based_on_reviews", { count: place.reviews.length })}
            </p>
          </div>
        </div>

        {place.reviews.map((r, i) => (
          <div
            key={i}
            className="border-t border-gray-100 pt-4 mt-4 flex flex-col md:flex-row gap-4"
          >
            <div>
              <p className="font-semibold text-blue-700">{r.name}</p>
              <div className="flex gap-1">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mt-2 text-sm">{r.comment}</p>
            </div>
            {r.image && (
              <img
                src={r.image}
                alt="review"
                className="w-36 h-24 rounded-md object-cover"
              />
            )}
          </div>
        ))}
      </section>

      {/* Thông tin thêm */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {t("more_info")}
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">{place.desc}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-500" />
            {t("open_time")}: {place.openTime}
          </p>
          <p className="flex items-center gap-2">
            <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
            {t("category")}: {place.category}
          </p>
          <p className="flex items-center gap-2 md:col-span-2">
            <MapPinIcon className="w-5 h-5 text-blue-500" />
            {place.address}
          </p>
        </div>
      </section>

      {/* Địa điểm khác */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {t("related_places")}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {place.related.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <img
                src={r.image}
                alt={r.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{r.name}</h3>
                <p className="text-gray-500 text-sm mb-1">⏰ {r.duration}</p>
                <p className="text-blue-600 font-semibold">{r.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}