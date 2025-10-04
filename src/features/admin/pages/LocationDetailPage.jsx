import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
    MapPinIcon,
    ClockIcon,
    BuildingOfficeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowLeftIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function LocationDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const cities = [
        { id: 1, name: t("da_nang") },
        { id: 2, name: t("hue") },
        { id: 3, name: t("nha_trang") },
        { id: 4, name: t("quy_nhon") },
        { id: 5, name: t("quang_binh") },
        { id: 6, name: t("mien_tay") },
    ];

    const data = {
        1: {
        city: t("da_nang"),
        places: [
            {
            id: "dn1",
            name: "Bà Nà Hills",
            desc: t("ba_na_desc"),
            image:
                "https://banahills.sunworld.vn/wp-content/uploads/2020/03/L%C3%A0ng-ph%C3%A1p-6-1024x737.jpg",
            openTime: "07:00 - 17:00",
            category: t("tourist_area"),
            },
            {
            id: "dn2",
            name: "Cầu Rồng",
            desc: t("cau_rong_desc"),
            image:
                "https://ticotravel.com.vn/wp-content/uploads/2022/04/Cau-Rong-Da-Nang-13-1025x600.jpg",
            openTime: t("all_day"),
            category: t("sightseeing_spot"),
            },
            {
            id: "dn3",
            name: "Biển Mỹ Khê",
            desc: t("my_khe_desc"),
            image:
                "https://static.vinwonders.com/2022/04/bai-bien-my-khe-da-nang-2.jpg",
            openTime: "05:00 - 19:00",
            category: t("beach"),
            },
        ],
        },
        2: {
        city: t("hue"),
        places: [
            {
            id: "h1",
            name: "Kinh Thành Huế",
            desc: t("hue_citadel_desc"),
            image:
                "https://static.vinwonders.com/production/kinh-thanh-hue-topbanner_optimized.jpg",
            openTime: "07:00 - 17:30",
            category: t("historical_site"),
            },
        ],
        },
    };

    const cityInfo = cities.find((c) => c.id === Number(id));
    const cityData = data[id] || { city: cityInfo?.name || t("unknown"), places: [] };

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState(t("all"));

    const filteredPlaces = cityData.places.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === t("all") || p.category === filter;
        return matchSearch && matchFilter;
    });

    return (
        <AdminLayout>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
            <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                title={t("go_back")}
            >
                <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{cityData.city}</h1>
                <p className="text-gray-500 mt-1">
                {t("places_in_city", { city: cityData.city })}
                </p>
            </div>
            </div>
        </div>

        {/* Layout chính */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Bộ lọc */}
            <div className="bg-white shadow-md rounded-xl p-5 border border-gray-100 lg:col-span-1 h-fit">
            <h3 className="font-semibold text-blue-600 flex items-center gap-2 mb-4">
                <FunnelIcon className="w-5 h-5" /> {t("filter")}
            </h3>

            <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                type="text"
                placeholder={t("search_places")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t("category")}
            </h4>
            {[t("all"), t("tourist_area"), t("sightseeing_spot"), t("beach"), t("historical_site")].map(
                (c) => (
                <label
                    key={c}
                    className="flex items-center gap-2 text-gray-600 text-sm mb-2 cursor-pointer"
                >
                    <input
                    type="radio"
                    name="category"
                    value={c}
                    checked={filter === c}
                    onChange={(e) => setFilter(e.target.value)}
                    className="accent-blue-500"
                    />
                    {c}
                </label>
                )
            )}
            </div>

            {/* Danh sách địa điểm */}
            <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                <h2 className="font-semibold text-gray-800 text-lg">
                    {t("places_at_city", { city: cityData.city })}
                </h2>
                <p className="text-sm text-gray-500">
                    {filteredPlaces.length} {t("places_found")}
                </p>
                </div>

                <button
                onClick={() =>
                    alert(`${t("add_place_to_city", { city: cityData.city })}`)
                }
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow hover:bg-blue-700 transition"
                >
                <PlusIcon className="w-4 h-4" />
                {t("add_place")}
                </button>
            </div>

            {filteredPlaces.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                {filteredPlaces.map((p) => (
                    <div
                    key={p.id}
                    className="flex flex-col md:flex-row bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition h-full"
                    >
                    <div className="w-full md:w-64 h-48 flex-shrink-0">
                        <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="p-5 flex flex-col justify-between flex-1">
                        <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer">
                            {p.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {p.desc}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <p className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4 text-blue-500" />
                            {t("open_time")}: {p.openTime}
                            </p>
                            <p className="flex items-center gap-1">
                            <BuildingOfficeIcon className="w-4 h-4 text-blue-500" />
                            {t("type")}: {p.category}
                            </p>
                            <p className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4 text-blue-500" />{" "}
                            {cityData.city}
                            </p>
                        </div>
                        </div>

                        <div className="flex justify-end mt-4">
                        <button
                            onClick={() => navigate(`/admin/places/${p.id}`)}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-sm font-semibold transition"
                        >
                            {t("view_detail")}
                        </button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-10">
                {t("no_places_found")}
                </p>
            )}
            </div>
        </div>
        </AdminLayout>
    );
}