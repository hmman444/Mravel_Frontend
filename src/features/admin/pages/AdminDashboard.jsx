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

export default function AdminDashboard() {
    const [filter, setFilter] = useState("monthly");

    // Data demo cho chart filter
    const dataMap = {
        today: [
        { label: "Sáng", current: 12, previous: 9 },
        { label: "Chiều", current: 18, previous: 15 },
        { label: "Tối", current: 10, previous: 8 },
        ],
        weekly: [
        { label: "Mon", current: 30, previous: 25 },
        { label: "Tue", current: 40, previous: 35 },
        { label: "Wed", current: 35, previous: 30 },
        { label: "Thu", current: 45, previous: 40 },
        { label: "Fri", current: 50, previous: 45 },
        { label: "Sat", current: 60, previous: 55 },
        { label: "Sun", current: 55, previous: 50 },
        ],
        monthly: [
        { label: "Jan", current: 40, previous: 30 },
        { label: "Feb", current: 55, previous: 45 },
        { label: "Mar", current: 70, previous: 60 },
        { label: "Apr", current: 65, previous: 62 },
        { label: "May", current: 80, previous: 70 },
        { label: "Jun", current: 95, previous: 75 },
        { label: "Jul", current: 88, previous: 78 },
        { label: "Aug", current: 92, previous: 81 },
        { label: "Sep", current: 85, previous: 73 },
        { label: "Oct", current: 100, previous: 90 },
        { label: "Nov", current: 110, previous: 98 },
        { label: "Dec", current: 120, previous: 105 },
        ],
    };

    // Data cho chart xu hướng (luôn 12 tháng)
    const trendStats = [
        { month: "Jan", created: 40, completed: 30 },
        { month: "Feb", created: 60, completed: 45 },
        { month: "Mar", created: 55, completed: 50 },
        { month: "Apr", created: 70, completed: 60 },
        { month: "May", created: 65, completed: 62 },
        { month: "Jun", created: 80, completed: 70 },
        { month: "Jul", created: 78, completed: 68 },
        { month: "Aug", created: 85, completed: 72 },
        { month: "Sep", created: 90, completed: 76 },
        { month: "Oct", created: 95, completed: 80 },
        { month: "Nov", created: 100, completed: 85 },
        { month: "Dec", created: 110, completed: 95 },
    ];

    // Quick numbers
    const quickStats = [
        { label: "Tổng lịch trình", value: "320+", color: "text-blue-600" },
        { label: "Hoàn thành", value: "210+", color: "text-green-600" },
        { label: "Đang xử lý", value: "85+", color: "text-yellow-600" },
        { label: "Bị hủy", value: "25+", color: "text-red-600" },
    ];

    // Map legend name theo filter
    const legendMap = {
        today: { current: "Hôm nay", previous: "Hôm qua" },
        weekly: { current: "Tuần này", previous: "Tuần trước" },
        monthly: { current: "Tháng này", previous: "Tháng trước" },
    };

    // Pie chart data
    const statusData = [
        { name: "Active", value: 80, color: "#3B82F6" },
        { name: "Completed", value: 65, color: "#10B981" },
        { name: "Pending", value: 40, color: "#FACC15" },
        { name: "Canceled", value: 25, color: "#EF4444" },
    ];

    return (
        <AdminLayout>
        <h1 className="text-2xl font-bold mb-6">Quản lý lịch trình</h1>

        {/* Row 1: Chart + Quick stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart chi tiết */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                Thống kê lịch trình theo{" "}
                {filter === "today"
                    ? "ngày"
                    : filter === "weekly"
                    ? "tuần"
                    : "tháng"}
                </h2>
                <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
                >
                <option value="today">Today</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
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
                <h2 className="text-lg font-semibold">Xu hướng lịch trình</h2>
                <span className="text-sm text-gray-400">12 tháng gần nhất</span>
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
                    name="Tạo mới"
                />
                <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Hoàn thành"
                />
                </LineChart>
            </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-4">
                Tỉ lệ trạng thái lịch trình
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