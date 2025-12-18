import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function StatCard({ label, value, sub, badgeClass = "bg-blue-50 text-blue-700" }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${badgeClass}`}>Hôm nay</span>
      </div>
    </div>
  );
}

export default function PartnerDashboard() {
  const [filter, setFilter] = useState("weekly");

  const dataMap = useMemo(
    () => ({
      today: [
        { label: "Sáng", current: 4, previous: 3 },
        { label: "Chiều", current: 7, previous: 5 },
        { label: "Tối", current: 6, previous: 4 },
      ],
      weekly: [
        { label: "T2", current: 12, previous: 10 },
        { label: "T3", current: 15, previous: 13 },
        { label: "T4", current: 11, previous: 9 },
        { label: "T5", current: 18, previous: 14 },
        { label: "T6", current: 20, previous: 16 },
        { label: "T7", current: 24, previous: 18 },
        { label: "CN", current: 21, previous: 17 },
      ],
      monthly: [
        { label: "Tuần 1", current: 55, previous: 40 },
        { label: "Tuần 2", current: 70, previous: 60 },
        { label: "Tuần 3", current: 62, previous: 58 },
        { label: "Tuần 4", current: 80, previous: 66 },
      ],
      yearly: [
        { label: "T1", current: 120, previous: 95 },
        { label: "T2", current: 135, previous: 110 },
        { label: "T3", current: 160, previous: 130 },
        { label: "T4", current: 150, previous: 140 },
        { label: "T5", current: 175, previous: 155 },
        { label: "T6", current: 190, previous: 165 },
        { label: "T7", current: 210, previous: 180 },
        { label: "T8", current: 205, previous: 190 },
        { label: "T9", current: 225, previous: 200 },
        { label: "T10", current: 240, previous: 215 },
        { label: "T11", current: 260, previous: 230 },
        { label: "T12", current: 285, previous: 250 },
      ],
    }),
    []
  );

  const revenueTrend = [
    { month: "T1", revenue: 12, orders: 40 },
    { month: "T2", revenue: 18, orders: 55 },
    { month: "T3", revenue: 15, orders: 48 },
    { month: "T4", revenue: 22, orders: 65 },
    { month: "T5", revenue: 26, orders: 78 },
    { month: "T6", revenue: 28, orders: 85 },
    { month: "T7", revenue: 31, orders: 92 },
    { month: "T8", revenue: 29, orders: 88 },
    { month: "T9", revenue: 34, orders: 100 },
    { month: "T10", revenue: 38, orders: 110 },
    { month: "T11", revenue: 41, orders: 118 },
    { month: "T12", revenue: 46, orders: 130 },
  ];

  const bookingStatusData = [
    { name: "CONFIRMED", value: 42, color: "#10B981" },
    { name: "PENDING_PAYMENT", value: 18, color: "#F59E0B" },
    { name: "COMPLETED", value: 25, color: "#3B82F6" },
    { name: "CANCELLED", value: 15, color: "#EF4444" },
  ];

  const legendMap = {
    today: { current: "Hôm nay", previous: "Hôm qua" },
    weekly: { current: "Tuần này", previous: "Tuần trước" },
    monthly: { current: "Tháng này", previous: "Tháng trước" },
    yearly: { current: "Năm nay", previous: "Năm trước" },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tổng quan đối tác</h1>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard label="Dịch vụ ACTIVE" value="3" sub="Đang hiển thị cho khách" badgeClass="bg-green-50 text-green-700" />
        <StatCard label="Dịch vụ PENDING" value="2" sub="Chờ admin duyệt" badgeClass="bg-yellow-50 text-yellow-700" />
        <StatCard label="Đơn mới" value="12" sub="Trong 24 giờ" badgeClass="bg-blue-50 text-blue-700" />
        <StatCard label="Doanh thu (triệu)" value="18.6" sub="Chỉ tính PAID/COMPLETED" badgeClass="bg-purple-50 text-purple-700" />
      </div>

      {/* Row 1: chart + mini stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Thống kê đơn theo {filter === "today" ? "ngày" : filter === "weekly" ? "tuần" : filter === "monthly" ? "tháng" : "năm"}
            </h2>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="today">Hôm nay</option>
              <option value="weekly">Tuần</option>
              <option value="monthly">Tháng (4 tuần)</option>
              <option value="yearly">Năm</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dataMap[filter]}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" name={legendMap[filter].current} />
              <Line type="monotone" dataKey="previous" name={legendMap[filter].previous} strokeWidth={2} dot={{ r: 4 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex flex-col justify-around">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Tỷ lệ hoàn tất</p>
            <p className="text-2xl font-bold text-green-600">74%</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-500">Hủy bởi đối tác</p>
            <p className="text-2xl font-bold text-red-600">2</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dịch vụ bị khóa (admin)</p>
            <p className="text-2xl font-bold text-gray-700">1</p>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Xu hướng 12 tháng</h2>
            <span className="text-sm text-gray-400">Doanh thu & số đơn</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Doanh thu (triệu)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="orders" name="Số đơn" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Tỷ lệ trạng thái đơn</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingStatusData}
                cx="50%"
                cy="50%"
                outerRadius={105}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {bookingStatusData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}