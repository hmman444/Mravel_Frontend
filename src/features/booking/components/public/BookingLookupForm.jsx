import { useMemo } from "react";
import { Search, Mail, Phone, Hash } from "lucide-react";

export default function BookingLookupForm({
  bookingCode,
  phoneLast4,
  email,

  onBookingCodeChange,
  onPhoneLast4Change,
  onEmailChange,

  onSubmit,
  onClearResult,

  loading,
  error,
  result,

  ResultCard,
  onOpenHotel,
  onOpenRestaurant,

  detailScope = "PUBLIC",
  lookupCreds
}) {
  const canSubmit = useMemo(() => {
    const codeOk = bookingCode?.trim()?.length >= 6;
    const last4Ok = phoneLast4?.trim()?.length === 4;
    return codeOk && last4Ok && !loading;
  }, [bookingCode, phoneLast4, loading]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Search className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 md:text-base">
              Tra cứu đơn đặt
            </h2>
            <p className="mt-1 text-xs text-gray-600 md:text-sm">
              Nhập <b>mã booking</b> + <b>4 số cuối SĐT</b>. Email là tuỳ chọn (nếu bạn đã nhập email lúc đặt).
            </p>
          </div>
        </div>

        <form
          className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"
          onSubmit={async (e) => {
            e.preventDefault();

            console.log("SUBMIT fired", { bookingCode, phoneLast4, email });

            try {
              await onSubmit?.(); // await
              console.log("SUBMIT done");
            } catch (err) {
              console.error("SUBMIT error:", err); //thấy lỗi rõ ràng
            }
          }}
        >
          {/* bookingCode */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Mã booking <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3 focus-within:border-blue-500">
              <Hash className="mr-2 h-4 w-4 text-gray-400" />
              <input
                value={bookingCode}
                onChange={(e) => onBookingCodeChange?.(e.target.value)}
                placeholder="VD: BK-AFCD3775"
                className="h-10 w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {/* last4 */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              4 số cuối SĐT <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3 focus-within:border-blue-500">
              <Phone className="mr-2 h-4 w-4 text-gray-400" />
              <input
                value={phoneLast4}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  onPhoneLast4Change?.(v);
                }}
                placeholder="VD: 4567"
                className="h-10 w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {/* email optional */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Email (tuỳ chọn)
            </label>
            <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3 focus-within:border-blue-500">
              <Mail className="mr-2 h-4 w-4 text-gray-400" />
              <input
                value={email}
                onChange={(e) => onEmailChange?.(e.target.value)}
                placeholder="email@example.com"
                className="h-10 w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={!canSubmit}
              className={[
                "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
                canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed",
              ].join(" ")}
            >
              {loading ? "Đang tra cứu..." : "Tra cứu"}
            </button>

            {result ? (
              <button
                type="button"
                onClick={onClearResult}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-blue-400 hover:text-blue-700"
              >
                Xoá kết quả
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="md:col-span-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          ) : null}
        </form>
      </div>

      {result ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 md:text-sm">
            Đã tìm thấy đơn. Bạn nên <b>copy/chụp lại mã booking</b> để tra cứu lần sau nếu lỡ xoá dữ liệu trình duyệt.
          </div>
          {ResultCard ? (
            <ResultCard
              booking={result}
              onOpenHotel={onOpenHotel}
              onOpenRestaurant={onOpenRestaurant}
              detailScope={detailScope}
              lookupCreds={lookupCreds}
              onRefresh={onSubmit}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}