import { useState, useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import {
    MagnifyingGlassIcon,
    EyeIcon,
    ArchiveBoxIcon,
    TrashIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function ManageReportsPage() {
    const { t } = useTranslation();

    const MOCK_REPORTS = [
        {
        id: 1,
        reporter: "Nguyễn An",
        content: t("report_service_incorrect"),
        date: "01/10/2025",
        type: t("service"),
        status: "pending",
        },
        {
        id: 2,
        reporter: "Trần Bình",
        content: t("report_closed_location"),
        date: "28/09/2025",
        type: t("location"),
        status: "resolved",
        },
        {
        id: 3,
        reporter: "Lê Hoa",
        content: t("report_user_misconduct"),
        date: "26/09/2025",
        type: t("user"),
        status: "processing",
        },
    ];

    const STATUS_TABS = [
        { key: "all", label: t("all") },
        { key: "pending", label: t("pending") },
        { key: "processing", label: t("processing") },
        { key: "resolved", label: t("resolved") },
        { key: "archived", label: t("archived") },
    ];

    const [reports, setReports] = useState(MOCK_REPORTS);
    const [tab, setTab] = useState("all");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState(t("all"));
    const [detail, setDetail] = useState(null);

    const types = useMemo(() => {
        const tset = Array.from(new Set(reports.map((r) => r.type)));
        return [t("all"), ...tset];
    }, [reports, t]);

    const filtered = reports.filter((r) => {
        const matchTab = tab === "all" ? true : r.status === tab;
        const matchSearch =
        r.content.toLowerCase().includes(search.toLowerCase()) ||
        r.reporter.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === t("all") ? true : r.type === typeFilter;
        return matchTab && matchSearch && matchType;
    });

    const updateStatus = (id, status) => {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    };

    return (
        <AdminLayout>
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6">{t("manage_reports")}</h1>

        {/* Toolbar */}
        <div className="bg-white shadow rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-center">
            {/* Tabs */}
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
            <div className="relative w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
                type="text"
                placeholder={t("search_report")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-md outline-none focus:ring focus:border-blue-500"
            />
            </div>

            {/* Type filter */}
            <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
            >
            {types.map((tp) => (
                <option key={tp}>{tp}</option>
            ))}
            </select>
        </div>

        {/* Report list */}
        <div className="space-y-4">
            {filtered.map((r) => (
            <div
                key={r.id}
                className="bg-white rounded-lg shadow p-4 flex justify-between items-start hover:shadow-md transition"
            >
                <div>
                <h3 className="font-semibold">{r.content}</h3>
                <p className="text-sm text-gray-500 mt-1">
                    {t("reporter")}: {r.reporter} • {r.date} • {t("type")}: {r.type}
                </p>
                <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${
                    r.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : r.status === "processing"
                        ? "bg-blue-100 text-blue-700"
                        : r.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                >
                    {STATUS_TABS.find((s) => s.key === r.status)?.label}
                </span>
                </div>

                <div className="flex gap-2">
                <button
                    onClick={() => setDetail(r)}
                    className="p-2 rounded hover:bg-gray-100"
                    title={t("view_detail")}
                >
                    <EyeIcon className="w-5 h-5 text-gray-600" />
                </button>

                {r.status === "pending" && (
                    <>
                    <button
                        onClick={() => updateStatus(r.id, "processing")}
                        className="p-2 rounded hover:bg-blue-50"
                        title={t("mark_processing")}
                    >
                        <ExclamationCircleIcon className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                        onClick={() => updateStatus(r.id, "resolved")}
                        className="p-2 rounded hover:bg-green-50"
                        title={t("mark_resolved")}
                    >
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </button>
                    </>
                )}

                {r.status === "processing" && (
                    <button
                    onClick={() => updateStatus(r.id, "resolved")}
                    className="p-2 rounded hover:bg-green-50"
                    title={t("mark_completed")}
                    >
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </button>
                )}

                {r.status !== "archived" && (
                    <button
                    onClick={() => updateStatus(r.id, "archived")}
                    className="p-2 rounded hover:bg-gray-50"
                    title={t("archive")}
                    >
                    <ArchiveBoxIcon className="w-5 h-5 text-gray-600" />
                    </button>
                )}

                <button
                    onClick={() =>
                    setReports((prev) => prev.filter((x) => x.id !== r.id))
                    }
                    className="p-2 rounded hover:bg-red-50"
                    title={t("delete")}
                >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                </button>
                </div>
            </div>
            ))}
        </div>

        {/* Detail modal */}
        {detail && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                <h3 className="text-lg font-semibold mb-2">{t("report_detail")}</h3>
                <p className="mb-2">
                <span className="font-medium">{t("content")}:</span>{" "}
                {detail.content}
                </p>
                <p className="mb-2">
                <span className="font-medium">{t("reporter")}:</span>{" "}
                {detail.reporter}
                </p>
                <p className="mb-2">
                <span className="font-medium">{t("sent_date")}:</span>{" "}
                {detail.date}
                </p>
                <p className="mb-2">
                <span className="font-medium">{t("type")}:</span> {detail.type}
                </p>
                <p className="mb-4">
                <span className="font-medium">{t("status")}:</span>{" "}
                {STATUS_TABS.find((s) => s.key === detail.status)?.label}
                </p>

                <div className="flex justify-end gap-3">
                <button
                    onClick={() => setDetail(null)}
                    className="px-4 py-2 rounded border hover:bg-gray-100"
                >
                    {t("close")}
                </button>
                {detail.status === "pending" && (
                    <>
                    <button
                        onClick={() => {
                        updateStatus(detail.id, "processing");
                        setDetail(null);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        {t("processing")}
                    </button>
                    <button
                        onClick={() => {
                        updateStatus(detail.id, "resolved");
                        setDetail(null);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        {t("resolved")}
                    </button>
                    </>
                )}
                </div>
            </div>
            </div>
        )}
        </AdminLayout>
    );
}