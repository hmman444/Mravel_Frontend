import { useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import {
    CheckCircleIcon,
    XCircleIcon,
    LockClosedIcon,
    LockOpenIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const MOCK_SERVICES = [
    {
        id: 1,
        name: "Tour Đà Lạt 3N2Đ",
        type: "Tour",
        price: "3.500.000đ",
        status: "active",
        vendor: "Travel Viet",
        thumbnail: "https://picsum.photos/seed/dalat/600/360",
        shortDesc: "Khám phá Đà Lạt, lịch trình 3 ngày 2 đêm.",
    },
    {
        id: 2,
        name: "Khách sạn Sunrise",
        type: "Khách sạn",
        price: "1.200.000đ/đêm",
        status: "suspended",
        vendor: "Sunrise Group",
        thumbnail: "https://picsum.photos/seed/sunrise/600/360",
        shortDesc: "Khách sạn 4*, trung tâm TP, buffet sáng.",
    },
    {
        id: 3,
        name: "Nhà hàng Biển Xanh",
        type: "Nhà hàng",
        price: "500.000đ/người",
        status: "pending",
        vendor: "Oceanic",
        thumbnail: "https://picsum.photos/seed/restaurant/600/360",
        shortDesc: "Set menu hải sản tươi mỗi ngày.",
    },
    {
        id: 4,
        name: "Thuê xe 7 chỗ",
        type: "Vận chuyển",
        price: "1.000.000đ/ngày",
        status: "active",
        vendor: "MoveGo",
        thumbnail: "https://picsum.photos/seed/car/600/360",
        shortDesc: "Xe 7 chỗ, tài xế nhiều kinh nghiệm.",
    },
    {
        id: 5,
        name: "Homestay Đồi Thông",
        type: "Khách sạn",
        price: "800.000đ/đêm",
        status: "pending",
        vendor: "PineStay",
        thumbnail: "https://picsum.photos/seed/homestay/600/360",
        shortDesc: "View rừng thông, decor ấm cúng.",
    },
];

export default function ManageServicesPage() {
    const { t } = useTranslation();

    // 🔹 Tabs lấy từ file dịch
    const STATUS_TABS = useMemo(() => [
        { key: "all", label: t("all") },
        { key: "pending", label: t("pending") },
        { key: "active", label: t("active") },
        { key: "suspended", label: t("suspended") },
    ], [t]);

    const [services, setServices] = useState(MOCK_SERVICES);
    const [tab, setTab] = useState("all");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState(t("all"));
    const [modal, setModal] = useState({ open: false, service: null, action: null, note: "" });

    // 🔹 Lọc loại dịch vụ
    const types = useMemo(() => {
        const tps = Array.from(new Set(services.map((s) => s.type)));
        return [t("all"), ...tps];
    }, [services, t]);

    const filtered = services.filter((s) => {
        const matchTab = tab === "all" ? true : s.status === tab;
        const matchSearch =
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.vendor.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === t("all") ? true : s.type === typeFilter;
        return matchTab && matchSearch && matchType;
    });

    // 🔹 Hành động xử lý
    const approveService = (id) => {
        setServices((prev) => prev.map((s) => (s.id === id ? { ...s, status: "active" } : s)));
    };
    const rejectService = (id) => {
        setServices((prev) => prev.filter((s) => s.id !== id));
    };
    const lockService = (id) => {
        setServices((prev) => prev.map((s) => (s.id === id ? { ...s, status: "suspended" } : s)));
    };
    const unlockService = (id) => {
        setServices((prev) => prev.map((s) => (s.id === id ? { ...s, status: "active" } : s)));
    };

    const onSubmitModal = () => {
        const { action, service } = modal;
        if (!service) return;
        if (action === "approve") approveService(service.id);
        if (action === "reject") rejectService(service.id);
        setModal({ open: false, service: null, action: null, note: "" });
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{t("manage_services")}</h1>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    {/* 🔹 Tabs dịch động */}
                    <div className="flex gap-2">
                        {STATUS_TABS.map((tabItem) => (
                            <button
                                key={tabItem.key}
                                onClick={() => setTab(tabItem.key)}
                                className={`px-3 py-1.5 rounded-md text-sm border ${
                                    tab === tabItem.key
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {tabItem.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1" />

                    {/* Search */}
                    <div className="relative w-72">
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("search_by_name_or_vendor")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border rounded-md outline-none focus:ring focus:border-blue-500"
                        />
                    </div>

                    {/* Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                    >
                        {types.map((tType) => (
                            <option key={tType}>{tType}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid danh sách */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((s) => (
                    <div key={s.id} className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden flex flex-col">
                        <div className="relative">
                            <img src={s.thumbnail} alt={s.name} className="h-40 w-full object-cover" />
                            <span
                                className={`absolute top-3 left-3 px-2 py-1 text-xs rounded-full ${
                                    s.status === "active"
                                        ? "bg-green-100 text-green-700"
                                        : s.status === "pending"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {t(s.status)}
                            </span>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{s.name}</h3>
                                <p className="text-sm text-gray-500">{s.vendor} • {s.type}</p>
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{s.shortDesc}</p>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-blue-600 font-semibold">{s.price}</span>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded hover:bg-gray-100" title={t("details")}>
                                        <InformationCircleIcon className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button className="p-2 rounded hover:bg-gray-100" title={t("edit")}>
                                        <PencilIcon className="w-5 h-5 text-gray-600" />
                                    </button>

                                    {s.status === "pending" && (
                                        <>
                                            <button
                                                onClick={() => setModal({ open: true, service: s, action: "approve", note: "" })}
                                                className="p-2 rounded hover:bg-green-50"
                                                title={t("approve")}
                                            >
                                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                            </button>
                                            <button
                                                onClick={() => setModal({ open: true, service: s, action: "reject", note: "" })}
                                                className="p-2 rounded hover:bg-red-50"
                                                title={t("reject")}
                                            >
                                                <XCircleIcon className="w-5 h-5 text-red-600" />
                                            </button>
                                        </>
                                    )}

                                    {s.status === "active" && (
                                        <button
                                            onClick={() => lockService(s.id)}
                                            className="p-2 rounded hover:bg-red-50"
                                            title={t("lock")}
                                        >
                                            <LockClosedIcon className="w-5 h-5 text-red-600" />
                                        </button>
                                    )}

                                    {s.status === "suspended" && (
                                        <button
                                            onClick={() => unlockService(s.id)}
                                            className="p-2 rounded hover:bg-green-50"
                                            title={t("unlock")}
                                        >
                                            <LockOpenIcon className="w-5 h-5 text-green-600" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal xác nhận */}
            {modal.open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-2">
                            {modal.action === "approve" ? t("approve_service") : t("reject_service")}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {t("service")}: <span className="font-medium">{modal.service?.name}</span>
                        </p>

                        <label className="block text-sm font-medium mb-1">{t("note_optional")}</label>
                        <textarea
                            value={modal.note}
                            onChange={(e) => setModal((m) => ({ ...m, note: e.target.value }))}
                            placeholder={
                                modal.action === "approve"
                                    ? t("note_when_approving")
                                    : t("note_when_rejecting")
                            }
                            className="w-full border rounded p-2 h-24"
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setModal({ open: false, service: null, action: null, note: "" })}
                                className="px-4 py-2 rounded border hover:bg-gray-100"
                            >
                                {t("cancel")}
                            </button>
                            {modal.action === "approve" ? (
                                <button
                                    onClick={onSubmitModal}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    {t("confirm_approve")}
                                </button>
                            ) : (
                                <button
                                    onClick={onSubmitModal}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    {t("confirm_reject")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}