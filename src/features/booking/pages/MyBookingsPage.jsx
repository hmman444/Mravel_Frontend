// src/features/booking/pages/MyBookingsPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

import GuestBookingsList from "../components/public/GuestBookingsList";
import GuestRestaurantBookingsList from "../components/public/GuestRestaurantBookingsList";
import BookingLookupForm from "../components/public/BookingLookupForm";
import BookingTypeTabs from "../components/public/BookingTypeTabs";

import BookingCard from "../components/public/BookingCard";
import RestaurantBookingCard from "../components/public/RestaurantBookingCard";

import { useMyBookingsPage } from "../hooks/useMyBookingsPage";

export default function MyBookingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => window.scrollTo(0, 0), []);

  const {
    // main tabs
    tab,
    setTab,

    // sub type
    type,
    setType,

    // auth
    isLoggedIn,

    // counts
    deviceHotelCount,
    deviceRestCount,
    accountHotelCount,
    accountRestCount,

    // DEVICE (active)
    deviceLoading,
    deviceError,
    deviceItems,
    onRefreshDevice,
    onClearDevice,

    // ACCOUNT (active)
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

  const onOpenHotel = (hotelSlug) =>
    hotelSlug && navigate(`/hotels/${hotelSlug}?fromBooking=1`);

  const onOpenRestaurant = (slug) =>
    slug && navigate(`/restaurants/${slug}?fromBooking=1`);

  const goLogin = () =>
    navigate(`/login?redirect=${encodeURIComponent("/my-bookings")}`);

  const claimButton = (
    <>
      {claimError ? (
        <span className="text-[11px] text-red-600">{claimError}</span>
      ) : null}

      <button
        type="button"
        onClick={onClaimToAccount}
        disabled={claimLoading}
        className={[
          "rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition",
          claimLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-700",
        ].join(" ")}
        title={
          !isLoggedIn
            ? t("booking.claim_login_hint")
            : type === "HOTEL"
            ? t("booking.claim_hotel_hint")
            : t("booking.claim_restaurant_hint")
        }
      >
        {claimLoading ? t("booking.claiming") : t("booking.claim_to_account")}
      </button>

      {!isLoggedIn ? (
        <span className="text-[11px] text-gray-500 dark:text-gray-400">{t("booking.login_required")}</span>
      ) : null}
    </>
  );

  const renderDevice = () => {
    if (type === "HOTEL") {
      return (
        <GuestBookingsList
          loading={deviceLoading}
          error={deviceError}
          items={deviceItems}
          onRefresh={onRefreshDevice}
          onClearDevice={onClearDevice}
          onOpenHotel={onOpenHotel}
          detailScope="PUBLIC"
          title={t("booking.device_hotel_title")}
          description={t("booking.device_list_description")}
          emptyTitle={t("booking.device_hotel_empty_title")}
          emptyDescription={t("booking.device_empty_description")}
          rightActions={claimButton}
        />
      );
    }

    return (
      <GuestRestaurantBookingsList
        loading={deviceLoading}
        error={deviceError}
        items={deviceItems}
        onRefresh={onRefreshDevice}
        onClearDevice={onClearDevice}
        onOpenRestaurant={onOpenRestaurant}
        detailScope="PUBLIC"
        title={t("booking.device_restaurant_title")}
        description={t("booking.device_list_description")}
        emptyTitle={t("booking.device_restaurant_empty_title")}
        emptyDescription={t("booking.device_empty_description")}
        rightActions={claimButton}
      />
    );
  };

  const renderAccount = () => {
    if (!isLoggedIn) {
      return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 md:text-base">
            {t("booking.please_login")}
          </h2>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 md:text-sm">
            {t("booking.login_to_view_account_bookings")}
          </p>

          <button
            type="button"
            onClick={goLogin}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            {t("booking.login")}
          </button>
        </div>
      );
    }

    if (type === "HOTEL") {
      return (
        <GuestBookingsList
          loading={accountLoading}
          error={accountError}
          items={accountItems}
          onRefresh={onRefreshAccount}
          onOpenHotel={onOpenHotel}
          detailScope="PRIVATE"
          title={t("booking.account_hotel_title")}
          description={t("booking.account_list_description")}
          emptyTitle={t("booking.account_hotel_empty_title")}
          emptyDescription={t("booking.account_hotel_empty_description")}
          showClearDevice={false}
        />
      );
    }

    return (
      <GuestRestaurantBookingsList
        loading={accountLoading}
        error={accountError}
        items={accountItems}
        onRefresh={onRefreshAccount}
        onOpenRestaurant={onOpenRestaurant}
        detailScope="PRIVATE"
        title={t("booking.account_restaurant_title")}
        description={t("booking.account_list_description")}
        emptyTitle={t("booking.account_restaurant_empty_title")}
        emptyDescription={t("booking.account_restaurant_empty_description")}
        showClearDevice={false}
      />
    );
  };

  const codeUpper = (lookupResult?.code || bookingCode || "").trim().toUpperCase();
  const isRestaurantCode = codeUpper.startsWith("RB-"); // RB- = restaurant
  const smartResultCard = isRestaurantCode ? RestaurantBookingCard : BookingCard;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="h-[50px] md:h-[60px]" aria-hidden />

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 md:px-6 md:pt-8">
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 md:text-2xl">
              {t("booking.my_bookings_title")}
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 md:text-sm">
              <Trans
                i18nKey="booking.my_bookings_subtitle"
                components={{ b: <b /> }}
              />
            </p>
          </div>

          {/*  Tabs lớn: ACCOUNT / DEVICE / LOOKUP  */}
          <div className="mb-5 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setTab("ACCOUNT")}
                className={[
                  "rounded-xl px-4 py-2 text-xs font-semibold transition md:text-sm",
                  tab === "ACCOUNT"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50",
                ].join(" ")}
              >
                {t("booking.tab_account")}
              </button>

              <button
                type="button"
                onClick={() => setTab("DEVICE")}
                className={[
                  "rounded-xl px-4 py-2 text-xs font-semibold transition md:text-sm",
                  tab === "DEVICE"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50",
                ].join(" ")}
              >
                {t("booking.tab_device")}
              </button>

              <button
                type="button"
                onClick={() => setTab("LOOKUP")}
                className={[
                  "rounded-xl px-4 py-2 text-xs font-semibold transition md:text-sm",
                  tab === "LOOKUP"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50",
                ].join(" ")}
              >
                {t("booking.tab_lookup")}
              </button>
            </div>

            <div className="text-[11px] text-gray-500 dark:text-gray-400 md:text-xs">
              {t("booking.lookup_tip")}
            </div>
          </div>

          {/*  Sub-tab nhỏ gạch chân: HOTEL / RESTAURANT */}
          <div className="mb-5">
            <BookingTypeTabs type={type} setType={setType} />
            <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
              {t("booking.counts_summary", {
                hotel: tab === "ACCOUNT" ? accountHotelCount : deviceHotelCount,
                restaurant: tab === "ACCOUNT" ? accountRestCount : deviceRestCount,
              })}
            </p>
          </div>

          {/*  Content theo tab lớn  */}
          {tab === "ACCOUNT" && renderAccount()}
          {tab === "DEVICE" && renderDevice()}

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
              ResultCard={smartResultCard}
              onOpenHotel={!isRestaurantCode ? onOpenHotel : undefined}
              onOpenRestaurant={isRestaurantCode ? onOpenRestaurant : undefined}
              detailScope="LOOKUP"
              lookupCreds={{ phoneLast4, email }}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}