"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import Toast from "../../../components/Toast";
import { useAdminAmenities } from "../hooks/useAdminAmenities";

/* =========================
   ENUM OPTIONS (FE mapping)
========================= */
const SCOPE_OPTIONS = ["HOTEL", "ROOM", "RESTAURANT"];
const GROUP_OPTIONS = [
  "ROOM",
  "HOTEL_SERVICE",
  "PUBLIC_AREA",
  "NEARBY",
  "INTERNET",
  "OTHER",
];
const SECTION_OPTIONS = [
  "HIGHLIGHT_FEATURES",
  "BASIC_FACILITIES",
  "ROOM_FACILITIES",
  "BATHROOM",
  "FOOD_AND_DRINK",
  "TRANSPORT",
  "INTERNET",
  "ENTERTAINMENT",
  "OTHER",
];

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

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  /* =========================
     Load data
  ========================= */
  useEffect(() => {
    load({ active: true });
  }, []);

  /* =========================
     Search filter
  ========================= */
  const filteredAmenities = useMemo(() => {
    if (!search) return amenities;
    const q = search.toLowerCase();
    return amenities.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.code?.toLowerCase().includes(q)
    );
  }, [amenities, search]);

  /* =========================
     Handlers
  ========================= */
  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (amenity) => {
    setEditing(amenity);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t("confirm_delete"))) return;
    await remove(id);
    Toast.success(t("delete_success"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const payload = {
      code: form.code.value.trim(),
      name: form.name.value.trim(),
      description: form.description.value.trim(),
      icon: form.icon.value.trim(),
      scope: form.scope.value,
      group: form.group.value,
      section: form.section.value,
      active: form.active.checked,
    };

    if (!payload.code || !payload.name) {
      Toast.error(t("empty_name_error"));
      return;
    }

    if (editing) {
      await update(editing.id, payload);
      Toast.success(t("update_success"));
    } else {
      await create(payload);
      Toast.success(t("add_success"));
    }

    setShowModal(false);
  };

  /* =========================
     Render
  ========================= */
  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("manage_amenities")}</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          {t("add_amenity")}
        </button>
      </div>

      {/* Search */}
      <div className="relative w-80 mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search_amenity")}
          className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring focus:border-blue-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <p className="text-gray-500">{t("loading")}...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAmenities.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-lg shadow p-5 flex flex-col justify-between"
            >
              <div className="flex gap-3 mb-3">
                <div className="text-3xl">{a.icon || "✨"}</div>
                <div>
                  <h3 className="font-semibold">
                    {a.name}{" "}
                    {!a.active && (
                      <span className="text-xs text-red-500">(inactive)</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">{a.code}</p>
                  <p className="text-xs text-gray-400">
                    {a.scope} · {a.group} · {a.section}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => openEdit(a)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <PencilIcon className="w-5 h-5 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-2 hover:bg-gray-100 rounded"
                  disabled={deleting}
                >
                  <TrashIcon className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4"
          >
            <h2 className="text-xl font-bold">
              {editing ? t("edit_amenity") : t("add_new_amenity")}
            </h2>

            <input
              name="code"
              defaultValue={editing?.code || ""}
              placeholder="CODE (WIFI_FREE)"
              className="w-full border px-3 py-2 rounded"
            />

            <input
              name="name"
              defaultValue={editing?.name || ""}
              placeholder={t("amenity_name")}
              className="w-full border px-3 py-2 rounded"
            />

            <input
              name="description"
              defaultValue={editing?.description || ""}
              placeholder={t("short_desc")}
              className="w-full border px-3 py-2 rounded"
            />

            <input
              name="icon"
              defaultValue={editing?.icon || ""}
              placeholder={t("icon_placeholder")}
              className="w-full border px-3 py-2 rounded"
            />

            <select
              name="scope"
              defaultValue={editing?.scope || "HOTEL"}
              className="w-full border px-3 py-2 rounded"
            >
              {SCOPE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              name="group"
              defaultValue={editing?.group || "OTHER"}
              className="w-full border px-3 py-2 rounded"
            >
              {GROUP_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              name="section"
              defaultValue={editing?.section || "OTHER"}
              className="w-full border px-3 py-2 rounded"
            >
              {SECTION_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                defaultChecked={editing?.active ?? true}
              />
              {t("active")}
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {t("save")}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
