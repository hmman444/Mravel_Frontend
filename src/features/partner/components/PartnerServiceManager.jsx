// PartnerServiceManager.jsx
import { useEffect, useMemo, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { usePartnerServices } from "../hooks/usePartnerServices";
import PartnerServiceEditPage from "../components/PartnerServiceEditPage";

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "PENDING", label: "PENDING" },
  { key: "ACTIVE", label: "ACTIVE" },
  { key: "REJECTED", label: "REJECTED" },
  { key: "PARTNER_PAUSED", label: "PARTNER_PAUSED" },
  { key: "ADMIN_BLOCKED", label: "ADMIN_BLOCKED" },
];

const STATUS_LABELS_VI = {
  all: "Tất cả",
  PENDING: "Chờ duyệt",
  ACTIVE: "Đang hoạt động",
  REJECTED: "Bị từ chối",
  PARTNER_PAUSED: "Tạm khóa (đối tác)",
  ADMIN_BLOCKED: "Bị khóa (admin)",
};

const TYPE_OPTIONS = ["Tất cả", "HOTEL", "RESTAURANT"];

const mapServiceStatus = (doc) => {
  const ms = doc?.moderation?.status;
  const active = !!doc?.active;

  if (ms === "PENDING_REVIEW") return "PENDING";
  if (ms === "REJECTED") return "REJECTED";
  if (ms === "BLOCKED") return "ADMIN_BLOCKED";
  if (ms === "APPROVED") return active ? "ACTIVE" : "PARTNER_PAUSED";
  return "PENDING";
};

const mapRejectReason = (doc) => doc?.moderation?.rejectionReason || null;
const mapBlockedReason = (doc) => doc?.moderation?.blockedReason || null;

const pickThumbnail = (doc) => {
  const imgs = doc?.images || [];
  const cover = imgs.find((x) => x?.cover);
  return cover?.url || imgs[0]?.url || "https://picsum.photos/seed/placeholder/800/480";
};

const pickShortDesc = (doc) => doc?.shortDescription || doc?.description || "—";

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

function Pagination({ page, totalPages, onPageChange, disabled }) {
  const canPrev = page > 0;
  const canNext = page + 1 < (totalPages || 0);

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="text-sm text-gray-600">
        Trang <b>{(totalPages ?? 0) === 0 ? 0 : page + 1}</b> / <b>{totalPages ?? 0}</b>
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={disabled || !canPrev}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Trước
        </button>
        <button
          disabled={disabled || !canNext}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded border text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

export default function PartnerServiceManager() {
  const {
    hotels,
    restaurants,
    action,
    fetchHotels,
    fetchRestaurants,
    remove,
    pause,
    resume,
    requestUnlock,
    updateHotel,
    updateRestaurant,
  } = usePartnerServices();

  const [tab, setTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const me = useSelector((s) => s.partner?.me?.data);

  const tabKeys = useMemo(() => STATUS_TABS.map((x) => x.key), []);
  const makePager = () =>
    tabKeys.reduce((acc, k) => {
      acc[k] = 0;
      return acc;
    }, {});
  const [pageBy, setPageBy] = useState({
    HOTEL: makePager(),
    RESTAURANT: makePager(),
  });

  const PAGE_SIZE = 9;

  const [modal, setModal] = useState({
    open: false,
    kind: null,
    service: null,
    note: "",
  });

  const [edit, setEdit] = useState({ open: false, service: null });
  const isEditing = !!(edit.open && edit.service);

  const statusParam = tab === "all" ? undefined : tab;
  const hotelPage = pageBy.HOTEL[tab] ?? 0;
  const restaurantPage = pageBy.RESTAURANT[tab] ?? 0;

  const refreshTypeList = (type) => {
    if (type === "HOTEL") {
      return fetchHotels({
        status: statusParam,
        page: pageBy.HOTEL[tab] ?? 0,
        size: PAGE_SIZE,
      });
    }
    return fetchRestaurants({
      status: statusParam,
      page: pageBy.RESTAURANT[tab] ?? 0,
      size: PAGE_SIZE,
    });
  };

  useEffect(() => {
    if (isEditing) return;
    if (typeFilter === "Tất cả" || typeFilter === "HOTEL") {
      fetchHotels({ status: statusParam, page: hotelPage, size: PAGE_SIZE });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, typeFilter, tab, hotelPage, statusParam]);

  useEffect(() => {
    if (isEditing) return;
    if (typeFilter === "Tất cả" || typeFilter === "RESTAURANT") {
      fetchRestaurants({ status: statusParam, page: restaurantPage, size: PAGE_SIZE });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, typeFilter, tab, restaurantPage, statusParam]);

  const uiHotels = useMemo(() => {
    return (hotels.items || []).map((doc) => ({
      id: doc?.id ?? doc?._id ?? doc?.code ?? doc?.slug ?? "(no-id)",
      name: doc?.name ?? doc?.title ?? "(no-name)",
      type: "HOTEL",
      status: mapServiceStatus(doc),
      rejectReason: mapRejectReason(doc),
      blockedReason: mapBlockedReason(doc),
      thumbnail: pickThumbnail(doc),
      shortDesc: pickShortDesc(doc),
      ownerId:
        doc?.publisher?.partnerName ||
        doc?.publisher?.partnerEmail ||
        doc?.publisher?.partnerId ||
        doc?.partnerId ||
        doc?.ownerId ||
        doc?.createdBy ||
        me?.name ||
        me?.email ||
        me?.partnerName ||
        me?.partnerEmail ||
        me?.partnerId ||
        me?.id ||
        "—",
      raw: doc,
    }));
  }, [hotels.items, me]);

  const uiRestaurants = useMemo(() => {
    return (restaurants.items || []).map((doc) => ({
      id: doc?.id ?? doc?._id ?? doc?.code ?? doc?.slug ?? "(no-id)",
      name: doc?.name ?? doc?.title ?? "(no-name)",
      type: "RESTAURANT",
      status: mapServiceStatus(doc),
      rejectReason: mapRejectReason(doc),
      blockedReason: mapBlockedReason(doc),
      thumbnail: pickThumbnail(doc),
      shortDesc: pickShortDesc(doc),
      ownerId:
        doc?.publisher?.partnerName ||
        doc?.publisher?.partnerEmail ||
        doc?.publisher?.partnerId ||
        doc?.partnerId ||
        doc?.ownerId ||
        doc?.createdBy ||
        me?.name ||
        me?.email ||
        me?.partnerName ||
        me?.partnerEmail ||
        me?.partnerId ||
        me?.id ||
        "—",
      raw: doc,
    }));
  }, [restaurants.items, me]);

  const applySearch = (items) => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (s) => (s.name || "").toLowerCase().includes(q) || (s.id || "").toLowerCase().includes(q)
    );
  };

  const applyTabClient = (items) => {
    if (tab === "all") return items;
    return items.filter((x) => x.status === tab);
  };

  const filteredHotels = useMemo(
    () => applySearch(applyTabClient(uiHotels)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uiHotels, tab, search]
  );

  const filteredRestaurants = useMemo(
    () => applySearch(applyTabClient(uiRestaurants)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uiRestaurants, tab, search]
  );

  const setPageFor = (type, nextPage) => {
    setPageBy((prev) => ({
      ...prev,
      [type]: { ...prev[type], [tab]: Math.max(0, nextPage) },
    }));
  };

  const submitModal = async () => {
    const { kind, service, note } = modal;
    if (!service) return;
    if (kind === "UNLOCK" && !note.trim()) return;

    if (kind === "DELETE") await remove({ type: service.type, id: service.id });
    if (kind === "PAUSE") await pause({ type: service.type, id: service.id });
    if (kind === "RESUME") await resume({ type: service.type, id: service.id });
    if (kind === "UNLOCK")
      await requestUnlock({ type: service.type, id: service.id, reason: note.trim() });

    await refreshTypeList(service.type);
    setModal({ open: false, kind: null, service: null, note: "" });
  };

  const ServiceGrid = ({ items }) => {
    if (!items || items.length === 0) {
      return <div className="bg-white rounded-lg border p-6 text-sm text-gray-600">Không có dữ liệu.</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((s) => (
          <div
            key={`${s.type}-${s.id}`}
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

                {s.status === "PENDING" && (
                  <div className="mt-3 text-xs rounded-md bg-yellow-50 text-yellow-800 border border-yellow-100 p-2">
                    Đang chờ admin duyệt. Khi PENDING: user không đặt được.
                  </div>
                )}
                {s.status === "REJECTED" && (
                  <div className="mt-3 text-xs rounded-md bg-red-50 text-red-800 border border-red-100 p-2">
                    Bị từ chối: <b>{s.rejectReason || "Không có lý do."}</b>
                  </div>
                )}
                {s.status === "ADMIN_BLOCKED" && (
                  <div className="mt-3 text-xs rounded-md bg-gray-100 text-gray-800 border border-gray-200 p-2">
                    Bị admin khóa
                    {s.blockedReason ? (
                      <>
                        : <b>{s.blockedReason}</b>
                      </>
                    ) : (
                      "."
                    )}{" "}
                    Bạn <b>không tự mở</b> được — cần gửi yêu cầu mở khóa.
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Owner: <span className="font-medium text-gray-800">{s.ownerId}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEdit({ open: true, service: s })}
                    className="p-2 rounded hover:bg-gray-100"
                    title="Chỉnh sửa"
                  >
                    <PencilIcon className="w-5 h-5 text-gray-600" />
                  </button>

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

                  {s.status === "ADMIN_BLOCKED" && (
                    <button
                      onClick={() => setModal({ open: true, kind: "UNLOCK", service: s, note: "" })}
                      className="p-2 rounded hover:bg-blue-50"
                      title="Gửi yêu cầu mở khóa"
                    >
                      <PaperAirplaneIcon className="w-5 h-5 text-blue-600" />
                    </button>
                  )}

                  <button
                    onClick={() => setModal({ open: true, kind: "DELETE", service: s, note: "" })}
                    className="p-2 rounded hover:bg-gray-100"
                    title="Xóa dịch vụ"
                  >
                    <TrashIcon className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isEditing) {
    return (
      <PartnerServiceEditPage
        service={edit.service}
        loading={action.loading}
        onBack={() => setEdit({ open: false, service: null })}
        onSave={async ({ type, id, payload }) => {
          if (type === "HOTEL") await updateHotel({ id, payload });
          else await updateRestaurant({ id, payload });
          await refreshTypeList(type);
          setEdit({ open: false, service: null });
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dịch vụ của tôi</h1>
          {action.error && <div className="mt-1 text-sm text-red-600">{action.error}</div>}
        </div>

        <button
          onClick={() => alert("Demo: mở form tạo dịch vụ (Hotel/Restaurant)")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm dịch vụ
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
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
                {STATUS_LABELS_VI[x.key] ?? x.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

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

      {typeFilter === "Tất cả" && (
        <>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">Khách sạn</div>
              <div className="text-sm text-gray-600">
                {hotels.loading ? "Đang tải..." : `Tổng trang: ${hotels.totalPages ?? 0}`}
              </div>
            </div>
            <Pagination
              page={hotels.page ?? hotelPage}
              totalPages={hotels.totalPages ?? 0}
              disabled={hotels.loading || action.loading}
              onPageChange={(p) => setPageFor("HOTEL", p)}
            />
            <ServiceGrid items={filteredHotels} />
          </div>

          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">Quán ăn</div>
              <div className="text-sm text-gray-600">
                {restaurants.loading ? "Đang tải..." : `Tổng trang: ${restaurants.totalPages ?? 0}`}
              </div>
            </div>
            <Pagination
              page={restaurants.page ?? restaurantPage}
              totalPages={restaurants.totalPages ?? 0}
              disabled={restaurants.loading || action.loading}
              onPageChange={(p) => setPageFor("RESTAURANT", p)}
            />
            <ServiceGrid items={filteredRestaurants} />
          </div>
        </>
      )}

      {typeFilter === "HOTEL" && (
        <>
          <Pagination
            page={hotels.page ?? hotelPage}
            totalPages={hotels.totalPages ?? 0}
            disabled={hotels.loading || action.loading}
            onPageChange={(p) => setPageFor("HOTEL", p)}
          />
          <ServiceGrid items={filteredHotels} />
        </>
      )}

      {typeFilter === "RESTAURANT" && (
        <>
          <Pagination
            page={restaurants.page ?? restaurantPage}
            totalPages={restaurants.totalPages ?? 0}
            disabled={restaurants.loading || action.loading}
            onPageChange={(p) => setPageFor("RESTAURANT", p)}
          />
          <ServiceGrid items={filteredRestaurants} />
        </>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">
              {modal.kind === "DELETE" && "Xóa dịch vụ"}
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
                  {modal.kind === "DELETE" ? "Ghi chú (tuỳ chọn)" : "Lý do mở khóa (bắt buộc)"}
                </label>
                <textarea
                  value={modal.note}
                  onChange={(e) => setModal((m) => ({ ...m, note: e.target.value }))}
                  className="w-full border rounded p-2 h-24"
                  placeholder={
                    modal.kind === "DELETE"
                      ? "Ví dụ: ngừng kinh doanh..."
                      : "Ví dụ: đã bổ sung giấy tờ / cập nhật thông tin..."
                  }
                />
              </>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setModal({ open: false, kind: null, service: null, note: "" })}
                className="px-4 py-2 rounded border hover:bg-gray-100"
                disabled={action.loading}
              >
                Hủy
              </button>

              <button
                onClick={submitModal}
                disabled={action.loading || (modal.kind === "UNLOCK" && !modal.note.trim())}
                className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
                  modal.kind === "DELETE"
                    ? "bg-gray-800 hover:bg-gray-900"
                    : modal.kind === "PAUSE"
                    ? "bg-red-600 hover:bg-red-700"
                    : modal.kind === "RESUME"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {action.loading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}