import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Toast from "../../../components/Toast";
import { useTranslation } from "react-i18next";

export default function ManageAmenitiesPage() {
    const { t } = useTranslation();

    const [amenities, setAmenities] = useState([
        { id: 1, name: t("wifi_free"), desc: t("wifi_desc"), icon: "📶" },
        { id: 2, name: t("pool"), desc: t("pool_desc"), icon: "🏊‍♂️" },
        { id: 3, name: t("air_conditioner"), desc: t("air_conditioner_desc"), icon: "❄️" },
        { id: 4, name: t("breakfast_free"), desc: t("breakfast_desc"), icon: "🥐" },
        { id: 5, name: t("parking"), desc: t("parking_desc"), icon: "🅿️" },
        { id: 6, name: t("spa_massage"), desc: t("spa_desc"), icon: "💆‍♀️" },
        { id: 7, name: t("gym"), desc: t("gym_desc"), icon: "🏋️‍♂️" },
        { id: 8, name: t("pet_friendly"), desc: t("pet_desc"), icon: "🐶" },
        { id: 9, name: t("airport_shuttle"), desc: t("shuttle_desc"), icon: "🚌" },
        { id: 10, name: t("bar_lounge"), desc: t("bar_desc"), icon: "🍸" },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState(null);
    const [search, setSearch] = useState("");

    const openModal = (amenity = null) => {
        setEditingAmenity(amenity);
        setShowModal(true);
    };

    const deleteAmenity = (id) => {
        setAmenities((prev) => prev.filter((a) => a.id !== id));
        Toast.success(t("delete_success"));
    };

    const filteredAmenities = amenities.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t("manage_amenities")}</h1>
            <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
            <PlusIcon className="w-5 h-5" />
            {t("add_amenity")}
            </button>
        </div>

        {/* Toolbar: Search */}
        <div className="relative w-80 mb-6">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
            type="text"
            placeholder={t("search_amenity")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-md outline-none focus:ring focus:border-blue-500"
            />
        </div>

        {/* Grid danh sách tiện ích */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAmenities.length > 0 ? (
            filteredAmenities.map((a) => (
                <div
                key={a.id}
                className="bg-white rounded-lg shadow p-5 hover:shadow-md transition flex flex-col justify-between"
                >
                <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{a.icon}</div>
                    <div>
                    <h3 className="font-semibold text-lg">{a.name}</h3>
                    <p className="text-sm text-gray-500">{a.desc}</p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                    onClick={() => openModal(a)}
                    className="p-2 rounded hover:bg-gray-100"
                    >
                    <PencilIcon className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                    onClick={() => deleteAmenity(a.id)}
                    className="p-2 rounded hover:bg-gray-100"
                    >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                    </button>
                </div>
                </div>
            ))
            ) : (
            <p className="text-gray-500">{t("no_amenity_found")}</p>
            )}
        </div>

        {/* Modal thêm/sửa tiện ích */}
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                {editingAmenity ? t("edit_amenity") : t("add_new_amenity")}
                </h2>

                <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target;
                    const name = form.name.value.trim();
                    const desc = form.desc.value.trim();
                    const icon = form.icon.value.trim();

                    if (!name) {
                    Toast.error(t("empty_name_error"));
                    return;
                    }
                    if (editingAmenity) {
                    setAmenities((prev) =>
                        prev.map((a) =>
                        a.id === editingAmenity.id ? { ...a, name, desc, icon } : a
                        )
                    );
                    Toast.success(t("update_success"));
                    } else {
                    setAmenities((prev) => [
                        ...prev,
                        { id: Date.now(), name, desc, icon },
                    ]);
                    Toast.success(t("add_success"));
                    }

                    setShowModal(false);
                }}
                className="space-y-4"
                >
                <div>
                    <label className="block text-sm font-medium">{t("amenity_name")}</label>
                    <input
                    name="name"
                    defaultValue={editingAmenity?.name || ""}
                    className="w-full mt-1 px-3 py-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">{t("short_desc")}</label>
                    <input
                    name="desc"
                    defaultValue={editingAmenity?.desc || ""}
                    className="w-full mt-1 px-3 py-2 border rounded"
                    maxLength={100}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">{t("icon")}</label>
                    <input
                    name="icon"
                    defaultValue={editingAmenity?.icon || ""}
                    className="w-full mt-1 px-3 py-2 border rounded"
                    placeholder={t("icon_placeholder")}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                    <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded border hover:bg-gray-100"
                    >
                    {t("cancel")}
                    </button>
                    <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                    {t("save")}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </AdminLayout>
    );
}