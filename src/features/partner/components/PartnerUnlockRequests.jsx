import { useMemo, useState } from "react";
import {
  LockClosedIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Toast from "../../../components/Toast";

// Mock data (demo UI) — sau này bạn thay bằng API
const MOCK_BLOCKED_SERVICES = [
  {
    id: "SVC-001",
    name: "Khách sạn Bespoke Villa Hội An",
    type: "Hotel",
    status: "ADMIN_BLOCKED", // chỉ service bị admin khóa mới gửi request
    blockedAt: "2025-12-16 10:25",
    blockedReason: "Thiếu giấy phép kinh doanh (demo).",
    thumbnail: "https://picsum.photos/seed/hotel1/800/480",
  },
  {
    id: "SVC-002",
    name: "Nhà hàng The Temple Restaurant & Lounge",
    type: "Restaurant",
    status: "ADMIN_BLOCKED",
    blockedAt: "2025-12-17 14:10",
    blockedReason: "Nội dung mô tả chưa đúng chính sách (demo).",
    thumbnail: "https://picsum.photos/seed/restaurant2/800/480",
  },
];

// Mock danh sách request đã gửi (demo UI)
const MOCK_REQUESTS = [
  {
    id: "UR-1001",
    serviceId: "SVC-001",
    serviceName: "Khách sạn Bespoke Villa Hội An",
    serviceType: "Hotel",
    status: "PENDING", // PENDING | APPROVED | REJECTED
    reason: "Bên em đã bổ sung giấy phép và ảnh giấy tờ đầy đủ, nhờ admin mở khóa.",
    createdAt: "2025-12-17 09:20",
    decidedAt: null,
    note: null,
  },
  {
    id: "UR-1002",
    serviceId: "SVC-002",
    serviceName: "Nhà hàng The Temple Restaurant & Lounge",
    serviceType: "Restaurant",
    status: "REJECTED",
    reason: "Bên em đã chỉnh sửa nội dung mô tả theo góp ý, nhờ admin xem xét mở khóa.",
    createdAt: "2025-12-16 20:05",
    decidedAt: "2025-12-17 08:10",
    note: "Vẫn còn từ ngữ quảng cáo quá mức (demo).",
  },
];

const STATUS_META = {
  PENDING: {
    label: "Đang chờ duyệt",
    pill: "bg-yellow-100 text-yellow-700",
    icon: ClockIcon,
  },
  APPROVED: {
    label: "Đã duyệt",
    pill: "bg-green-100 text-green-700",
    icon: CheckCircleIcon,
  },
  REJECTED: {
    label: "Bị từ chối",
    pill: "bg-red-100 text-red-700",
    icon: XCircleIcon,
  },
};

export default function PartnerUnlockRequests() {
  const [tab, setTab] = useState("BLOCKED"); // BLOCKED | HISTORY
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [blockedServices, setBlockedServices] = useState(MOCK_BLOCKED_SERVICES);
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const [modal, setModal] = useState({
    open: false,
    service: null,
    reason: "",
  });

  const types = useMemo(() => {
    const fromBlocked = blockedServices.map((s) => s.type);
    const fromRequests = requests.map((r) => r.serviceType);
    const unique = Array.from(new Set([...fromBlocked, ...fromRequests]));
    return ["All", ...unique];
  }, [blockedServices, requests]);

  const filteredBlocked = blockedServices.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" ? true : s.type === typeFilter;
    return matchSearch && matchType;
  });

  const filteredRequests = requests.filter((r) => {
    const matchSearch =
      r.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.serviceId.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" ? true : r.serviceType === typeFilter;
    return matchSearch && matchType;
  });

  const openRequestModal = (service) => {
    // rule: chỉ được gửi khi ADMIN_BLOCKED
    if (service.status !== "ADMIN_BLOCKED") {
      Toast.error("Chỉ gửi yêu cầu khi dịch vụ đang bị ADMIN khóa.");
      return;
    }
    setModal({ open: true, service, reason: "" });
  };

  const submitUnlockRequest = () => {
    const reason = modal.reason.trim();
    if (!reason) {
      Toast.error("Vui lòng nhập lý do yêu cầu mở khóa.");
      return;
    }

    // demo: thêm request mới vào history
    const newReq = {
      id: `UR-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: modal.service.id,
      serviceName: modal.service.name,
      serviceType: modal.service.type,
      status: "PENDING",
      reason,
      createdAt: new Date().toLocaleString("vi-VN"),
      decidedAt: null,
      note: null,
    };

    setRequests((prev) => [newReq, ...prev]);
    setModal({ open: false, service: null, reason: "" });
    Toast.success("Đã gửi yêu cầu mở khóa, vui lòng chờ admin duyệt.");

    // UX: tự chuyển qua history để partner thấy request vừa gửi
    setTab("HISTORY");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yêu cầu mở khóa</h1>
        </div>
      </div>

      {/* Tabs + Toolbar */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab("BLOCKED")}
              className={`px-3 py-1.5 rounded-md text-sm border ${
                tab === "BLOCKED"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Dịch vụ bị khóa
            </button>
            <button
              onClick={() => setTab("HISTORY")}
              className={`px-3 py-1.5 rounded-md text-sm border ${
                tab === "HISTORY"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Lịch sử yêu cầu
            </button>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative w-full lg:w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên / mã dịch vụ / mã yêu cầu..."
              className="w-full pl-10 pr-3 py-2 border rounded-md outline-none focus:ring focus:border-blue-500"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm w-full lg:w-44"
          >
            {types.map((tp) => (
              <option key={tp} value={tp}>
                {tp === "All" ? "Tất cả loại" : tp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {tab === "BLOCKED" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBlocked.length > 0 ? (
            filteredBlocked.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden flex flex-col"
              >
                <div className="relative">
                  <img src={s.thumbnail} alt={s.name} className="h-40 w-full object-cover" />
                  <span className="absolute top-3 left-3 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                    ADMIN_BLOCKED
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                      {s.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {s.id} • {s.type}
                    </p>

                    <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Bị khóa lúc</p>
                      <p className="text-sm text-gray-700">{s.blockedAt}</p>
                      <p className="text-xs text-gray-500 mt-2 mb-1">Lý do (admin)</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{s.blockedReason}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openRequestModal(s)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                      Gửi yêu cầu mở
                    </button>

                    <button
                      onClick={() => Toast.info("Demo UI: chi tiết service sẽ nằm ở trang quản lý dịch vụ.")}
                      className="p-2 rounded-lg border hover:bg-gray-50"
                      title="Thông tin"
                    >
                      <InformationCircleIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500 col-span-full">
              Không có dịch vụ ADMIN_BLOCKED khớp bộ lọc.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((r) => {
              const meta = STATUS_META[r.status];
              const Icon = meta.icon;
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{r.serviceName}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {r.id} • {r.serviceId} • {r.serviceType}
                        </p>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${meta.pill}`}>
                        <Icon className="w-4 h-4" />
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Lý do gửi</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{r.reason}</p>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <p className="text-xs text-gray-500">Gửi lúc</p>
                        <p className="text-sm text-gray-700">{r.createdAt}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <p className="text-xs text-gray-500">Phản hồi</p>
                        <p className="text-sm text-gray-700">
                          {r.decidedAt ? r.decidedAt : "Chưa có"}
                        </p>
                        {r.note && (
                          <p className="text-xs text-gray-500 mt-1">
                            Ghi chú: <span className="text-gray-700">{r.note}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="md:w-56 flex flex-col gap-2">
                    <button
                      onClick={() => Toast.info("Demo UI: không cho sửa request sau khi gửi để tránh rối nghiệp vụ.")}
                      className="w-full px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                    >
                      Xem quy tắc
                    </button>
                    {r.status === "REJECTED" && (
                      <button
                        onClick={() => {
                          // demo: mở modal gửi lại dựa trên serviceId nếu còn blocked
                          const svc = blockedServices.find((s) => s.id === r.serviceId);
                          if (!svc) {
                            Toast.error("Dịch vụ không còn ở trạng thái ADMIN_BLOCKED để gửi lại.");
                            return;
                          }
                          openRequestModal(svc);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
                      >
                        Gửi lại yêu cầu
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
              Chưa có yêu cầu mở khóa nào.
            </div>
          )}
        </div>
      )}

      {/* Modal gửi request */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gửi yêu cầu mở khóa</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Dịch vụ: <span className="font-medium text-gray-800">{modal.service?.name}</span>
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs bg-red-100 text-red-700">
                ADMIN_BLOCKED
              </span>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do yêu cầu mở khóa <span className="text-red-500">*</span>
              </label>
              <textarea
                value={modal.reason}
                onChange={(e) => setModal((m) => ({ ...m, reason: e.target.value }))}
                className="w-full border rounded-lg p-3 h-28 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Đã bổ sung giấy phép/ảnh/giấy tờ, đã chỉnh sửa nội dung theo góp ý..."
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">
                {modal.reason.length}/500
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setModal({ open: false, service: null, reason: "" })}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={submitUnlockRequest}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold inline-flex items-center gap-2"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}