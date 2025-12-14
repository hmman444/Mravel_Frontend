import RestaurantBookingForm from "./RestaurantBookingForm";
import RestaurantBookingSelectedTableCard from "./RestaurantBookingSelectedTableCard";
import RestaurantBookingPriceSummaryCard from "./RestaurantBookingPriceSummaryCard";
import RestaurantBookingPolicyCard from "./RestaurantBookingPolicyCard";

export default function RestaurantBookingLayout({
  loading,

  restaurantName,
  restaurantSlug,

  // inputs
  adults,
  children,
  date,
  time,

  tableTypes,
  tableTypeId,
  tableType,
  tablesCount,

  // availability
  remainingText,
  isEnough,

  // contact
  contactName,
  contactPhone,
  contactEmail,
  note,
  onContactNameChange,
  onContactPhoneChange,
  onContactEmailChange,
  onNoteChange,

  // handlers
  onAdultsChange,
  onChildrenChange,
  onDateTimeChange,
  onTableTypeChange,
  onTablesCountChange,

  // pay
  depositPerTable,
  holdMinutes,
  onPay,
  payLoading,

  openingHours = [],

  people = 1,
  minTables = 1,
  totalSeats = 0,
  isSeatEnough = true,
  seatErrorText = "",
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-10 pt-6 md:px-6 md:pt-8">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
          Hoàn tất đặt bàn
        </h1>
        <p className="mt-1 text-xs text-gray-600 md:text-sm">
          Vui lòng kiểm tra lại thông tin liên hệ, thời gian và loại bàn trước khi
          thanh toán đặt cọc.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <RestaurantBookingForm
            contactName={contactName}
            contactPhone={contactPhone}
            contactEmail={contactEmail}
            note={note}
            onContactNameChange={onContactNameChange}
            onContactPhoneChange={onContactPhoneChange}
            onContactEmailChange={onContactEmailChange}
            onNoteChange={onNoteChange}
            adults={adults}
            children={children}
            onAdultsChange={onAdultsChange}
            onChildrenChange={onChildrenChange}
            date={date}
            time={time}
            onDateTimeChange={onDateTimeChange}
            tableTypeId={tableTypeId}
            tableTypes={tableTypes}
            onTableTypeChange={onTableTypeChange}
            tablesCount={tablesCount}
            onTablesCountChange={onTablesCountChange}
            openingHours={openingHours}
             tableType={tableType}
            people={people}
            minTables={minTables}
            totalSeats={totalSeats}
            seatErrorText={seatErrorText}
          />

          <RestaurantBookingPolicyCard />
        </div>

        <div className="space-y-4">
          <RestaurantBookingSelectedTableCard
            restaurantName={restaurantName}
            restaurantSlug={restaurantSlug}
            adults={adults}
            children={children}
            date={date}
            time={time}
            tableType={tableType}
            tablesCount={tablesCount}
            remainingText={remainingText}
            isEnough={isEnough}
            isSeatEnough={isSeatEnough}
            seatErrorText={seatErrorText}
          />

          <RestaurantBookingPriceSummaryCard
            tableTypeName={tableType?.name}
            depositPerTable={depositPerTable}
            tablesCount={tablesCount}
            holdMinutes={holdMinutes}
            onPay={onPay}
            disabled={!isEnough || !isSeatEnough || !tableTypeId || !time || !date}
            loading={!!payLoading}
          />
        </div>
      </div>

      {loading && (
        <p className="mt-4 text-xs text-gray-500">Đang tải thông tin nhà hàng...</p>
      )}
    </div>
  );
}