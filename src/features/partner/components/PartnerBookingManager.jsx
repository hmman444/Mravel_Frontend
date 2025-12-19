// src/features/partner/components/PartnerBookingManager.jsx
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { usePartnerBookingManager } from "../hooks/usePartnerBookingManager";
import PartnerBookingsTable from "./PartnerBookingsTable";
import PartnerBookingDetailModal from "./PartnerBookingDetailModal";
import PartnerBookingCancelModal from "./PartnerBookingCancelModal";

import { pickService } from "../utils/partnerBookingUtils";

export default function PartnerBookingManager() {
  const vm = usePartnerBookingManager();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn đặt</h1>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {vm.STATUS_TABS.map((it) => (
              <button
                key={it.key}
                onClick={() => vm.setTab(it.key)}
                className={`px-3 py-1.5 rounded-md text-sm border transition ${
                  vm.tab === it.key
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
              value={vm.search}
              onChange={(e) => vm.setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn / khách / dịch vụ..."
              className="w-full pl-10 pr-3 py-2 border rounded-md outline-none focus:ring focus:border-blue-500"
            />
          </div>

          {/* Type filter */}
          <select
            value={vm.typeFilter}
            onChange={(e) => vm.setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm outline-none focus:ring focus:border-blue-500"
          >
            {vm.TYPE_OPTIONS.map((op) => (
              <option key={op.key} value={op.key}>
                {op.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {vm.listError ? (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-sm">
          {String(vm.listError)}
        </div>
      ) : null}

      {/* Loading */}
      {vm.loadingList ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
          Đang tải danh sách đơn...
        </div>
      ) : (
        <PartnerBookingsTable
          items={vm.filtered}
          canCancel={vm.canCancel}
          onDetail={vm.openDetail}
          onCancel={vm.openCancel}
        />
      )}

      {/* Detail modal */}
      <PartnerBookingDetailModal
        open={vm.detailModal.open}
        code={vm.detailModal.code}
        data={vm.detailData}
        type={vm.detailType}
        loading={vm.detail?.loading}
        error={vm.detail?.error}
        canCancel={vm.canCancel(vm.detailData)}
        actionLoading={!!vm.action?.loading}
        onClose={vm.closeDetail}
        onOpenCancelFromDetail={() =>
          vm.setCancelModal({
            open: true,
            type: vm.detailType,
            code: vm.detailModal.code,
            serviceName: pickService(vm.detailData)?.name || "",
            reason: "",
          })
        }
      />

      {/* Cancel modal */}
      <PartnerBookingCancelModal
        open={vm.cancelModal.open}
        code={vm.cancelModal.code}
        serviceName={vm.cancelModal.serviceName}
        reason={vm.cancelModal.reason}
        setReason={(val) => vm.setCancelModal((m) => ({ ...m, reason: val }))}
        loading={!!vm.action?.loading}
        error={vm.action?.error}
        onClose={vm.closeCancel}
        onSubmit={vm.onCancelSubmit}
      />
    </div>
  );
}