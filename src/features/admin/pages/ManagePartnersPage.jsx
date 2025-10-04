import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import PartnerCard from "../components/PartnerCard";
import { Link } from "react-router-dom";
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
    LineChart,
    Line,
} from "recharts";
import { useTranslation } from "react-i18next";

export default function ManagePartnersPage() {
    const { t } = useTranslation();
    const [filter, setFilter] = useState("month");
    const [showRequests, setShowRequests] = useState(false);

    // Dữ liệu radar: loại hình dịch vụ
    const serviceStats = [
        { type: t("tour"), count: 40 },
        { type: t("hotel"), count: 55 },
        { type: t("food"), count: 30 },
        { type: t("transport"), count: 20 },
        { type: t("guide"), count: 15 },
    ];

    // Dữ liệu tỉ lệ đối tác mới / cũ
    const ratioDataSets = {
        day: [
        { label: t("morning"), new: 5, old: 10 },
        { label: t("afternoon"), new: 8, old: 12 },
        { label: t("evening"), new: 4, old: 9 },
        ],
        week: [
        { label: t("monday"), new: 12, old: 20 },
        { label: t("tuesday"), new: 15, old: 22 },
        { label: t("wednesday"), new: 18, old: 25 },
        { label: t("thursday"), new: 10, old: 18 },
        { label: t("friday"), new: 20, old: 28 },
        { label: t("saturday"), new: 22, old: 30 },
        { label: t("sunday"), new: 19, old: 26 },
        ],
        month: [
        { label: t("week1"), new: 35, old: 55 },
        { label: t("week2"), new: 40, old: 60 },
        { label: t("week3"), new: 50, old: 70 },
        { label: t("week4"), new: 45, old: 65 },
        ],
        year: [
        { label: t("jan"), new: 40, old: 70 },
        { label: t("feb"), new: 45, old: 75 },
        { label: t("mar"), new: 50, old: 80 },
        { label: t("apr"), new: 42, old: 68 },
        { label: t("may"), new: 55, old: 85 },
        { label: t("jun"), new: 60, old: 90 },
        { label: t("jul"), new: 65, old: 95 },
        { label: t("aug"), new: 70, old: 100 },
        { label: t("sep"), new: 75, old: 105 },
        { label: t("oct"), new: 80, old: 110 },
        { label: t("nov"), new: 85, old: 115 },
        { label: t("dec"), new: 90, old: 120 },
        ],
    };

    const ratioData = ratioDataSets[filter];

    // Dữ liệu xu hướng phân bổ dịch vụ 12 tháng
    const serviceTrendData = [
        { month: t("jan"), tour: 35, hotel: 45, food: 25, transport: 20, guide: 10 },
        { month: t("feb"), tour: 42, hotel: 38, food: 28, transport: 18, guide: 14 },
        { month: t("mar"), tour: 30, hotel: 40, food: 35, transport: 22, guide: 12 },
        { month: t("apr"), tour: 45, hotel: 36, food: 30, transport: 28, guide: 15 },
        { month: t("may"), tour: 38, hotel: 48, food: 27, transport: 24, guide: 18 },
        { month: t("jun"), tour: 50, hotel: 42, food: 32, transport: 26, guide: 20 },
        { month: t("jul"), tour: 44, hotel: 39, food: 40, transport: 30, guide: 16 },
        { month: t("aug"), tour: 36, hotel: 46, food: 33, transport: 25, guide: 22 },
        { month: t("sep"), tour: 48, hotel: 41, food: 29, transport: 20, guide: 14 },
        { month: t("oct"), tour: 40, hotel: 37, food: 38, transport: 27, guide: 19 },
        { month: t("nov"), tour: 46, hotel: 43, food: 34, transport: 23, guide: 15 },
        { month: t("dec"), tour: 39, hotel: 49, food: 31, transport: 28, guide: 21 },
    ];

    // Danh sách đối tác
    const partners = [
        {
        id: 1,
        name: "Travel Viet",
        email: "contact@travelviet.com",
        serviceType: t("tour"),
        logo: "https://i.pravatar.cc/80?img=8",
        status: "active",
        },
        {
        id: 2,
        name: "Sunrise Hotel",
        email: "info@sunrisehotel.vn",
        serviceType: t("hotel"),
        logo: "https://i.pravatar.cc/80?img=12",
        status: "active",
        },
        {
        id: 3,
        name: "Foodies",
        email: "hello@foodies.vn",
        serviceType: t("food"),
        logo: "https://i.pravatar.cc/80?img=15",
        status: "inactive",
        },
    ];

    // Đơn đăng ký đối tác mới
    const partnerRequests = [
        { id: 101, name: "Adventure Life", email: "join@adlife.vn", serviceType: t("tour") },
        { id: 102, name: "Ocean Hotel", email: "contact@oceanhotel.vn", serviceType: t("hotel") },
    ];

    return (
        <AdminLayout>
        <h1 className="text-2xl font-bold mb-6">{t("manage_partners")}</h1>

        {/* Hàng 1: Radar + Line */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Biểu đồ Radar */}
            <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
                {t("partner_service_distribution")}
            </h2>
            <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={serviceStats}>
                <PolarGrid />
                <PolarAngleAxis dataKey="type" />
                <Tooltip />
                <Radar
                    name={t("quantity")}
                    dataKey="count"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                />
                </RadarChart>
            </ResponsiveContainer>
            </div>

            {/* Biểu đồ đường: đối tác mới / cũ */}
            <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{t("new_old_partner_ratio")}</h2>
                <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
                >
                <option value="day">{t("by_day")}</option>
                <option value="week">{t("by_week")}</option>
                <option value="month">{t("by_month")}</option>
                <option value="year">{t("by_year")}</option>
                </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ratioData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="new"
                    stroke="#16A34A"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name={t("new_partner")}
                />
                <Line
                    type="monotone"
                    dataKey="old"
                    stroke="#EA580C"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name={t("old_partner")}
                />
                </LineChart>
            </ResponsiveContainer>
            </div>
        </div>

        {/* Hàng 2: Xu hướng dịch vụ */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
                {t("service_trend_12m")}
            </h2>
            <span className="text-sm text-gray-400">{t("jan_dec")}</span>
            </div>
            <ResponsiveContainer width="100%" height={350}>
            <LineChart data={serviceTrendData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tour" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name={t("tour")} />
                <Line type="monotone" dataKey="hotel" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name={t("hotel")} />
                <Line type="monotone" dataKey="food" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name={t("food")} />
                <Line type="monotone" dataKey="transport" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} name={t("transport")} />
                <Line type="monotone" dataKey="guide" stroke="#EC4899" strokeWidth={2} dot={{ r: 3 }} name={t("guide")} />
            </LineChart>
            </ResponsiveContainer>
        </div>

        {/* Hàng 3: Danh sách đối tác */}
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t("current_partner_list")}</h2>
            <Link
                to="/admin/partners/request"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                {t("partner_request")}
            </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {partners.map((p) => (
                <PartnerCard key={p.id} partner={p} />
            ))}
            </div>
        </div>
        </AdminLayout>
    );
}