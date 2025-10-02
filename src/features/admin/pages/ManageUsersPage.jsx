import { useState } from "react";
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
import { UserGroupIcon } from "@heroicons/react/24/outline";

export default function ManageUsersPage() {
    const [filter, setFilter] = useState("month");

    // Mock data cho Day, Week, Month
    const chartDataSets = {
        day: [
            { label: "Sáng", total: 120, current: 60, previous: 45 },
            { label: "Chiều", total: 180, current: 90, previous: 70 },
            { label: "Tối", total: 200, current: 100, previous: 80 },
        ],

        week: [
            { label: "Mon", total: 700, current: 350, previous: 250 },
            { label: "Tue", total: 800, current: 380, previous: 270 },
            { label: "Wed", total: 900, current: 400, previous: 290 },
            { label: "Thu", total: 950, current: 420, previous: 310 },
            { label: "Fri", total: 1000, current: 450, previous: 320 },
            { label: "Sat", total: 1100, current: 470, previous: 330 },
            { label: "Sun", total: 1200, current: 500, previous: 350 },
        ],

        month: [
            { label: "Jan", total: 1200, current: 600, previous: 350 },
            { label: "Feb", total: 1400, current: 700, previous: 420 },
            { label: "Mar", total: 1600, current: 800, previous: 480 },
            { label: "Apr", total: 1800, current: 900, previous: 520 },
            { label: "May", total: 1900, current: 950, previous: 580 },
            { label: "Jun", total: 2000, current: 1000, previous: 640 },
            { label: "Jul", total: 2200, current: 1100, previous: 690 },
            { label: "Aug", total: 2400, current: 1200, previous: 720 },
            { label: "Sep", total: 2300, current: 1150, previous: 700 },
            { label: "Oct", total: 2500, current: 1250, previous: 780 },
            { label: "Nov", total: 2700, current: 1350, previous: 820 },
            { label: "Dec", total: 3000, current: 1500, previous: 900 },
        ],
    };

    const chartData = chartDataSets[filter];

    // Stats box
    const stats = [
        { label: "User Registrations", value: "2455", color: "bg-pink-500" },
        { label: "Active Users", value: "1800", color: "bg-sky-500" },
        { label: "Premium Users", value: "950", color: "bg-purple-500" },
        { label: "Banned Users", value: "45", color: "bg-indigo-500" },
    ];

    // Users list
    const users = [
        {
        id: 1,
        name: "Jhon Smith",
        role: "Customer",
        avatar: "https://i.pravatar.cc/40?img=1",
        },
        {
        id: 2,
        name: "Jhon Smith",
        role: "Admin",
        avatar: "https://i.pravatar.cc/40?img=2",
        },
        {
        id: 3,
        name: "Jhon Smith",
        role: "Customer",
        avatar: "https://i.pravatar.cc/40?img=3",
        },
    ];

    return (
        <AdminLayout>
        <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>

        {/* Row 1: Chart + Stats + CRM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">User Statistics</h2>
                <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
                >
                <option value="day">By Day</option>
                <option value="week">By Week</option>
                <option value="month">By Month</option>
                </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />

                {/* Background Area */}
                <Area
                    type="monotone"
                    dataKey="previous"
                    fill="#E5E7EB"
                    stroke="none"
                    opacity={0.3}
                    name="Previous"
                />

                {/* Bar: Total Users */}
                <Bar
                    dataKey="total"
                    barSize={25}
                    fill="#8B5CF6"
                    name="Total Users"
                />

                {/* Line: New Users */}
                <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="New Users (Current)"
                />
                <Line
                    type="monotone"
                    dataKey="previous"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="New Users (Previous)"
                />
                </ComposedChart>
            </ResponsiveContainer>
            </div>

            {/* Stats + CRM Widget */}
            <div className="flex flex-col gap-4">
            {/* Stats: grid 2x2 */}
            <div className="grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                <div
                    key={i}
                    className="bg-white rounded-lg shadow p-4 flex items-center gap-4"
                >
                    <div
                    className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center`}
                    >
                    <UserGroupIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-gray-500 text-sm">{s.label}</p>
                    </div>
                </div>
                ))}
            </div>

            {/* CRM Box */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow p-6 text-white flex flex-col justify-between flex-grow">
                <h2 className="text-lg font-semibold mb-2">Create CRM Reports</h2>
                <p className="text-sm mb-4">
                Outlines keep you and honest indulging honest.
                </p>
                <button className="px-4 py-2 bg-white text-purple-600 rounded font-medium hover:bg-gray-100 w-fit">
                Read More
                </button>
            </div>
            </div>
        </div>

        {/* Row 2: New Users + Progress + Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* New Users */}
            <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">New Users</h2>
                <div className="flex">
                <input
                    type="text"
                    placeholder="Search..."
                    className="px-3 py-1 border rounded-l text-sm"
                />
                <button className="px-3 py-1 bg-orange-500 text-white rounded-r">
                    🔍
                </button>
                </div>
            </div>
            <ul className="divide-y divide-gray-200">
                {users.map((u) => (
                <li key={u.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                    <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.role}</p>
                    </div>
                    </div>
                    <button className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">
                    ...
                    </button>
                </li>
                ))}
            </ul>
            </div>

            {/* Progress Circle */}
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold mb-4">Sales of the last week</h2>
            <div className="relative w-40 h-40">
                <svg className="w-full h-full">
                <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                    fill="none"
                />
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
            <p className="text-sm text-gray-500 mt-4">Progress</p>
            </div>

            {/* Sales Details */}
            <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Sales Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                <p className="text-gray-500">Author Sales</p>
                <p className="text-lg font-bold">$2,034</p>
                </div>
                <div>
                <p className="text-gray-500">Commission</p>
                <p className="text-lg font-bold">$706</p>
                </div>
                <div>
                <p className="text-gray-500">Average Bid</p>
                <p className="text-lg font-bold">$49</p>
                </div>
                <div>
                <p className="text-gray-500">All Time Sales</p>
                <p className="text-lg font-bold">$5.8M</p>
                </div>
            </div>
            </div>
        </div>
        </AdminLayout>
    );
}