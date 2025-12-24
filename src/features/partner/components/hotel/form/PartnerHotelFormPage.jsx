// src/features/partner/components/hotel/form/PartnerHotelFormPage.jsx
import { useMemo } from "react";
import { usePartnerAmenities } from "../../../hooks/usePartnerAmenities";
import { usePartnerHotelCreateForm } from "../../../hooks/usePartnerHotelCreateForm";

import TopBar from "../form/controls/TopBar";
import BasicInfoSection from "./sections/BasicInfoSection";
import ContactLocationSection from "./sections/ContactLocationSection";
import PolicySection from "./sections/PolicySection";
import ImagesSection from "./sections/ImagesSection";
import ContentBlocksSection from "./sections/ContentBlocksSection";
import AmenityMultiSelect from "./controls/AmenityMultiSelect";
import RoomTypesEditor from "./controls/RoomTypesEditor";
import DestinationLocationSection from "./sections/DestinationLocationSection";
import TaxAndFeeSection from "./sections/TaxAndFeeSection";
import BookingConfigSection from "./sections/BookingConfigSection";

import { createInitialHotelForm, mapHotelDocToForm, buildHotelPayload } from "../../../utils/hotelFormUtils";

export default function PartnerHotelFormPage({
  mode = "create",
  initialRaw,
  loading,
  onBack,
  onSubmit, // async (payload) => void
}) {
  const hotelAmenity = usePartnerAmenities("HOTEL");
  const roomAmenity = usePartnerAmenities("ROOM");

  const initialForm = useMemo(() => {
    return mode === "edit" ? mapHotelDocToForm(initialRaw || {}) : createInitialHotelForm();
  }, [mode, initialRaw]);

  // bạn có thể rename hook này thành usePartnerHotelForm cho đúng nghĩa
  const fm = usePartnerHotelCreateForm({
    initialForm, // ✅ sửa hook để nhận initialForm thay vì tự createInitialHotelForm()
    onCreate: async (payload) => {
      await onSubmit?.(payload);
    },
    buildPayload: (form) => buildHotelPayload(form, { mode }),
  });

  return (
    <div className="space-y-4">
      <TopBar
        loading={loading}
        onBack={onBack}
        onReset={fm.reset}
        onSubmit={fm.submit}
        canSubmit={fm.requiredOk}
        title={mode === "edit" ? "Chỉnh sửa khách sạn" : "Thêm khách sạn"}
        subtitle={mode === "edit" ? "Cập nhật thông tin và lưu lại." : "Sau khi tạo sẽ về PENDING chờ admin duyệt."}
      />

      <div className="bg-white rounded-2xl border p-4 space-y-4">
        <BasicInfoSection form={fm.form} setField={fm.setField} />
        <ContactLocationSection form={fm.form} setField={fm.setField} />
        <DestinationLocationSection form={fm.form} setField={fm.setField} />

        <TaxAndFeeSection form={fm.form} setField={fm.setField} />
        <BookingConfigSection form={fm.form} setField={fm.setField} />

        <PolicySection form={fm.form} setField={fm.setField} />
        <AmenityMultiSelect
          title="Tiện ích khách sạn"
          hint={hotelAmenity.loading ? "Đang tải tiện ích..." : "Chọn tiện ích thuộc khách sạn."}
          items={hotelAmenity.flat || []}
          value={fm.form.amenities || []}
          onChange={(next) => fm.setField("amenities", next)}
        />

        <RoomTypesEditor
          roomAmenities={roomAmenity.flat || []}
          value={fm.form.roomTypes || []}
          onChange={(next) => fm.setField("roomTypes", next)}
        />

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