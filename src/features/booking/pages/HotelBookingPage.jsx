// src/features/booking/pages/HotelBookingPage.jsx
import { useEffect } from "react";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import HotelBookingLayout from "../components/hotel/HotelBookingLayout";
import { useHotelBookingPage } from "../hooks/useHotelBookingPage";

export default function HotelBookingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    loading,
    hotelName,
    roomName,
    guests,
    ratePlan,
    checkIn,
    checkOut,
    nights,
    roomsCount,
    pricingAllRooms,
    remainingRoomsText,
    isEnoughRooms,
    handleStayChange,
    handleRoomsChange,

    contactName,
    contactPhone,
    contactEmail,
    note,
    onContactNameChange,
    onContactPhoneChange,
    onContactEmailChange,
    onNoteChange,

    onPay,
    payLoading,
  } = useHotelBookingPage();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <div className="h-[50px] md:h-[60px]" aria-hidden />

      <main className="flex-1 w-full">
        <HotelBookingLayout
          loading={loading}
          hotelName={hotelName}
          roomName={roomName}
          guests={guests}
          ratePlan={ratePlan}
          checkIn={checkIn}
          checkOut={checkOut}
          nights={nights}
          roomsCount={roomsCount}
          pricingAllRooms={pricingAllRooms}
          remainingRoomsText={remainingRoomsText}
          isEnoughRooms={isEnoughRooms}
          onStayChange={handleStayChange}
          onRoomsChange={handleRoomsChange}

          // ✅ thêm
          contactName={contactName}
          contactPhone={contactPhone}
          contactEmail={contactEmail}
          note={note}
          onContactNameChange={onContactNameChange}
          onContactPhoneChange={onContactPhoneChange}
          onContactEmailChange={onContactEmailChange}
          onNoteChange={onNoteChange}
          onPay={onPay}
          payLoading={payLoading}
        />
      </main>

      <Footer />
    </div>
  );
}