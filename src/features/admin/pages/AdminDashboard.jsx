import AdminLayout from "../components/AdminLayout";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
    const [filter, setFilter] = useState("monthly");
    const { t } = useTranslation();

    // Dữ liệu demo cho các chế độ thống kê
    const dataMap = {
        today: [
            { label: t("morning"), current: 12, previous: 9 },
            { label: t("afternoon"), current: 18, previous: 15 },
            { label: t("evening"), current: 10, previous: 8 },
        ],
        weekly: [
            { label: t("monday"), current: 30, previous: 25 },
            { label: t("tuesday"), current: 40, previous: 35 },
            { label: t("wednesday"), current: 35, previous: 30 },
            { label: t("thursday"), current: 45, previous: 40 },
            { label: t("friday"), current: 50, previous: 45 },
            { label: t("saturday"), current: 60, previous: 55 },
            { label: t("sunday"), current: 55, previous: 50 },
        ],
        monthly: [
            { label: t("week1"), current: 85, previous: 40 },
            { label: t("week2"), current: 100, previous: 85 },
            { label: t("week3"), current: 95, previous: 35 },
            { label: t("week4"), current: 110, previous: 95 },
        ],
        yearly: [
            { label: t("jan"), current: 40, previous: 30 },
            { label: t("feb"), current: 55, previous: 45 },
            { label: t("mar"), current: 70, previous: 60 },
            { label: t("apr"), current: 65, previous: 62 },
            { label: t("may"), current: 80, previous: 70 },
            { label: t("jun"), current: 95, previous: 75 },
            { label: t("jul"), current: 88, previous: 78 },
            { label: t("aug"), current: 92, previous: 81 },
            { label: t("sep"), current: 85, previous: 73 },
            { label: t("oct"), current: 100, previous: 90 },
            { label: t("nov"), current: 110, previous: 98 },
            { label: t("dec"), current: 120, previous: 105 },
        ],
    };

    // Xu hướng (theo 12 tháng)
    const trendStats = [
        { month: "T1", created: 40, completed: 30 },
        { month: "T2", created: 60, completed: 45 },
        { month: "T3", created: 55, completed: 50 },
        { month: "T4", created: 70, completed: 60 },
        { month: "T5", created: 65, completed: 62 },
        { month: "T6", created: 80, completed: 70 },
        { month: "T7", created: 78, completed: 68 },
        { month: "T8", created: 85, completed: 72 },
        { month: "T9", created: 90, completed: 76 },
        { month: "T10", created: 95, completed: 80 },
        { month: "T11", created: 100, completed: 85 },
        { month: "T12", created: 110, completed: 95 },
    ];

    // Quick stats
    const quickStats = [
        { label: t("total_schedules"), value: "320+", color: "text-blue-600" },
        { label: t("completed"), value: "210+", color: "text-green-600" },
        { label: t("processing"), value: "85+", color: "text-yellow-600" },
        { label: t("canceled"), value: "25+", color: "text-red-600" },
    ];

    // Legend name
    const legendMap = {
        today: { current: t("today"), previous: t("yesterday") },
        weekly: { current: t("this_week"), previous: t("last_week") },
        monthly: { current: t("this_month"), previous: t("last_month") },
        yearly: { current: t("this_year"), previous: t("last_year") },
    };

    // Pie chart
    const statusData = [
        { name: t("in_progress"), value: 80, color: "#3B82F6" },
        { name: t("completed"), value: 65, color: "#10B981" },
        { name: t("delayed"), value: 40, color: "#FACC15" },
        { name: t("canceled"), value: 25, color: "#EF4444" },
    ];

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-6">{t("manage_schedules")}</h1>

            {/* Row 1: Chart + Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart chính */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">
                            {t("schedule_statistics_by")}{" "}
                            {filter === "today"
                                ? t("day")
                                : filter === "weekly"
                                ? t("week")
                                : filter === "monthly"
                                ? t("month_4weeks")
                                : t("year")}
                        </h2>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-1 border rounded text-sm"
                        >
                            <option value="today">{t("today")}</option>
                            <option value="weekly">{t("this_week")}</option>
                            <option value="monthly">{t("this_month")}</option>
                            <option value="yearly">{t("this_year")}</option>
                        </select>
                    </div>

                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={dataMap[filter]}>
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="current"
                                fill="#3B82F6"
                                name={legendMap[filter].current}
                            />
                            <Line
                                type="monotone"
                                dataKey="previous"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name={legendMap[filter].previous}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick Stats */}
                <div className="bg-white p-6 rounded-lg shadow flex flex-col justify-around">
                    {quickStats.map((s, i) => (
                        <div key={i} className="mb-4 last:mb-0">
                            <p className="text-sm text-gray-500">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 2: Line chart + Pie chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Line chart */}
                <div className="bg-white p-6 rounded-lg shadow flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">{t("schedule_trend")}</h2>
                        <span className="text-sm text-gray-400">
                            {t("last_12_months")}
                        </span>
                    </div>

                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trendStats}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="created"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name={t("created")}
                            />
                            <Line
                                type="monotone"
                                dataKey="completed"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name={t("completed")}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie chart */}
                <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-4">
                        {t("schedule_status_ratio")}
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label={({ name, percent }) =>
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AdminLayout>
    );
}