import { useState } from "react";
import { MagnifyingGlassIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import AdminLayout from "../components/AdminLayout";
import {
    ComposedChart,
    Bar,
    Line,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";

export default function ManageUsersPage() {
    const { t } = useTranslation();
    const [filter, setFilter] = useState("month");
    const [search, setSearch] = useState("");

    // 🔹 Dữ liệu biểu đồ mẫu
    const chartDataSets = {
        day: [
            { label: t("morning"), total: 120, current: 60, previous: 45 },
            { label: t("afternoon"), total: 180, current: 90, previous: 70 },
            { label: t("evening"), total: 200, current: 100, previous: 80 },
        ],
        week: [
            { label: t("mon"), total: 700, current: 350, previous: 250 },
            { label: t("tue"), total: 800, current: 380, previous: 270 },
            { label: t("wed"), total: 900, current: 400, previous: 290 },
            { label: t("thu"), total: 950, current: 420, previous: 310 },
            { label: t("fri"), total: 1000, current: 450, previous: 320 },
            { label: t("sat"), total: 1100, current: 470, previous: 330 },
            { label: t("sun"), total: 1200, current: 500, previous: 350 },
        ],
        month: [
            { label: t("week_1"), total: 1200, current: 600, previous: 450 },
            { label: t("week_2"), total: 1500, current: 800, previous: 600 },
            { label: t("week_3"), total: 1700, current: 950, previous: 700 },
            { label: t("week_4"), total: 1900, current: 1100, previous: 850 },
        ],
        year: [
            { label: "T1", total: 1200, current: 600, previous: 350 },
            { label: "T2", total: 1400, current: 700, previous: 420 },
            { label: "T3", total: 1600, current: 800, previous: 480 },
            { label: "T4", total: 1800, current: 900, previous: 520 },
            { label: "T5", total: 1900, current: 950, previous: 580 },
            { label: "T6", total: 2000, current: 1000, previous: 640 },
            { label: "T7", total: 2200, current: 1100, previous: 690 },
            { label: "T8", total: 2400, current: 1200, previous: 720 },
            { label: "T9", total: 2300, current: 1150, previous: 700 },
            { label: "T10", total: 2500, current: 1250, previous: 780 },
            { label: "T11", total: 2700, current: 1350, previous: 820 },
            { label: "T12", total: 3000, current: 1500, previous: 900 },
        ],
    };

    const chartData = chartDataSets[filter];

    // 🔹 Thống kê nhanh
    const stats = [
        { label: t("new_users"), value: "2,455", color: "bg-pink-500" },
        { label: t("active_users"), value: "1,800", color: "bg-sky-500" },
        { label: t("premium_users"), value: "950", color: "bg-purple-500" },
        { label: t("banned_users"), value: "45", color: "bg-indigo-500" },
    ];

    // 🔹 Danh sách người dùng
    const users = [
        { id: 1, name: "John Smith", role: t("customer"), avatar: "https://i.pravatar.cc/40?img=1" },
        { id: 2, name: "Alice Johnson", role: t("customer"), avatar: "https://i.pravatar.cc/40?img=2" },
        { id: 3, name: "David Lee", role: t("customer"), avatar: "https://i.pravatar.cc/40?img=3" },
    ];

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-6">{t("manage_users")}</h1>

            {/* Biểu đồ + thống kê */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">{t("user_statistics")}</h2>
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
                        <ComposedChart data={chartData}>
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />

                            <Area type="monotone" dataKey="previous" fill="#E5E7EB" stroke="none" opacity={0.3} name={t("previous_period")} />
                            <Bar dataKey="total" barSize={25} fill="#8B5CF6" name={t("total_users")} />
                            <Line type="monotone" dataKey="current" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name={t("current_new_users")} />
                            <Line type="monotone" dataKey="previous" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name={t("previous_new_users")} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Thống kê nhanh + CRM */}
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((s, i) => (
                            <div key={i} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center`}>
                                    <UserGroupIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">{s.value}</p>
                                    <p className="text-gray-500 text-sm">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow p-6 text-white flex flex-col justify-between flex-grow">
                        <h2 className="text-lg font-semibold mb-2">{t("create_crm_report")}</h2>
                        <p className="text-sm mb-4">{t("crm_description")}</p>
                        <button className="px-4 py-2 bg-white text-purple-600 rounded font-medium hover:bg-gray-100 w-fit">
                            {t("see_more")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Người dùng mới + doanh số */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">{t("new_users_list")}</h2>
                        <div className="relative w-52">
                            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t("search_user")}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border rounded-md text-sm outline-none focus:ring focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <ul className="divide-y divide-gray-200">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => (
                                <li key={u.id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-medium">{u.name}</p>
                                            <p className="text-sm text-gray-500">{u.role}</p>
                                        </div>
                                    </div>
                                    <button className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">...</button>
                                </li>
                            ))
                        ) : (
                            <li className="py-3 text-center text-gray-400">{t("no_users_found")}</li>
                        )}
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
                    <h2 className="text-lg font-semibold mb-4">{t("weekly_completion_rate")}</h2>
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full">
                            <circle cx="80" cy="80" r="70" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="#8B5CF6"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={2 * Math.PI * 70}
                                strokeDashoffset={2 * Math.PI * 70 * (1 - 0.74)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-xl font-bold">74%</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">{t("progress")}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">{t("sales_details")}</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">{t("author_sales")}</p>
                            <p className="text-lg font-bold">$2,034</p>
                        </div>
                        <div>
                            <p className="text-gray-500">{t("commission")}</p>
                            <p className="text-lg font-bold">$706</p>
                        </div>
                        <div>
                            <p className="text-gray-500">{t("avg_price")}</p>
                            <p className="text-lg font-bold">$49</p>
                        </div>
                        <div>
                            <p className="text-gray-500">{t("total_revenue")}</p>
                            <p className="text-lg font-bold">$5.8M</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}