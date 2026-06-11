import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const canSubmit = useMemo(() => {
    const codeOk = bookingCode?.trim()?.length >= 6;
    const last4Ok = phoneLast4?.trim()?.length === 4;
    return codeOk && last4Ok && !loading;
  }, [bookingCode, phoneLast4, loading]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm md:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Search className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 md:text-base">
              {t("booking.lookup_title")}
            </h2>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 md:text-sm">
              {t("booking.lookup_hint_enter")} <b>{t("booking.booking_code")}</b> + <b>{t("booking.phone_last4")}</b>. {t("booking.lookup_hint_email_optional")}
            </p>
          </div>
        </div>

        <form
          className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await onSubmit?.(); // await
            } catch {
              // lỗi lookup đã được slice xử lý & hiển thị qua `error`
            }
          }}
        >
          {/* bookingCode */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t("booking.booking_code")} <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 focus-within:border-blue-500">
              <Hash className="mr-2 h-4 w-4 text-gray-400" />
              <input
                value={bookingCode}
                onChange={(e) => onBookingCodeChange?.(e.target.value)}
                placeholder={t("booking.booking_code_placeholder")}
                className="h-10 w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {/* last4 */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t("booking.phone_last4")} <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 focus-within:border-blue-500">
              <Phone className="mr-2 h-4 w-4 text-gray-400" />
              <input
                value={phoneLast4}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  onPhoneLast4Change?.(v);
                }}
                placeholder={t("booking.phone_last4_placeholder")}
                className="h-10 w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {/* email optional */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t("booking.email_optional")}
            </label>
            <div className="flex items-center rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 focus-within:border-blue-500">
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
              {loading ? t("booking.looking_up") : t("common.search")}
            </button>

            {result ? (
              <button
                type="button"
                onClick={onClearResult}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-200 shadow-sm transition hover:border-blue-400 hover:text-blue-700"
              >
                {t("booking.clear_result")}
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
            {t("booking.lookup_found_prefix")} <b>{t("booking.lookup_found_save_code")}</b> {t("booking.lookup_found_suffix")}
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