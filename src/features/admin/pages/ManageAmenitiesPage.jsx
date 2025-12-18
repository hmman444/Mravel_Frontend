"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { PlusIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useAdminAmenities } from "../hooks/useAdminAmenities";

import AmenityStats from "../components/amenity/AmenityStats";
import AmenityFilters from "../components/amenity/AmenityFilters";
import AmenityTable from "../components/amenity/AmenityTable";
import AmenityFormModal from "../components/amenity/AmenityFormModal";

import ConfirmModal from "../../../components/ConfirmModal";
import { showError, showSuccess } from "../../../utils/toastUtils";

const soft = {
  btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  btnGhost:
    "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
};

export default function ManageAmenitiesPage() {
  const { t } = useTranslation();

  const {
    items: amenities,
    loading,
    saving,
    deleting,
    load,
    create,
    update,
    remove,
  } = useAdminAmenities();

  // filters
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("ALL");
  const [group, setGroup] = useState("ALL");
  const [section, setSection] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ACTIVE"); // ACTIVE | INACTIVE | ALL (nếu bạn có thêm ở Filters)
  const [sortBy, setSortBy] = useState("NAME_ASC");

  // modal add/edit
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // confirm delete modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { id, name }

  // toggle active loading per-row (tách khỏi deleting)
  const [toggleLoadingIds, setToggleLoadingIds] = useState(() => new Set());

  const [formError, setFormError] = useState("");

  const extractApiMessage = (err) => {
    if (typeof err === "string") return err;

    if (typeof err?.response?.data === "string") return err.response.data;

    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message;

    return msg || "Có lỗi xảy ra, vui lòng thử lại.";
  };

  const setRowToggling = (id, on) => {
    setToggleLoadingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  useEffect(() => {
    load({ active: true }); // hook hiện tại của bạn đang load active=true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCount = amenities?.length || 0;
  const activeCount = useMemo(
    () => (amenities || []).filter((x) => x.active).length,
    [amenities]
  );

  const filteredAmenities = useMemo(() => {
    let list = [...(amenities || [])];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.code?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      );
    }

    // activeFilter
    if (activeFilter === "ACTIVE") list = list.filter((a) => a.active === true);
    if (activeFilter === "INACTIVE") list = list.filter((a) => a.active === false);
    // nếu bạn có "ALL" thì không lọc

    if (scope !== "ALL") list = list.filter((a) => a.scope === scope);
    if (group !== "ALL") list = list.filter((a) => a.group === group);
    if (section !== "ALL") list = list.filter((a) => a.section === section);

    const byStr = (v) => (v || "").toString().toLowerCase();
    switch (sortBy) {
      case "NAME_DESC":
        list.sort((a, b) => byStr(b.name).localeCompare(byStr(a.name)));
        break;
      case "CODE_ASC":
        list.sort((a, b) => byStr(a.code).localeCompare(byStr(b.code)));
        break;
      case "CODE_DESC":
        list.sort((a, b) => byStr(b.code).localeCompare(byStr(a.code)));
        break;
      case "NAME_ASC":
      default:
        list.sort((a, b) => byStr(a.name).localeCompare(byStr(b.name)));
        break;
    }

    return list;
  }, [amenities, search, scope, group, section, activeFilter, sortBy]);

  const hasAnyFilter =
    search.trim() ||
    scope !== "ALL" ||
    group !== "ALL" ||
    section !== "ALL" ||
    activeFilter !== "ACTIVE" ||
    sortBy !== "NAME_ASC";

  const resetFilters = () => {
    setSearch("");
    setScope("ALL");
    setGroup("ALL");
    setSection("ALL");
    setActiveFilter("ACTIVE");
    setSortBy("NAME_ASC");
  };

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (amenity) => {
    setEditing(amenity);
    setShowModal(true);
  };

  // ===== Delete flow (ConfirmModal) =====
  const requestDelete = (id) => {
    const found = (amenities || []).find((x) => x.id === id);
    setPendingDelete({ id, name: found?.name || id });
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete?.id) return;
    try {
      await remove(pendingDelete.id);
      showSuccess("");
      await load({ active: true });
    } finally {
      closeConfirm();
    }
  };

  // ===== Toggle active =====
  const deactivateAmenity = async (id) => {
    if (!id) return;
    setRowToggling(id, true);
    try {
      // nếu API của bạn yêu cầu payload đầy đủ thì đổi thành update(id, { active:false, ... })
      await update(id, { active: false });

      showSuccess("Đã tắt tiện ích");
      await load({ active: true });
    } catch (e) {
      showError("Tắt tiện ích thất bại");
    } finally {
      setRowToggling(id, false);
    }
  };

  const activateAmenity = async (id) => {
    if (!id) return;
    setRowToggling(id, true);
    try {
      await update(id, { active: true });

      showSuccess("Đã bật tiện ích");
      await load({ active: true });
    } catch (e) {
      showError("Bật tiện ích thất bại");
    } finally {
      setRowToggling(id, false);
    }
  };

  // ===== Create / Edit submit =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const form = e.target;

    const payload = {
      code: form.code.value.trim(),
      name: form.name.value.trim(),
      description: form.description.value.trim(),
      icon: form.icon.value.trim(),
      scope: form.scope.value,
      group: form.group.value,
      section: form.section.value,
    };

    if (!payload.code || !payload.name) {
      showError(t("Tên không thể trống"));
      return;
    }

    try {
      if (editing) {
        await update(editing.id, payload);
        showSuccess(t("Cập nhật tiện ích thành công"));
      } else {
        await create(payload);
        showSuccess(t("Thêm tiện ích thành công"));
      }

      setShowModal(false);
    } catch (err) {
      const msg = extractApiMessage(err);

      // show cả Toast + show ngay trong modal
      showError(msg);
      setFormError(msg);
    }
  };

  // merge deleting + toggleLoadingIds -> disable actions đúng hơn
  const rowBusy = (id) => deleting || toggleLoadingIds.has(id);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("manage_amenities")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý danh sách tiện nghi theo scope / group / section.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`${soft.btn} ${soft.btnGhost} gap-2`}
              type="button"
            >
              <FunnelIcon className="h-5 w-5" />
              Bộ lọc
            </button>

            <button
              onClick={openCreate}
              className={`${soft.btn} ${soft.btnPrimary} gap-2`}
              type="button"
            >
              <PlusIcon className="h-5 w-5" />
              {t("add_amenity")}
            </button>
          </div>
        </div>

        <AmenityStats
          totalCount={totalCount}
          activeCount={activeCount}
          visibleCount={filteredAmenities.length}
        />
      </div>

      {/* Filters */}
      <AmenityFilters
        t={t}
        open={filtersOpen}
        search={search}
        setSearch={setSearch}
        scope={scope}
        setScope={setScope}
        group={group}
        setGroup={setGroup}
        section={section}
        setSection={setSection}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        hasAnyFilter={hasAnyFilter}
        onReset={resetFilters}
      />

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : filteredAmenities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Không có tiện nghi phù hợp với bộ lọc hiện tại
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              className={`${soft.btn} ${soft.btnGhost}`}
              onClick={resetFilters}
            >
              Reset bộ lọc
            </button>
            <button
              type="button"
              className={`${soft.btn} ${soft.btnPrimary}`}
              onClick={openCreate}
            >
              Thêm tiện nghi
            </button>
          </div>
        </div>
      ) : (
        <AmenityTable
          t={t}
          items={filteredAmenities}
          deleting={false /* không dùng deleting chung cho toggle nữa */}
          onEdit={openEdit}
          onDeactivate={(id) => {
            if (rowBusy(id)) return;
            deactivateAmenity(id);
          }}
          onActivate={(id) => {
            if (rowBusy(id)) return;
            activateAmenity(id);
          }}
          // nếu vẫn muốn xóa thì bạn giữ button delete ở table (hiện table bạn đã bỏ delete),
          // còn nếu bạn thêm lại delete thì gọi requestDelete tại đây.
          onDelete={requestDelete}
        />
      )}

      {/* Modal add/edit */}
      <AmenityFormModal
        t={t}
        open={showModal}
        saving={saving}
        editing={editing}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />

      {/* Confirm delete modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Xóa tiện nghi"
        message={`Bạn có chắc muốn xóa "${pendingDelete?.name || ""}" không?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onClose={closeConfirm}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
}
