import { useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

import RestaurantBookingLayout from "../components/restaurant/RestaurantBookingLayout";
import { useRestaurantBookingPage } from "../hooks/useRestaurantBookingPage";

export default function RestaurantBookingPage() {
  useEffect(() => window.scrollTo(0, 0), []);

  const {
    loading,
    restaurantName,
    restaurantSlug,

    adults,
    children,
    date,
    time,

    tableTypes,
    tableTypeId,
    tableType,
    tablesCount,

    remainingText,
    isEnough,

    contactName,
    contactPhone,
    contactEmail,
    note,
    onAdultsChange,
    onChildrenChange,
    onDateTimeChange,
    onTableTypeChange,
    onTablesCountChange,
    onContactNameChange,
    onContactPhoneChange,
    onContactEmailChange,
    onNoteChange,

    depositPerTable,
    holdMinutes,

    openingHours,

    onPay,
    payLoading,
    people,
    minTables,
    totalSeats,
    isSeatEnough,
    seatErrorText,
  } = useRestaurantBookingPage();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <div className="h-[50px] md:h-[60px]" aria-hidden />

      <main className="flex-1 w-full">
        <RestaurantBookingLayout
          loading={loading}
          restaurantName={restaurantName}
          restaurantSlug={restaurantSlug}
          adults={adults}
          children={children}
          date={date}
          time={time}
          tableTypes={tableTypes}
          tableTypeId={tableTypeId}
          tableType={tableType}
          tablesCount={tablesCount}
          remainingText={remainingText}
          isEnough={isEnough}
          contactName={contactName}
          contactPhone={contactPhone}
          contactEmail={contactEmail}
          note={note}
          onContactNameChange={onContactNameChange}
          onContactPhoneChange={onContactPhoneChange}
          onContactEmailChange={onContactEmailChange}
          onNoteChange={onNoteChange}
          onAdultsChange={onAdultsChange}
          onChildrenChange={onChildrenChange}
          onDateTimeChange={onDateTimeChange}
          onTableTypeChange={onTableTypeChange}
          onTablesCountChange={onTablesCountChange}
          depositPerTable={depositPerTable}
          holdMinutes={holdMinutes}
          onPay={onPay}
          payLoading={payLoading}
          openingHours={openingHours}
          people={people}
          minTables={minTables}
          totalSeats={totalSeats}
          isSeatEnough={isSeatEnough}
          seatErrorText={seatErrorText}
        />
      </main>

      <Footer />
    </div>
  );
}