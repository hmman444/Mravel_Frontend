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

export default function ManagePartnersPage() {
    const [filter, setFilter] = useState("month");
    const [showRequests, setShowRequests] = useState(false);

    // Radar data
    const serviceStats = [
        { type: "Tour", count: 40 },
        { type: "Khách sạn", count: 55 },
        { type: "Ẩm thực", count: 30 },
        { type: "Vận chuyển", count: 20 },
        { type: "Hướng dẫn viên", count: 15 },
    ];

    // Line data: đối tác mới / cũ
    const ratioDataSets = {
        day: [
            { label: "Sáng", new: 5, old: 10 },
            { label: "Chiều", new: 8, old: 12 },
            { label: "Tối", new: 4, old: 9 },
        ],
        week: [
            { label: "Mon", new: 12, old: 20 },
            { label: "Tue", new: 15, old: 22 },
            { label: "Wed", new: 18, old: 25 },
            { label: "Thu", new: 10, old: 18 },
            { label: "Fri", new: 20, old: 28 },
            { label: "Sat", new: 22, old: 30 },
            { label: "Sun", new: 19, old: 26 },
        ],
        month: [
            { label: "Jan", new: 40, old: 70 },
            { label: "Feb", new: 45, old: 75 },
            { label: "Mar", new: 50, old: 80 },
            { label: "Apr", new: 42, old: 68 },
            { label: "May", new: 55, old: 85 },
            { label: "Jun", new: 60, old: 90 },
        ],
    };
    const ratioData = ratioDataSets[filter];

    // Line data: xu hướng phân bổ dịch vụ 12 tháng
    const serviceTrendData = [
        { month: "Jan", tour: 35, hotel: 45, food: 25, transport: 20, guide: 10 },
        { month: "Feb", tour: 42, hotel: 38, food: 28, transport: 18, guide: 14 },
        { month: "Mar", tour: 30, hotel: 40, food: 35, transport: 22, guide: 12 },
        { month: "Apr", tour: 45, hotel: 36, food: 30, transport: 28, guide: 15 },
        { month: "May", tour: 38, hotel: 48, food: 27, transport: 24, guide: 18 },
        { month: "Jun", tour: 50, hotel: 42, food: 32, transport: 26, guide: 20 },
        { month: "Jul", tour: 44, hotel: 39, food: 40, transport: 30, guide: 16 },
        { month: "Aug", tour: 36, hotel: 46, food: 33, transport: 25, guide: 22 },
        { month: "Sep", tour: 48, hotel: 41, food: 29, transport: 20, guide: 14 },
        { month: "Oct", tour: 40, hotel: 37, food: 38, transport: 27, guide: 19 },
        { month: "Nov", tour: 46, hotel: 43, food: 34, transport: 23, guide: 15 },
        { month: "Dec", tour: 39, hotel: 49, food: 31, transport: 28, guide: 21 },
    ];

    // Partner data
    const partners = [
        {
            id: 1,
            name: "Travel Viet",
            email: "contact@travelviet.com",
            serviceType: "Tour",
            logo: "https://i.pravatar.cc/80?img=8",
            status: "active",
        },
        {
            id: 2,
            name: "Sunrise Hotel",
            email: "info@sunrisehotel.vn",
            serviceType: "Khách sạn",
            logo: "https://i.pravatar.cc/80?img=12",
            status: "active",
        },
        {
            id: 3,
            name: "Foodies",
            email: "hello@foodies.vn",
            serviceType: "Ẩm thực",
            logo: "https://i.pravatar.cc/80?img=15",
            status: "inactive",
        },
    ];

    // Requests
    const partnerRequests = [
        { id: 101, name: "Adventure Life", email: "join@adlife.vn", serviceType: "Tour" },
        { id: 102, name: "Ocean Hotel", email: "contact@oceanhotel.vn", serviceType: "Khách sạn" },
    ];

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-6">Quản lý đối tác</h1>

            {/* Row 1: Radar + Line */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Radar Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Phân bố loại hình dịch vụ đối tác</h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={serviceStats}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="type" />
                            <Tooltip />
                            <Radar
                                name="Số lượng"
                                dataKey="count"
                                stroke="#3B82F6"
                                fill="#3B82F6"
                                fillOpacity={0.6}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Line Chart: New vs Old */}
                <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Tỉ lệ đối tác mới / cũ</h2>
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
                                name="Đối tác mới"
                            />
                            <Line
                                type="monotone"
                                dataKey="old"
                                stroke="#EA580C"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                name="Đối tác cũ"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 2: Service Trend */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Xu hướng tăng trưởng dịch vụ trong 12 tháng</h2>
                    <span className="text-sm text-gray-400">Jan - Dec</span>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={serviceTrendData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="tour" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Tour" />
                        <Line type="monotone" dataKey="hotel" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Khách sạn" />
                        <Line type="monotone" dataKey="food" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="Ẩm thực" />
                        <Line type="monotone" dataKey="transport" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} name="Vận chuyển" />
                        <Line type="monotone" dataKey="guide" stroke="#EC4899" strokeWidth={2} dot={{ r: 3 }} name="Hướng dẫn viên" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Row 3: Current Partners */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Danh sách đối tác hiện tại</h2>
                    <Link
                    to="/admin/partners/request"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                    Đơn đăng ký đối tác
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