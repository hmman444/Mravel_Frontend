import { useMemo, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "PENDING", label: "PENDING" },
  { key: "ACTIVE", label: "ACTIVE" },
  { key: "REJECTED", label: "REJECTED" },
  { key: "PARTNER_PAUSED", label: "PARTNER_PAUSED" },
  { key: "ADMIN_BLOCKED", label: "ADMIN_BLOCKED" },
];

const TYPE_OPTIONS = ["Tất cả", "HOTEL", "RESTAURANT"];

const MOCK_SERVICES = [
  {
    id: "SVC-HT-001",
    name: "Bespoke Villa Hoi An",
    type: "HOTEL",
    status: "ACTIVE",
    pendingReason: null,
    rejectReason: null,
    thumbnail: "https://picsum.photos/seed/hotel1/800/480",
    shortDesc: "Khách sạn 4*, gần trung tâm, buffet sáng.",
    ownerId: "partner-001",
    isDeleted: false,
  },
  {
    id: "SVC-RS-002",
    name: "The Temple Restaurant & Lounge",
    type: "RESTAURANT",
    status: "PENDING",
    pendingReason: "CREATE",
    rejectReason: null,
    thumbnail: "https://picsum.photos/seed/res1/800/480",
    shortDesc: "Nhà hàng phong cách lounge, phù hợp nhóm bạn.",
    ownerId: "partner-001",
    isDeleted: false,
  },
  {
    id: "SVC-HT-003",
    name: "Sunrise Hotel",
    type: "HOTEL",
    status: "REJECTED",
    pendingReason: "EDIT",
    rejectReason: "Thiếu giấy phép kinh doanh / hình ảnh chưa rõ.",
    thumbnail: "https://picsum.photos/seed/hotel2/800/480",
    shortDesc: "Khách sạn 3*, giá hợp lý, có bãi đỗ xe.",
    ownerId: "partner-001",
    isDeleted: false,
  },
  {
    id: "SVC-RS-004",
    name: "Biển Xanh Seafood",
    type: "RESTAURANT",
    status: "PARTNER_PAUSED",
    pendingReason: null,
    rejectReason: null,
    thumbnail: "https://picsum.photos/seed/res2/800/480",
    shortDesc: "Hải sản tươi sống, nhận đặt bàn theo loại bàn.",
    ownerId: "partner-001",
    isDeleted: false,
  },
  {
    id: "SVC-HT-005",
    name: "Oceanic Stay",
    type: "HOTEL",
    status: "ADMIN_BLOCKED",
    pendingReason: null,
    rejectReason: null,
    thumbnail: "https://picsum.photos/seed/hotel3/800/480",
    shortDesc: "Bị admin khóa do báo cáo dịch vụ không đúng.",
    ownerId: "partner-001",
    isDeleted: false,
  },
];

function StatusBadge({ status }) {
  const map = {
    ACTIVE: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    REJECTED: "bg-red-100 text-red-700",
    PARTNER_PAUSED: "bg-gray-200 text-gray-700",
    ADMIN_BLOCKED: "bg-black/10 text-gray-900",
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export default function PartnerServiceManager() {
  const [services, setServices] = useState(MOCK_SERVICES);

  const [tab, setTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("Tất cả");
  const [search, setSearch] = useState("");

  // modal: dùng chung cho delete / pause / unlock request
  const [modal, setModal] = useState({
    open: false,
    kind: null, // "DELETE" | "PAUSE" | "RESUME" | "UNLOCK"
    service: null,
    note: "",
  });

  const filtered = useMemo(() => {
    return services
      .filter((s) => !s.isDeleted) // ✅ soft-delete: ẩn khỏi UI partner
      .filter((s) => (tab === "all" ? true : s.status === tab))
      .filter((s) => (typeFilter === "Tất cả" ? true : s.type === typeFilter))
      .filter((s) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
        );
      });
  }, [services, tab, typeFilter, search]);

  // ✅ nghiệp vụ: pause/resume chỉ cho PARTNER_PAUSED <-> ACTIVE
  const pauseService = (id) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id && s.status === "ACTIVE" ? { ...s, status: "PARTNER_PAUSED" } : s))
    );
  };
  const resumeService = (id) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id && s.status === "PARTNER_PAUSED" ? { ...s, status: "ACTIVE" } : s))
    );
  };

  // ✅ soft delete: set isDeleted
  const softDeleteService = (id) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isDeleted: true } : s)));
  };

  const submitModal = () => {
    const { kind, service } = modal;
    if (!service) return;

    if (kind === "DELETE") softDeleteService(service.id);
    if (kind === "PAUSE") pauseService(service.id);
    if (kind === "RESUME") resumeService(service.id);

    // ✅ Unlock request: chỉ UI (ghi note), BE làm sau
    // Bạn có thể lưu tạm vào local state nếu muốn hiển thị lịch sử request
    setModal({ open: false, kind: null, service: null, note: "" });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dịch vụ của tôi</h1>
        </div>

        <button
          onClick={() => alert("Demo: mở form tạo dịch vụ (Hotel/Restaurant)")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm dịch vụ
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((x) => (
              <button
                key={x.key}
                onClick={() => setTab(x.key)}
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  tab === x.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative w-72">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên / mã dịch vụ..."
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
            {TYPE_OPTIONS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden flex flex-col"
          >
            <div className="relative">
              <img src={s.thumbnail} alt={s.name} className="h-44 w-full object-cover" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <StatusBadge status={s.status} />
                <span className="px-2 py-1 text-xs rounded-full bg-white/80 text-gray-800 border">
                  {s.type}
                </span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{s.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{s.id}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{s.shortDesc}</p>

                {/* info theo nghiệp vụ */}
                {s.status === "PENDING" && (
                  <div className="mt-3 text-xs rounded-md bg-yellow-50 text-yellow-800 border border-yellow-100 p-2">
                    Đang chờ admin duyệt ({s.pendingReason || "UPDATE"}). Khi PENDING: user không đặt được.
                  </div>
                )}
                {s.status === "REJECTED" && (
                  <div className="mt-3 text-xs rounded-md bg-red-50 text-red-800 border border-red-100 p-2">
                    Bị từ chối: <b>{s.rejectReason || "Không có lý do."}</b>
                  </div>
                )}
                {s.status === "ADMIN_BLOCKED" && (
                  <div className="mt-3 text-xs rounded-md bg-gray-100 text-gray-800 border border-gray-200 p-2">
                    Bị admin khóa. Bạn <b>không tự mở</b> được — cần gửi yêu cầu mở khóa.
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Owner: <span className="font-medium text-gray-800">{s.ownerId}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => alert("Demo: mở trang chi tiết dịch vụ")}
                    className="p-2 rounded hover:bg-gray-100"
                    title="Chi tiết"
                  >
                    <InformationCircleIcon className="w-5 h-5 text-gray-600" />
                  </button>

                  <button
                    onClick={() => alert("Demo: mở form chỉnh sửa -> set PENDING khi submit")}
                    className="p-2 rounded hover:bg-gray-100"
                    title="Chỉnh sửa (submit sẽ PENDING)"
                  >
                    <PencilIcon className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* PARTNER_PAUSED <-> ACTIVE */}
                  {s.status === "ACTIVE" && (
                    <button
                      onClick={() => setModal({ open: true, kind: "PAUSE", service: s, note: "" })}
                      className="p-2 rounded hover:bg-red-50"
                      title="Tạm khóa dịch vụ"
                    >
                      <LockClosedIcon className="w-5 h-5 text-red-600" />
                    </button>
                  )}
                  {s.status === "PARTNER_PAUSED" && (
                    <button
                      onClick={() => setModal({ open: true, kind: "RESUME", service: s, note: "" })}
                      className="p-2 rounded hover:bg-green-50"
                      title="Mở lại dịch vụ"
                    >
                      <LockOpenIcon className="w-5 h-5 text-green-600" />
                    </button>
                  )}

                  {/* ADMIN_BLOCKED -> yêu cầu mở khóa */}
                  {s.status === "ADMIN_BLOCKED" && (
                    <button
                      onClick={() => setModal({ open: true, kind: "UNLOCK", service: s, note: "" })}
                      className="p-2 rounded hover:bg-blue-50"
                      title="Gửi yêu cầu mở khóa"
                    >
                      <PaperAirplaneIcon className="w-5 h-5 text-blue-600" />
                    </button>
                  )}

                  {/* Soft delete */}
                  <button
                    onClick={() => setModal({ open: true, kind: "DELETE", service: s, note: "" })}
                    className="p-2 rounded hover:bg-gray-100"
                    title="Xóa mềm (ẩn khỏi mọi danh sách)"
                  >
                    <TrashIcon className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal confirm */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">
              {modal.kind === "DELETE" && "Xóa dịch vụ (xóa mềm)"}
              {modal.kind === "PAUSE" && "Tạm khóa dịch vụ"}
              {modal.kind === "RESUME" && "Mở lại dịch vụ"}
              {modal.kind === "UNLOCK" && "Gửi yêu cầu mở khóa (admin)"}
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              Dịch vụ: <span className="font-medium text-gray-900">{modal.service?.name}</span>
            </p>

            {(modal.kind === "DELETE" || modal.kind === "UNLOCK") && (
              <>
                <label className="block text-sm font-medium mb-1">
                  {modal.kind === "DELETE" ? "Ghi chú (tuỳ chọn)" : "Lý do mở khóa (bắt buộc để rõ nghiệp vụ)"}
                </label>
                <textarea
                  value={modal.note}
                  onChange={(e) => setModal((m) => ({ ...m, note: e.target.value }))}
                  className="w-full border rounded p-2 h-24"
                  placeholder={modal.kind === "DELETE" ? "Ví dụ: ngừng kinh doanh..." : "Ví dụ: đã bổ sung giấy tờ / cập nhật thông tin..."}
                />
              </>
            )}

            {modal.kind === "UNLOCK" && (
              <div className="mt-2 text-xs text-gray-500">
                Rule: ADMIN_BLOCKED không thể tự mở → gửi request kèm reason.
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setModal({ open: false, kind: null, service: null, note: "" })}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                Hủy
              </button>

              <button
                onClick={submitModal}
                className={`px-4 py-2 text-white rounded ${
                  modal.kind === "DELETE"
                    ? "bg-gray-800 hover:bg-gray-900"
                    : modal.kind === "PAUSE"
                    ? "bg-red-600 hover:bg-red-700"
                    : modal.kind === "RESUME"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}