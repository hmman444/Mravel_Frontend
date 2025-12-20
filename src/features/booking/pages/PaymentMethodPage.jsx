import Navbar from "../../../components/Navbar";
import { useState } from "react";
import Footer from "../../../components/Footer";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";

import InfoModal from "../components/common/InfoModal";
import { usePaymentMethods } from "../hooks/usePaymentMethods";
import { usePaymentMethodPage } from "../hooks/usePaymentMethodPage";

function MethodCard({ method, disabled, onClick }) {
  const Icon = method.icon;
  const [imgOk, setImgOk] = useState(true);

  const showImg = !!method.iconSrc && imgOk;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "group relative flex flex-col items-start gap-2 rounded-3xl p-4 text-left transition",
        "bg-white hover:-translate-y-[1px] hover:shadow-md",
        disabled ? "opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none" : "",
      ].join(" ")}
      title={method.label}
    >
      <div className="flex w-full items-center justify-between">
        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-2xl overflow-hidden",
            method.supported ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-700",
          ].join(" ")}
        >
          {showImg ? (
            <img
              src={method.iconSrc}
              alt={method.label}
              className="h-9 w-9 object-contain"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgOk(false)}
            />
          ) : Icon ? (
            <Icon className="h-8 w-8" />
          ) : (
            <span className="text-[10px] text-gray-400">N/A</span>
          )}
        </div>

        <span
          className={[
            "rounded-full px-2 py-1 text-[10px] font-semibold",
            method.supported ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500",
          ].join(" ")}
        >
          {method.supported ? (method.badge || "Hỗ trợ") : "Chưa hỗ trợ"}
        </span>
      </div>

      <div className="mt-1">
        <div className="text-sm font-semibold text-gray-900">{method.label}</div>
        <div className="mt-0.5 text-[11px] text-gray-500">
          {method.supported ? "Chuyển đến trang QR để thanh toán" : "Chỉ hiển thị icon minh hoạ"}
        </div>
      </div>

      {method.supported && (
        <div className="absolute inset-x-4 bottom-4 h-[2px] rounded-full bg-gradient-to-r from-blue-200 to-blue-50 opacity-0 transition group-hover:opacity-100" />
      )}
    </button>
  );
}

export default function PaymentMethodPage() {
  const groups = usePaymentMethods();
  const {
    meta,
    amountText,
    showMissing,
    payLoading,
    payError,
    modal,
    closeModal,
    goBack,
    onPickMethod,
    goHome,
  } = usePaymentMethodPage();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <div className="h-[50px] md:h-[60px]" aria-hidden />

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 md:px-6 md:pt-8">
          {/* Header modern */}
          <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="text-gray-500 font-medium">Bảo mật thanh toán</div>
                  <div className="text-emerald-700">Cổng thanh toán</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
                  Chọn phương thức thanh toán
                </h1>
                <p className="mt-1 text-xs text-gray-600 md:text-sm">
                  {meta?.subTitle ? (
                    <>
                      Đơn: <span className="font-semibold text-gray-900">{meta.subTitle}</span>
                      {amountText ? (
                        <>
                          {" "}
                          · Tổng: <span className="font-semibold text-gray-900">{amountText}</span>
                        </>
                      ) : null}
                    </>
                  ) : (
                    "Vui lòng chọn 1 phương thức để tiếp tục."
                  )}
                </p>
              </div>

              {/* tiny progress */}
              <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-2 text-xs text-gray-700">
                <Lock className="h-4 w-4 text-gray-500" />
                <span>1/2 Chọn phương thức</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-400">2/2 Quét QR</span>
              </div>
            </div>

            {payError && (
              <p className="mt-3 text-xs font-semibold text-red-600">{String(payError)}</p>
            )}
          </div>

          {/* Missing draft */}
          {showMissing ? (
            <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5">
              <div className="text-sm font-semibold text-yellow-800">
                Không tìm thấy thông tin đơn để thanh toán.
              </div>
              <p className="mt-1 text-xs text-yellow-700">
                Bạn hãy quay lại trang đặt phòng và bấm “Thanh toán” lại nhé.
              </p>
              <button
                className="mt-4 rounded-2xl bg-[#007bff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#ff6b1a]"
                onClick={goHome}
              >
                Về trang chủ
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((g) => (
                <section key={g.title} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900 md:text-base">{g.title}</h2>
                    <span className="text-[11px] text-gray-500">
                      {payLoading ? "Đang tạo thanh toán..." : "Chọn để tiếp tục"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {g.items.map((m) => (
                      <MethodCard
                        key={m.key}
                        method={m}
                        disabled={payLoading}
                        onClick={() => onPickMethod(m)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <InfoModal
          open={modal.open}
          title={modal.title}
          message={modal.message}
          onClose={closeModal}
        />
      </main>

      <Footer />
    </div>
  );
}