// src/features/partner/pages/PartnerHotelCreatePage.jsx
import { usePartnerAmenities } from "../../hooks/usePartnerAmenities";
import AmenityMultiSelect from "./form/controls/AmenityMultiSelect";
import RoomTypesEditor from "./form/controls/RoomTypesEditor";

import { usePartnerHotelCreateForm } from "../../hooks/usePartnerHotelCreateForm";
import TopBar from "./form/controls/TopBar";
import BasicInfoSection from "./form/sections/BasicInfoSection";
import ContactLocationSection from "./form/sections/ContactLocationSection";
import ContentBlocksSection from "./form/sections/ContentBlocksSection";
import ImagesSection from "./form/sections/ImagesSection";
import PolicySection from "./form/sections/PolicySection";

export default function PartnerHotelCreatePage({ loading, onBack, onCreate }) {
  const hotelAmenity = usePartnerAmenities("HOTEL");
  const roomAmenity = usePartnerAmenities("ROOM");

  console.log(
    "HOTEL flat length:",
    hotelAmenity.flat?.length,
    hotelAmenity.flat?.[0]
  );

  const fm = usePartnerHotelCreateForm({ onCreate });

  return (
    <div className="space-y-4">
      <TopBar
        loading={loading}
        onBack={onBack}
        onReset={fm.reset}
        onSubmit={fm.submit}
        canSubmit={fm.requiredOk}
      />

      <div className="bg-white rounded-2xl border p-4 space-y-4">
        <BasicInfoSection form={fm.form} setField={fm.setField} />
        <ContactLocationSection form={fm.form} setField={fm.setField} />
        <PolicySection form={fm.form} setField={fm.setField} />

        {/* Amenities (HOTEL) */}
        <div>
          {hotelAmenity.error ? <div className="text-sm text-red-600 mb-2">{hotelAmenity.error}</div> : null}
          <AmenityMultiSelect
            title="Tiện ích khách sạn"
            hint={hotelAmenity.loading ? "Đang tải tiện ích..." : "Chọn tiện ích thuộc khách sạn."}
            items={hotelAmenity.flat || []}
            value={fm.form.amenities || []}
            onChange={(next) => fm.setField("amenities", next)}
          />
        </div>

        {/* Rooms */}
        <div>
          {roomAmenity.error ? <div className="text-sm text-red-600 mb-2">{roomAmenity.error}</div> : null}
          <RoomTypesEditor
            roomAmenities={roomAmenity.flat || []}
            value={fm.form.roomTypes || []}
            onChange={(next) => fm.setField("roomTypes", next)}
          />
        </div>

        <ImagesSection
          images={fm.form.images || []}
          addImageByUrl={fm.addImageByUrl}
          onPickFiles={fm.onPickFiles}
          setCover={fm.setCover}
          removeImageAt={fm.removeImageAt}
          updateImageField={fm.updateImageField}
        />

        <ContentBlocksSection
          content={fm.form.content || []}
          addBlock={fm.addBlock}
          removeBlockAt={fm.removeBlockAt}
          updateBlockField={fm.updateBlockField}
          onPickBlockImage={fm.onPickBlockImage}
        />
      </div>
    </div>
  );
}