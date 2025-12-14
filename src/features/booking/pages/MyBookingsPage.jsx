// src/features/booking/pages/MyBookingsPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

import GuestBookingsList from "../components/public/GuestBookingsList";
import BookingLookupForm from "../components/public/BookingLookupForm";
import { useMyBookingsPage } from "../hooks/useMyBookingsPage";

export default function MyBookingsPage() {
  const navigate = useNavigate();

  useEffect(() => window.scrollTo(0, 0), []);

  const {
    // tabs
    tab,
    setTab,

    // auth
    isLoggedIn,

    // DEVICE
    deviceCount,
    deviceLoading,
    deviceError,
    deviceItems,
    onRefreshDevice,
    onClearDevice,

    // ACCOUNT
    accountCount,
    accountLoading,
    accountError,
    accountItems,
    onRefreshAccount,

    // claim
    claimLoading,
    claimError,
    onClaimToAccount,

    // LOOKUP
    bookingCode,
    phoneLast4,
    email,
    setBookingCode,
    setPhoneLast4,
    setEmail,
    lookupLoading,
    lookupError,
    lookupResult,
    onSubmitLookup,
    onClearLookupResult,
  } = useMyBookingsPage();

  const onOpenHotel = (hotelSlug) => {
    if (!hotelSlug) return;
    navigate(`/hotels/${hotelSlug}`);
  };

  const goLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent("/my-bookings")}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <div className="h-[50px] md:h-[60px]" aria-hidden />

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 md:px-6 md:pt-8">
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
              Đơn đã đặt
            </h1>
            <p className="mt-1 text-xs text-gray-600 md:text-sm">
              Bạn có thể xem theo <b>tài khoản</b>, theo <b>cookie thiết bị</b>, hoặc{" "}
              <b>tra cứu bằng mã</b>.
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-5 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setTab("ACCOUNT")}
                className={[
                  "rounded-xl px-4 py-2 text-xs font-semibold transition md:text-sm",
                  tab === "ACCOUNT"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                Đơn trong tài khoản ({accountCount})
              </button>

              <button
                type="button"
                onClick={() => setTab("DEVICE")}
                className={[
                  "rounded-xl px-4 py-2 text-xs font-semibold transition md:text-sm",
                  tab === "DEVICE"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                Đơn trên thiết bị này ({deviceCount})
              </button>

              <button
                type="button"
                onClick={() => setTab("LOOKUP")}
                className={[
                  "rounded-xl px-4 py-2 text-xs font-semibold transition md:text-sm",
                  tab === "LOOKUP"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                Tra cứu
              </button>
            </div>

            <div className="text-[11px] text-gray-500 md:text-xs">
              Tip: Sau khi đặt xong, bạn nên copy/chụp lại mã booking để tra cứu.
            </div>
          </div>

          {/* Tab content */}
          {tab === "ACCOUNT" && (
            <>
              {!isLoggedIn ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-900 md:text-base">
                    Vui lòng đăng nhập
                  </h2>
                  <p className="mt-1 text-xs text-gray-600 md:text-sm">
                    Bạn cần đăng nhập để xem đơn trong tài khoản.
                  </p>

                  <button
                    type="button"
                    onClick={goLogin}
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                  >
                    Đăng nhập
                  </button>
                </div>
              ) : (
                <GuestBookingsList
                    loading={accountLoading}
                    error={accountError}
                    items={accountItems}
                    onRefresh={onRefreshAccount}
                    onOpenHotel={onOpenHotel}
                    detailScope="PRIVATE"

                    title="Đơn trong tài khoản này"
                    description="Danh sách này gắn với tài khoản đang đăng nhập."
                    emptyTitle="Chưa có đơn nào trong tài khoản."
                    emptyDescription="Bạn có thể đặt phòng hoặc xem đơn theo thiết bị ở tab bên cạnh."
                    showClearDevice={false}
                    />
              )}
            </>
          )}

          {tab === "DEVICE" && (
            <GuestBookingsList
                loading={deviceLoading}
                error={deviceError}
                items={deviceItems}
                onRefresh={onRefreshDevice}
                onClearDevice={onClearDevice}
                onOpenHotel={onOpenHotel}
                detailScope="PUBLIC"

                title="Đơn trên thiết bị này"
                description="Danh sách này dựa trên cookie trình duyệt. Nếu bạn xoá dữ liệu trình duyệt, danh sách có thể mất."
                emptyTitle="Chưa có đơn nào trên thiết bị này."
                emptyDescription="Bạn có thể tra cứu theo mã ở tab “Tra cứu”."
                rightActions={
                <>
                    {claimError && (
                    <span className="text-[11px] text-red-600">{claimError}</span>
                    )}

                    <button
                    type="button"
                    onClick={onClaimToAccount}
                    disabled={claimLoading}
                    className={[
                        "rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition",
                        claimLoading ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700",
                    ].join(" ")}
                    title={!isLoggedIn ? "Bạn chưa đăng nhập, bấm để chuyển tới trang đăng nhập" : "Gộp đơn guest vào tài khoản"}
                    >
                    {claimLoading ? "Đang gộp..." : "Gộp vào tài khoản"}
                    </button>

                    {!isLoggedIn && (
                    <span className="text-[11px] text-gray-500">
                        (Cần đăng nhập)
                    </span>
                    )}
                </>
                }
            />
            )}

          {tab === "LOOKUP" && (
            <BookingLookupForm
              bookingCode={bookingCode}
              phoneLast4={phoneLast4}
              email={email}
              onBookingCodeChange={setBookingCode}
              onPhoneLast4Change={setPhoneLast4}
              onEmailChange={setEmail}
              onSubmit={onSubmitLookup}
              onClearResult={onClearLookupResult}
              loading={lookupLoading}
              error={lookupError}
              result={lookupResult}
              onOpenHotel={onOpenHotel}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}