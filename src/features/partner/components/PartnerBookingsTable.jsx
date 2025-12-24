// src/features/partner/components/PartnerBookingsTable.jsx
import {
  EyeIcon,
  XCircleIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";

import Badge from "./Badge";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SERVICE_STATUS,
  fmtMoney,
  fmtDT,
  fmtDate,
  pickCode,
  pickBookingStatus,
  pickPaymentStatus,
  pickAmount,
  pickService,
  pickCustomer,
  pickUsedStart,
  pickUsedEnd,
} from "../utils/partnerBookingUtils";

function renderWhen(b) {
  const type = b?.__type;
  const usedStart = pickUsedStart(b, type);
  const usedEnd = pickUsedEnd(b, type);

  if (type === "HOTEL") {
    return (
      <div className="text-sm">
        <div className="text-gray-900 font-medium">
          {fmtDate(usedStart)} → {fmtDate(usedEnd)}
        </div>
        <div className="text-gray-500 text-xs mt-0.5">Check-in / Check-out</div>
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="text-gray-900 font-medium">{fmtDT(usedStart)}</div>
      <div className="text-gray-500 text-xs mt-0.5">Thời gian đặt</div>
    </div>
  );
}

export default function PartnerBookingsTable({ items, canCancel, onDetail, onCancel }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-xs font-semibold text-gray-600">
              <th className="px-4 py-3 whitespace-nowrap">Loại</th>
              <th className="px-4 py-3 whitespace-nowrap">Dịch vụ</th>
              <th className="px-4 py-3 whitespace-nowrap">Khách</th>
              <th className="px-4 py-3 whitespace-nowrap">Thời gian</th>
              <th className="px-4 py-3 whitespace-nowrap text-right">Số tiền</th>
              <th className="px-4 py-3 whitespace-nowrap">Trạng thái</th>
              <th className="px-4 py-3 whitespace-nowrap text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {items.map((b, idx) => {
              const type = b.__type;
              const code = pickCode(b) || `#${idx + 1}`;

              const bookingStatus = pickBookingStatus(b);
              const paymentStatus = pickPaymentStatus(b);
              const amountPaid = pickAmount(b);

              const st = BOOKING_STATUS[bookingStatus] || { label: bookingStatus || "--", cls: "bg-gray-100 text-gray-600" };
              const ps = PAYMENT_STATUS[paymentStatus] || { label: paymentStatus || "--", cls: "bg-gray-100 text-gray-600" };

              const service = pickService(b) || {};
              const customer = pickCustomer(b) || {};

              const showCancel = canCancel(b);

              return (
                <tr key={code} className="hover:bg-gray-50/60">
                  {/* Type */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {type === "HOTEL" ? (
                        <HomeModernIcon className="w-5 h-5 text-blue-600" />
                      ) : (
                        <BuildingOffice2Icon className="w-5 h-5 text-emerald-600" />
                      )}
                      <Badge
                        text={type === "HOTEL" ? "Khách sạn" : "Quán ăn"}
                        className={type === "HOTEL" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}
                      />
                    </div>
                  </td>

                  {/* Service */}
                  <td className="px-4 py-3 w-[220px] max-w-[220px]">
                    <div className="font-medium text-gray-900 truncate" title={service?.name || ""}>
                      {service?.name || "--"}
                    </div>

                    {/* city + softDeleted: chỉ render khi có gì để show */}
                    {(service?.city || service?.softDeleted) ? (
                      <div className="text-xs text-gray-500 mt-0.5 truncate" title={service?.city || ""}>
                        {service?.city || ""}
                        {service?.softDeleted ? (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                            Ẩn
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    {/*  chỉ render badge trạng thái dịch vụ khi có serviceStatus */}
                    {service?.serviceStatus ? (
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <Badge
                          text={(SERVICE_STATUS[service.serviceStatus]?.label) || service.serviceStatus}
                          className={(SERVICE_STATUS[service.serviceStatus]?.cls) || "bg-gray-100 text-gray-600"}
                        />
                      </div>
                    ) : null}
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{customer?.name || "--"}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{customer?.phone || "--"}</div>
                  </td>

                  {/* When */}
                  <td className="px-4 py-3 whitespace-nowrap">{renderWhen(b)}</td>

                  {/* Amount */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="font-semibold text-blue-600">{fmtMoney(amountPaid)}</div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-2 items-start">
                      <Badge text={st.label} className={st.cls} />
                      <Badge text={ps.label} className={ps.cls} />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onDetail(b)}
                        className="px-3 py-2 rounded-md border text-sm hover:bg-white bg-white flex items-center gap-2"
                      >
                        <EyeIcon className="w-5 h-5 text-gray-700" />
                        Chi tiết
                      </button>

                      {/*  luôn render, nhưng nếu không được hủy thì invisible để giữ chỗ */}
                      <button
                        onClick={() => showCancel && onCancel(b)}
                        className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 border border-red-600 text-red-600 hover:bg-red-50
                          ${showCancel ? "" : "invisible pointer-events-none"}`}
                        title="Hủy đơn"
                        type="button"
                      >
                        <XCircleIcon className="w-5 h-5" />
                        Hủy
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {items.length === 0 ? <div className="p-10 text-center text-gray-500">Không có đơn phù hợp.</div> : null}
    </div>
  );
}