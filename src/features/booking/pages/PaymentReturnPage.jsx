import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getBookingStatusByCode } from "../services/bookingService";

const CONFIRMED_STATUSES = ["PAID", "CONFIRMED", "COMPLETED"];
const MAX_POLLS = 5;
const POLL_INTERVAL_MS = 2000;

export default function PaymentReturnPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const queryStatus = (params.get("status") || "").toLowerCase(); // success | failed | error
  const code = params.get("code") || "";

  // phase: 'confirming' | 'success' | 'pending' | 'failed' | 'error'
  const [phase, setPhase] = useState(() => {
    if (queryStatus === "failed") return "failed";
    if (queryStatus === "success") return code ? "confirming" : "success";
    return "error";
  });

  const cancelledRef = useRef(false);

  const poll = useCallback(async () => {
    try {
      let attempt = 0;
      while (!cancelledRef.current && attempt < MAX_POLLS) {
        const res = await getBookingStatusByCode(code);
        if (cancelledRef.current) return;

        const st = (res?.data?.status || "").toUpperCase();
        if (res.success && CONFIRMED_STATUSES.includes(st)) {
          setPhase("success");
          return;
        }

        attempt += 1;
        if (attempt < MAX_POLLS) {
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        }
      }
      // Đã thanh toán nhưng backend chưa cập nhật xong (IPN trễ) -> vẫn báo tích cực
      if (!cancelledRef.current) setPhase("pending");
    } catch {
      // Lỗi mạng / server bất thường khi poll -> hiển thị trạng thái lỗi
      if (!cancelledRef.current) setPhase("error");
    }
  }, [code]);

  useEffect(() => {
    cancelledRef.current = false;
    if (phase === "confirming") {
      poll().catch(() => {
        if (!cancelledRef.current) setPhase("error");
      });
    }
    return () => {
      cancelledRef.current = true;
    };
    // chỉ chạy 1 lần khi mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const view = {
    confirming: {
      icon: (
        <div className="h-16 w-16 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
      ),
      title: t("booking.payment_return.confirming_title"),
      desc: t("booking.payment_return.confirming_desc"),
    },
    success: {
      icon: <div className="text-6xl">✅</div>,
      title: t("booking.payment_return.success_title"),
      desc: t("booking.payment_return.success_desc"),
    },
    pending: {
      icon: <div className="text-6xl">⏳</div>,
      title: t("booking.payment_return.pending_title"),
      desc: t("booking.payment_return.pending_desc"),
    },
    failed: {
      icon: <div className="text-6xl">❌</div>,
      title: t("booking.payment_return.failed_title"),
      desc: t("booking.payment_return.failed_desc"),
    },
    error: {
      icon: <div className="text-6xl">⚠️</div>,
      title: t("booking.payment_return.error_title"),
      desc: t("booking.payment_return.error_desc"),
    },
  }[phase];

  return (
    <div className="min-h-screen flex flex-col bg-neutral dark:bg-gray-950">
      <Navbar fixedWhite />

      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
          <div className="flex justify-center mb-5">{view.icon}</div>

          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {view.title}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {view.desc}
          </p>

          {code && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {t("booking.payment_return.booking_code")}:{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {code}
              </span>
            </p>
          )}

          {phase !== "confirming" && (
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => navigate("/my-bookings")}
                className="w-full rounded-lg bg-primary px-5 py-3 text-white font-semibold hover:opacity-90"
              >
                {t("booking.payment_return.view_my_bookings")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-3 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {t("booking.payment_return.back_home")}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
