// src/features/booking/components/hotel/HotelBookingLayout.jsx
import HotelBookingForm from "./HotelBookingForm";
import HotelBookingSelectedRoomCard from "./HotelBookingSelectedRoomCard";
import HotelBookingPriceSummaryCard from "./HotelBookingPriceSummaryCard";
import HotelBookingPolicyCard from "./HotelBookingPolicyCard";

export default function HotelBookingLayout({
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
  // handlers
  onStayChange,
  onRoomsChange,
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-10 pt-6 md:px-6 md:pt-8">
      {/* Title */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
          Hoàn tất đặt phòng
        </h1>
        <p className="mt-1 text-xs text-gray-600 md:text-sm">
          Vui lòng kiểm tra lại thông tin liên hệ và chi tiết đặt phòng
          trước khi thanh toán.
        </p>
      </div>

      {/* GRID 2 CỘT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
        {/* LEFT: FORM */}
        <div className="space-y-6">
          <HotelBookingForm
            defaultName="Mẫn Huỳnh Minh"
            defaultEmail="nsndman0404@gmail.com"
            checkIn={checkIn}
            checkOut={checkOut}
            nights={nights}
            roomsCount={roomsCount}
            onStayChange={onStayChange}
            onRoomsChange={onRoomsChange}
          />
          <HotelBookingPolicyCard />
        </div>

        {/* RIGHT: SUMMARY + POLICY + PRICE */}
        <div className="space-y-4">
          <HotelBookingSelectedRoomCard
            hotelName={hotelName}
            roomName={roomName}
            nights={nights}
            guests={guests}
            roomsCount={roomsCount}
            checkInDate={checkIn}
            checkOutDate={checkOut}
            remainingRoomsText={remainingRoomsText}
            isEnoughRooms={isEnoughRooms}
            refundable={ratePlan?.refundable}
          />

          <HotelBookingPriceSummaryCard
            roomName={roomName}
            nights={nights}
            roomsCount={roomsCount}
            roomPrice={pricingAllRooms?.roomPrice}
            taxAndFee={pricingAllRooms?.taxAndFee}
            originalTotal={pricingAllRooms?.originalTotal}
            finalTotal={pricingAllRooms?.finalTotal}
            paymentType={ratePlan?.paymentType}
          />
        </div>
      </div>

      {loading && (
        <p className="mt-4 text-xs text-gray-500">
          Đang tải thông tin phòng...
        </p>
      )}
    </div>
  );
}