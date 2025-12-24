// src/features/partner/components/restaurant/form/PartnerRestaurantFormPage.jsx
import { useMemo } from "react";
import { usePartnerAmenities } from "../../../hooks/usePartnerAmenities";
import { usePartnerRestaurantForm } from "../../../hooks/usePartnerRestaurantForm";

import TopBar from "../../hotel/form/controls/TopBar"; // reuse
import ImagesSection from "../../hotel/form/sections/ImagesSection"; // reuse
import DestinationLocationSection from "../../hotel/form/sections/DestinationLocationSection"; // reuse (đang set destinationSlug)

import AmenityMultiSelect from "../../hotel/form/controls/AmenityMultiSelect"; // reuse

import BasicInfoSection from "./sections/BasicInfoSection";
import ContactLocationSection from "./sections/ContactLocationSection";
import BookingConfigSection from "./sections/BookingConfigSection";
import TableTypesEditor from "./controls/TableTypesEditor";

import {
  createInitialRestaurantForm,
  mapRestaurantDocToForm,
  buildRestaurantPayload,
} from "../../../utils/restaurantFormUtils";

export default function PartnerRestaurantFormPage({
  mode = "create",
  initialRaw,
  loading,
  onBack,
  onSubmit,
}) {
  const restaurantAmenity = usePartnerAmenities("RESTAURANT");

  const initialForm = useMemo(() => {
    return mode === "edit" ? mapRestaurantDocToForm(initialRaw || {}) : createInitialRestaurantForm();
  }, [mode, initialRaw]);

  const fm = usePartnerRestaurantForm({
    initialForm,
    onSubmit: async (payload) => {
      await onSubmit?.(payload);
    },
    buildPayload: (draft) => buildRestaurantPayload(draft, { mode }),
  });

  return (
    <div className="space-y-4">
      <TopBar
        loading={loading}
        onBack={onBack}
        onReset={fm.reset}
        onSubmit={fm.submit}
        canSubmit={fm.requiredOk}
        title="Thêm nhà hàng"
        subtitle="Sau khi tạo sẽ về PENDING chờ admin duyệt."
        submitLabel="Lưu nhà hàng"
        submittingLabel="Đang lưu..."
      />

      <div className="bg-white rounded-2xl border p-4 space-y-4">
        <BasicInfoSection form={fm.form} setField={fm.setField} disabled={loading} />

        <DestinationLocationSection form={fm.form} setField={fm.setField} disabled={loading} />

        <ContactLocationSection form={fm.form} setField={fm.setField} disabled={loading} />

        <BookingConfigSection form={fm.form} setField={fm.setField} disabled={loading} />

        <AmenityMultiSelect
          title="Tiện ích quán ăn"
          hint={restaurantAmenity.loading ? "Đang tải tiện ích..." : "Chọn tiện ích thuộc quán ăn."}
          items={restaurantAmenity.flat || []}
          value={fm.form.amenityCodes || []}
          onChange={(next) => fm.setField("amenityCodes", next)}
        />

        <TableTypesEditor
          value={fm.form.tableTypes || []}
          onChange={(next) => fm.setField("tableTypes", next)}
          disabled={loading}
        />

        <ImagesSection
          images={fm.form.images || []}
          addImageByUrl={fm.addImageByUrl}
          onPickFiles={fm.onPickFiles}
          setCover={fm.setCover}
          removeImageAt={fm.removeImageAt}
          updateImageField={fm.updateImageField}
        />
      </div>
    </div>
  );
}