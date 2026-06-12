import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LockClosedIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { showError, showInfo, showSuccess } from "../../../utils/toastUtils";

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
    labelKey: "partner.unlock.status.pending",
    pill: "bg-yellow-100 text-yellow-700",
    icon: ClockIcon,
  },
  APPROVED: {
    labelKey: "partner.unlock.status.approved",
    pill: "bg-green-100 text-green-700",
    icon: CheckCircleIcon,
  },
  REJECTED: {
    labelKey: "partner.unlock.status.rejected",
    pill: "bg-red-100 text-red-700",
    icon: XCircleIcon,
  },
};

export default function PartnerUnlockRequests() {
  const { t } = useTranslation();
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
      showError(t("partner.unlock.toast.only_admin_blocked"));
      return;
    }
    setModal({ open: true, service, reason: "" });
  };

  const submitUnlockRequest = () => {
    const reason = modal.reason.trim();
    if (!reason) {
      showError(t("partner.unlock.toast.reason_required"));
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
    showSuccess(t("partner.unlock.toast.submitted"));

    // UX: tự chuyển qua history để partner thấy request vừa gửi
    setTab("HISTORY");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("partner.unlock.title")}</h1>
        </div>
      </div>

      {/* Tabs + Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab("BLOCKED")}
              className={`px-3 py-1.5 rounded-md text-sm border ${
                tab === "BLOCKED"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              }`}
            >
              {t("partner.unlock.tab.blocked")}
            </button>
            <button
              onClick={() => setTab("HISTORY")}
              className={`px-3 py-1.5 rounded-md text-sm border ${
                tab === "HISTORY"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              }`}
            >
              {t("partner.unlock.tab.history")}
            </button>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative w-full lg:w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("partner.unlock.search_placeholder")}
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
                {tp === "All" ? t("partner.unlock.filter.all_types") : tp}
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
                className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition overflow-hidden flex flex-col"
              >
                <div className="relative">
                  <img src={s.thumbnail} alt={s.name} className="h-40 w-full object-cover" />
                  <span className="absolute top-3 left-3 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                    ADMIN_BLOCKED
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-2">
                      {s.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {s.id} • {s.type}
                    </p>

                    <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("partner.unlock.blocked_at")}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{s.blockedAt}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-1">{t("partner.unlock.admin_reason")}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{s.blockedReason}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openRequestModal(s)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                      {t("partner.unlock.send_request_short")}
                    </button>

                    <button
                      onClick={() => showInfo(t("partner.unlock.toast.service_detail_demo"))}
                      className="p-2 rounded-lg border hover:bg-gray-50"
                      title={t("partner.unlock.info")}
                    >
                      <InformationCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-10 text-center text-gray-500 dark:text-gray-400 col-span-full">
              {t("partner.unlock.empty_blocked")}
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
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{r.serviceName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {r.id} • {r.serviceId} • {r.serviceType}
                        </p>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${meta.pill}`}>
                        <Icon className="w-4 h-4" />
                        {t(meta.labelKey)}
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("partner.unlock.request_reason")}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{r.reason}</p>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t("partner.unlock.sent_at")}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{r.createdAt}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t("partner.unlock.response")}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {r.decidedAt ? r.decidedAt : t("partner.unlock.no_response")}
                        </p>
                        {r.note && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t("partner.unlock.note_label")} <span className="text-gray-700 dark:text-gray-300">{r.note}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="md:w-56 flex flex-col gap-2">
                    <button
                      onClick={() => showInfo(t("partner.unlock.toast.no_edit_demo"))}
                      className="w-full px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                    >
                      {t("partner.unlock.view_rules")}
                    </button>
                    {r.status === "REJECTED" && (
                      <button
                        onClick={() => {
                          // demo: mở modal gửi lại dựa trên serviceId nếu còn blocked
                          const svc = blockedServices.find((s) => s.id === r.serviceId);
                          if (!svc) {
                            showError(t("partner.unlock.toast.no_longer_blocked"));
                            return;
                          }
                          openRequestModal(svc);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
                      >
                        {t("partner.unlock.resend_request")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-10 text-center text-gray-500 dark:text-gray-400">
              {t("partner.unlock.empty_history")}
            </div>
          )}
        </div>
      )}

      {/* Modal gửi request */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] px-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("partner.unlock.modal.title")}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t("partner.unlock.modal.service_label")} <span className="font-medium text-gray-800 dark:text-gray-200">{modal.service?.name}</span>
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs bg-red-100 text-red-700">
                ADMIN_BLOCKED
              </span>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("partner.unlock.modal.reason_label")} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={modal.reason}
                onChange={(e) => setModal((m) => ({ ...m, reason: e.target.value }))}
                className="w-full border rounded-lg p-3 h-28 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("partner.unlock.modal.reason_placeholder")}
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
                {t("common.cancel")}
              </button>
              <button
                onClick={submitUnlockRequest}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold inline-flex items-center gap-2"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                {t("partner.unlock.send_request")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}