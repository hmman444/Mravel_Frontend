import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Toast from "../../../components/Toast";
import { useTranslation } from "react-i18next";

export default function ManageLocationsPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [locations, setLocations] = useState([
        {
        id: 1,
        name: t("danang"),
        image:
            "https://cdnphoto.dantri.com.vn/TU79ri3KFMjhoSctnXOq3H7YS3U=/thumb_w/1360/2023/09/09/da-nang-docx-1694226826808.jpeg",
        },
        {
        id: 2,
        name: t("hue"),
        image:
            "https://static.vinwonders.com/production/du-lich-hue-mua-he-banner.jpg",
        },
        {
        id: 3,
        name: t("nhatrang"),
        image:
            "https://static.vinwonders.com/production/nha-trang-o-dau-1.jpg",
        },
        {
        id: 4,
        name: t("quynhon"),
        image:
            "https://static.vinwonders.com/production/du-lich-quy-nhon-banner.jpg",
        },
        {
        id: 5,
        name: t("quangbinh"),
        image:
            "https://ticotravel.com.vn/wp-content/uploads/2023/10/quang-binh-thang-10-1.jpg",
        },
        {
        id: 6,
        name: t("mientay"),
        image:
            "https://dulichviet.com.vn/images/bandidau/rung-tram-tra-su-an-giang(4).jpg",
        },
    ]);

    const [search, setSearch] = useState("");

    const filteredLocations = locations.filter((loc) =>
        loc.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {t("featured_locations")}
            </h1>
            <button
            onClick={() => Toast.info(t("add_location_demo"))}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
            <PlusIcon className="w-5 h-5" />
            {t("add_location")}
            </button>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="relative w-full md:w-96">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
                type="text"
                placeholder={t("search_location")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            </div>
        </div>

        {/* Grid kiểu Traveloka */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLocations.map((loc) => (
            <div
                key={loc.id}
                onClick={() => navigate(`/admin/locations/${loc.id}`)}
                className="relative overflow-hidden rounded-2xl cursor-pointer shadow-md group"
            >
                {/* Ảnh nền */}
                <img
                src={loc.image}
                alt={loc.name}
                className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-700"
                />

                {/* Overlay mờ khi hover */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition duration-500"></div>

                {/* Tên địa điểm */}
                <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-semibold drop-shadow-lg tracking-wide text-center">
                    {loc.name}
                </h3>
                </div>
            </div>
            ))}
        </div>
        </AdminLayout>
    );
}