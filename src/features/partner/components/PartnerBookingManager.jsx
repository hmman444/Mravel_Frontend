import { useMemo, useState } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  XCircleIcon,
  CheckCircleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// ===== Helpers =====
const fmtMoney = (v) => {
  if (v == null) return "--";
  try {
    return new Intl.NumberFormat("vi-VN").format(v) + "đ";
  } catch {
    return `${v}đ`;
  }
};

const fmtDT = (iso) => {
  if (!iso) return "--";
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const fmtDate = (iso) => {
  if (!iso) return "--";
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return iso;
  }
};

const isFuture = (iso) => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t > Date.now() : false;
};

const addDays = (d, days) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};

// ===== Status configs (tối thiểu) =====
const BOOKING_STATUS = {
  PENDING: { label: "Chờ xác nhận", cls: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Hoàn tất", cls: "bg-green-100 text-green-700" },
  CANCELLED_BY_GUEST: { label: "Khách hủy", cls: "bg-gray-100 text-gray-600" },
  CANCELLED_BY_PARTNER: { label: "Đối tác hủy", cls: "bg-red-100 text-red-700" },
};

const PAYMENT_STATUS = {
  UNPAID: { label: "Chưa thanh toán", cls: "bg-gray-100 text-gray-600" },
  PAID: { label: "Đã thanh toán", cls: "bg-green-100 text-green-700" },
  REFUNDED: { label: "Đã hoàn tiền", cls: "bg-purple-100 text-purple-700" },
};

const SERVICE_STATUS = {
  ACTIVE: { label: "Đang hoạt động", cls: "bg-green-100 text-green-700" },
  PENDING: { label: "Chờ duyệt", cls: "bg-yellow-100 text-yellow-700" },
  REJECTED: { label: "Bị từ chối", cls: "bg-red-100 text-red-700" },
  PARTNER_PAUSED: { label: "Đối tác tạm khóa", cls: "bg-gray-100 text-gray-600" },
  ADMIN_BLOCKED: { label: "Admin khóa", cls: "bg-red-100 text-red-700" },
};

function Badge({ text, className = "" }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-700" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {hint ? <p className="text-xs text-gray-400 mt-1">{hint}</p> : null}
      </div>
    </div>
  );
}

// ===== Mock data (UI-only) =====
const now = new Date();
const MOCK_BOOKINGS = [
  {
    id: 1,
    code: "BK-2D874FC0",
    type: "HOTEL",
    bookingStatus: "CONFIRMED",
    paymentStatus: "PAID",
    amountPaid: 759864,
    createdAt: addDays(now, -3).toISOString(),
    usedAtStart: addDays(now, 2).toISOString(),
    usedAtEnd: addDays(now, 4).toISOString(),
    customer: { name: "Nguyễn Bình An", phone: "0909 123 456", email: "an.nguyen@gmail.com" },
    service: {
      id: "hotel-1",
      name: "Bespoke Villa Hội An",
      city: "Hội An",
      serviceStatus: "ACTIVE",
      softDeleted: false,
    },
    snapshot: {
      rooms: 1,
      guests: 2,
      note: "Check-in muộn sau 21:00",
    },
  },
  {
    id: 2,
    code: "RB-A55FD3ACF5",
    type: "RESTAURANT",
    bookingStatus: "PENDING",
    paymentStatus: "PAID",
    amountPaid: 200000,
    createdAt: addDays(now, -1).toISOString(),
    usedAtStart: addDays(now, 5).toISOString(),
    usedAtEnd: null,
    customer: { name: "Trần Thị Na", phone: "0933 777 888", email: "na.tran@gmail.com" },
    service: {
      id: "res-1",
      name: "The Temple Restaurant & Lounge",
      city: "Đà Nẵng",
      serviceStatus: "ACTIVE",
      softDeleted: false,
    },
    snapshot: {
      people: 4,
      tables: 1,
      reservationTime: "11:00",
      note: "Bàn gần cửa sổ",
    },
  },
  {
    id: 3,
    code: "BK-9FFDB3D2",
    type: "HOTEL",
    bookingStatus: "COMPLETED",
    paymentStatus: "PAID",
    amountPaid: 1250000,
    createdAt: addDays(now, -15).toISOString(),
    usedAtStart: addDays(now, -10).toISOString(),
    usedAtEnd: addDays(now, -8).toISOString(),
    customer: { name: "Lê Hoa", phone: "0988 222 111", email: "hoa.le@gmail.com" },
    service: {
      id: "hotel-2",
      name: "Sunrise Hotel",
      city: "Nha Trang",
      serviceStatus: "ACTIVE",
      softDeleted: false,
    },
    snapshot: { rooms: 1, guests: 1, note: "" },
  },
  {
    id: 4,
    code: "RB-B46F28F874",
    type: "RESTAURANT",
    bookingStatus: "CANCELLED_BY_GUEST",
    paymentStatus: "REFUNDED",
    amountPaid: 300000,
    createdAt: addDays(now, -6).toISOString(),
    usedAtStart: addDays(now, -2).toISOString(),
    usedAtEnd: null,
    customer: { name: "Trần Bình", phone: "0911 555 666", email: "binh.tran@gmail.com" },
    service: {
      id: "res-2",
      name: "Nhà hàng Biển Xanh",
      city: "Quy Nhơn",
      serviceStatus: "PARTNER_PAUSED",
      softDeleted: false,
    },
    snapshot: { people: 2, tables: 1, reservationTime: "19:00", note: "" },
  },
  {
    id: 5,
    code: "BK-1A2B3C4D",
    type: "HOTEL",
    bookingStatus: "CONFIRMED",
    paymentStatus: "PAID",
    amountPaid: 890000,
    createdAt: addDays(now, -2).toISOString(),
    usedAtStart: addDays(now, 1).toISOString(),
    usedAtEnd: addDays(now, 2).toISOString(),
    customer: { name: "John Smith", phone: "0901 333 999", email: "john.smith@gmail.com" },
    service: {
      id: "hotel-3",
      name: "Homestay Đồi Thông",
      city: "Đà Lạt",
      serviceStatus: "ACTIVE",
      softDeleted: true, // mô phỏng soft-delete: vẫn xem detail booking bằng snapshot
    },
    snapshot: { rooms: 1, guests: 2, note: "Kỷ niệm ngày cưới" },
  },
];

export default function PartnerBookingManager() {
  // tabs
  const STATUS_TABS = useMemo(
    () => [
      { key: "all", label: "Tất cả" },
      { key: "PENDING", label: "Chờ xác nhận" },
      { key: "CONFIRMED", label: "Đã xác nhận" },
      { key: "COMPLETED", label: "Hoàn tất" },
      { key: "CANCELLED_BY_GUEST", label: "Khách hủy" },
      { key: "CANCELLED_BY_PARTNER", label: "Đối tác hủy" },
    ],
    []
  );

  const TYPE_OPTIONS = useMemo(
    () => [
      { key: "ALL", label: "Tất cả loại dịch vụ" },
      { key: "HOTEL", label: "Khách sạn" },
      { key: "RESTAURANT", label: "Quán ăn" },
    ],
    []
  );

  const [tab, setTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("month"); // chart range mock

  // modals
  const [detail, setDetail] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null, reason: "" });

  const filtered = useMemo(() => {
    return MOCK_BOOKINGS.filter((b) => {
      const matchTab = tab === "all" ? true : b.bookingStatus === tab;
      const matchType = typeFilter === "ALL" ? true : b.type === typeFilter;
      const kw = search.trim().toLowerCase();
      const matchSearch =
        !kw ||
        b.code.toLowerCase().includes(kw) ||
        b.customer?.name?.toLowerCase().includes(kw) ||
        b.service?.name?.toLowerCase().includes(kw);

      return matchTab && matchType && matchSearch;
    });
  }, [tab, typeFilter, search]);

  // “dòng tiền” = amountPaid của booking PAID và (CONFIRMED/COMPLETED)
  const revenue = useMemo(() => {
    return filtered
      .filter((b) => b.paymentStatus === "PAID" && (b.bookingStatus === "CONFIRMED" || b.bookingStatus === "COMPLETED"))
      .reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  }, [filtered]);

  const upcomingCount = useMemo(() => {
    return filtered.filter((b) => (b.bookingStatus === "CONFIRMED" || b.bookingStatus === "PENDING") && isFuture(b.usedAtStart)).length;
  }, [filtered]);

  const completedCount = useMemo(() => filtered.filter((b) => b.bookingStatus === "COMPLETED").length, [filtered]);
  const cancelledCount = useMemo(
    () => filtered.filter((b) => b.bookingStatus === "CANCELLED_BY_GUEST" || b.bookingStatus === "CANCELLED_BY_PARTNER").length,
    [filtered]
  );

  // chart mock (đủ để “có thống kê” như admin)
  const chartDataMap = useMemo(() => {
    return {
      today: [
        { label: "Sáng", current: 3, previous: 2 },
        { label: "Chiều", current: 5, previous: 4 },
        { label: "Tối", current: 2, previous: 3 },
      ],
      week: [
        { label: "T2", current: 6, previous: 5 },
        { label: "T3", current: 8, previous: 7 },
        { label: "T4", current: 7, previous: 6 },
        { label: "T5", current: 9, previous: 7 },
        { label: "T6", current: 10, previous: 8 },
        { label: "T7", current: 11, previous: 9 },
        { label: "CN", current: 9, previous: 8 },
      ],
      month: [
        { label: "Tuần 1", current: 18, previous: 12 },
        { label: "Tuần 2", current: 22, previous: 16 },
        { label: "Tuần 3", current: 20, previous: 15 },
        { label: "Tuần 4", current: 26, previous: 19 },
      ],
      year: [
        { label: "T1", current: 18, previous: 14 },
        { label: "T2", current: 21, previous: 16 },
        { label: "T3", current: 25, previous: 19 },
        { label: "T4", current: 24, previous: 20 },
        { label: "T5", current: 28, previous: 22 },
        { label: "T6", current: 30, previous: 24 },
        { label: "T7", current: 29, previous: 25 },
        { label: "T8", current: 31, previous: 26 },
        { label: "T9", current: 27, previous: 23 },
        { label: "T10", current: 33, previous: 28 },
        { label: "T11", current: 35, previous: 30 },
        { label: "T12", current: 38, previous: 32 },
      ],
    };
  }, []);

  const trend12m = useMemo(
    () => [
      { month: "T1", created: 12, completed: 8 },
      { month: "T2", created: 15, completed: 10 },
      { month: "T3", created: 14, completed: 11 },
      { month: "T4", created: 18, completed: 13 },
      { month: "T5", created: 16, completed: 14 },
      { month: "T6", created: 20, completed: 17 },
      { month: "T7", created: 19, completed: 16 },
      { month: "T8", created: 21, completed: 18 },
      { month: "T9", created: 17, completed: 14 },
      { month: "T10", created: 22, completed: 19 },
      { month: "T11", created: 24, completed: 21 },
      { month: "T12", created: 26, completed: 23 },
    ],
    []
  );

  const canCancel = (b) => {
    // rule ngắn để khỏi mập mờ: chỉ cho hủy khi CHƯA tới thời điểm sử dụng và CHƯA hoàn tất và CHƯA bị hủy
    if (!b) return false;
    if (b.bookingStatus === "COMPLETED") return false;
    if (b.bookingStatus === "CANCELLED_BY_GUEST" || b.bookingStatus === "CANCELLED_BY_PARTNER") return false;
    return isFuture(b.usedAtStart);
  };

  const onCancelSubmit = () => {
    // UI-only: mô phỏng cập nhật (không gọi API)
    setCancelModal({ open: false, booking: null, reason: "" });
    setDetail(null);
    // Bạn sẽ nối API thật sau: PATCH /partner/bookings/{code}/cancel (body: reason)
    // Ở đây không mutate MOCK_BOOKINGS để tránh side-effect trong demo UI.
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn đặt</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={CalendarDaysIcon} label="Tổng đơn" value={filtered.length} hint="Theo bộ lọc hiện tại" />
        <StatCard icon={CheckCircleIcon} label="Sắp tới" value={upcomingCount} hint="PENDING/CONFIRMED và chưa tới giờ" />
        <StatCard icon={XCircleIcon} label="Đã hủy" value={cancelledCount} hint="Khách hủy + Đối tác hủy" />
        <StatCard icon={BanknotesIcon} label="Dòng tiền" value={fmtMoney(revenue)} hint="PAID + (CONFIRMED/COMPLETED)" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Thống kê đơn theo thời gian</h2>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-3 py-1.5 border rounded-md text-sm outline-none focus:ring focus:border-blue-500"
            >
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartDataMap[range]}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" name="Kỳ hiện tại" fill="#3B82F6" />
              <Line type="monotone" dataKey="previous" name="Kỳ trước" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Xu hướng 12 tháng</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend12m}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" name="Tạo mới" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="completed" name="Hoàn tất" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((it) => (
              <button
                key={it.key}
                onClick={() => setTab(it.key)}
                className={`px-3 py-1.5 rounded-md text-sm border transition ${
                  tab === it.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn / khách / dịch vụ..."
              className="w-full pl-10 pr-3 py-2 border rounded-md outline-none focus:ring focus:border-blue-500"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm outline-none focus:ring focus:border-blue-500"
          >
            {TYPE_OPTIONS.map((op) => (
              <option key={op.key} value={op.key}>
                {op.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((b) => {
          const st = BOOKING_STATUS[b.bookingStatus] || { label: b.bookingStatus, cls: "bg-gray-100 text-gray-600" };
          const ps = PAYMENT_STATUS[b.paymentStatus] || { label: b.paymentStatus, cls: "bg-gray-100 text-gray-600" };
          const sv = SERVICE_STATUS[b.service?.serviceStatus] || { label: b.service?.serviceStatus, cls: "bg-gray-100 text-gray-600" };

          return (
            <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{b.code}</p>
                    <Badge text={st.label} className={st.cls} />
                    <Badge text={ps.label} className={ps.cls} />
                  </div>

                  <p className="text-sm text-gray-700 mt-1 truncate">
                    <span className="font-medium">{b.service?.name}</span> • {b.service?.city}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                      text={b.type === "HOTEL" ? "Khách sạn" : "Quán ăn"}
                      className={b.type === "HOTEL" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}
                    />
                    <Badge text={sv.label} className={sv.cls} />
                    {b.service?.softDeleted ? (
                      <Badge text="Dịch vụ đã ẩn (soft-delete)" className="bg-orange-50 text-orange-700" />
                    ) : null}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Số tiền</p>
                  <p className="font-semibold text-blue-600">{fmtMoney(b.amountPaid)}</p>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="text-gray-500">Khách:</span> {b.customer?.name} • {b.customer?.phone}
                </p>
                {b.type === "HOTEL" ? (
                  <p>
                    <HomeModernIcon className="w-4 h-4 inline-block mr-1 text-gray-400" />
                    <span className="text-gray-500">Lưu trú:</span> {fmtDate(b.usedAtStart)} → {fmtDate(b.usedAtEnd)}
                  </p>
                ) : (
                  <p>
                    <BuildingOffice2Icon className="w-4 h-4 inline-block mr-1 text-gray-400" />
                    <span className="text-gray-500">Giờ đặt:</span> {fmtDT(b.usedAtStart)} • {b.snapshot?.reservationTime || "--"} • {b.snapshot?.people || "--"} người
                  </p>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setDetail(b)}
                  className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <EyeIcon className="w-5 h-5 text-gray-700" />
                  Xem chi tiết
                </button>

                <button
                  disabled={!canCancel(b)}
                  onClick={() => setCancelModal({ open: true, booking: b, reason: "" })}
                  className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 ${
                    canCancel(b)
                      ? "border border-red-600 text-red-600 hover:bg-red-50"
                      : "border border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  title={canCancel(b) ? "Hủy đơn" : "Chỉ hủy khi chưa tới thời điểm sử dụng và chưa hoàn tất"}
                >
                  <XCircleIcon className="w-5 h-5" />
                  Hủy đơn
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
          Không có đơn phù hợp với bộ lọc hiện tại.
        </div>
      ) : null}

      {/* Detail modal */}
      {detail ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Chi tiết đơn</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Mã: <span className="font-medium text-gray-900">{detail.code}</span> • Tạo lúc: {fmtDT(detail.createdAt)}
                </p>
              </div>
              <button onClick={() => setDetail(null)} className="px-3 py-2 rounded-md border hover:bg-gray-50">
                Đóng
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Dịch vụ</p>
                <p className="font-semibold text-gray-900 mt-1">{detail.service?.name}</p>
                <p className="text-sm text-gray-600 mt-1">{detail.service?.city}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge
                    text={detail.type === "HOTEL" ? "Khách sạn" : "Quán ăn"}
                    className={detail.type === "HOTEL" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}
                  />
                  <Badge
                    text={(SERVICE_STATUS[detail.service?.serviceStatus] || {}).label || detail.service?.serviceStatus}
                    className={(SERVICE_STATUS[detail.service?.serviceStatus] || {}).cls || "bg-gray-100 text-gray-600"}
                  />
                  {detail.service?.softDeleted ? (
                    <Badge text="Dịch vụ đã ẩn (soft-delete)" className="bg-orange-50 text-orange-700" />
                  ) : null}
                </div>
                {detail.service?.softDeleted ? (
                  <p className="text-xs text-gray-500 mt-2">
                    * Dịch vụ đã bị ẩn khỏi danh sách (soft-delete) nhưng đơn vẫn hiển thị nhờ dữ liệu snapshot.
                  </p>
                ) : null}
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Khách hàng</p>
                <p className="font-semibold text-gray-900 mt-1">{detail.customer?.name}</p>
                <p className="text-sm text-gray-600 mt-1">{detail.customer?.phone}</p>
                <p className="text-sm text-gray-600">{detail.customer?.email}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Trạng thái</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge
                    text={(BOOKING_STATUS[detail.bookingStatus] || {}).label || detail.bookingStatus}
                    className={(BOOKING_STATUS[detail.bookingStatus] || {}).cls || "bg-gray-100 text-gray-600"}
                  />
                  <Badge
                    text={(PAYMENT_STATUS[detail.paymentStatus] || {}).label || detail.paymentStatus}
                    className={(PAYMENT_STATUS[detail.paymentStatus] || {}).cls || "bg-gray-100 text-gray-600"}
                  />
                </div>
                <p className="text-sm text-gray-700 mt-3">
                  <span className="text-gray-500">Số tiền:</span> <span className="font-semibold">{fmtMoney(detail.amountPaid)}</span>
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Thời gian sử dụng</p>
                {detail.type === "HOTEL" ? (
                  <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="text-gray-500">Check-in:</span> {fmtDate(detail.usedAtStart)}
                    </p>
                    <p>
                      <span className="text-gray-500">Check-out:</span> {fmtDate(detail.usedAtEnd)}
                    </p>
                    <p>
                      <span className="text-gray-500">Số phòng:</span> {detail.snapshot?.rooms || "--"} •{" "}
                      <span className="text-gray-500">Số khách:</span> {detail.snapshot?.guests || "--"}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="text-gray-500">Ngày:</span> {fmtDate(detail.usedAtStart)}
                    </p>
                    <p>
                      <span className="text-gray-500">Giờ:</span> {detail.snapshot?.reservationTime || "--"} •{" "}
                      <span className="text-gray-500">Số người:</span> {detail.snapshot?.people || "--"} •{" "}
                      <span className="text-gray-500">Số bàn:</span> {detail.snapshot?.tables || "--"}
                    </p>
                  </div>
                )}

                {detail.snapshot?.note ? (
                  <div className="mt-3 text-sm">
                    <p className="text-gray-500">Ghi chú</p>
                    <p className="text-gray-800 mt-1">{detail.snapshot.note}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDetail(null)}
                className="px-4 py-2 rounded-md border hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                disabled={!canCancel(detail)}
                onClick={() => setCancelModal({ open: true, booking: detail, reason: "" })}
                className={`px-4 py-2 rounded-md ${
                  canCancel(detail)
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                title={canCancel(detail) ? "Hủy đơn" : "Chỉ hủy khi chưa tới thời điểm sử dụng và chưa hoàn tất"}
              >
                Hủy đơn (Partner)
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Cancel modal */}
      {cancelModal.open ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Xác nhận hủy đơn</h3>
            <p className="text-sm text-gray-600 mt-1">
              Mã: <span className="font-medium text-gray-900">{cancelModal.booking?.code}</span> • Dịch vụ:{" "}
              <span className="font-medium text-gray-900">{cancelModal.booking?.service?.name}</span>
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lý do hủy (ngắn gọn)</label>
              <textarea
                value={cancelModal.reason}
                onChange={(e) => setCancelModal((m) => ({ ...m, reason: e.target.value }))}
                className="w-full border rounded-lg p-2 h-24 outline-none focus:ring focus:border-blue-500"
                placeholder="Ví dụ: Hết phòng / Sự cố vận hành / Không thể phục vụ khung giờ này..."
              />
              <p className="text-xs text-gray-400 mt-2">
                Rule: chỉ hủy khi <b>chưa tới thời điểm sử dụng</b> và <b>chưa hoàn tất</b>.
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCancelModal({ open: false, booking: null, reason: "" })}
                className="px-4 py-2 rounded-md border hover:bg-gray-50"
              >
                Bỏ qua
              </button>
              <button
                onClick={onCancelSubmit}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}