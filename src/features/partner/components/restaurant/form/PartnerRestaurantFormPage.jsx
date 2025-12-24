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
import RestaurantMetaSection from "./sections/RestaurantMetaSection";
import CuisinesEditor from "./controls/CuisinesEditor";
import OpeningHoursEditor from "./controls/OpeningHoursEditor";
import CodeNameListEditor from "./controls/CodeNameListEditor";
import SimpleListEditor from "./controls/SimpleListEditor";

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

        <RestaurantMetaSection form={fm.form} setField={fm.setField} disabled={loading} />

        <DestinationLocationSection form={fm.form} setField={fm.setField} disabled={loading} />

        <ContactLocationSection form={fm.form} setField={fm.setField} disabled={loading} />

        <CuisinesEditor
          value={fm.form.cuisines || []}
          onChange={(next) => fm.setField("cuisines", next)}
          disabled={loading}
        />

        <OpeningHoursEditor
          value={fm.form.openingHours || []}
          onChange={(next) => fm.setField("openingHours", next)}
          disabled={loading}
        />

        <CodeNameListEditor
          title="Phù hợp (suitableFor)"
          hint="Nhập code + tên hiển thị."
          value={fm.form.suitableFor || []}
          onChange={(next) => fm.setField("suitableFor", next)}
          disabled={loading}
        />

        <CodeNameListEditor
          title="Không gian (ambience)"
          hint="Nhập code + tên hiển thị."
          value={fm.form.ambience || []}
          onChange={(next) => fm.setField("ambience", next)}
          disabled={loading}
        />

        <SimpleListEditor
          title="Món đặc sắc (signatureDishes)"
          hint="Chỉ cần nhập tên món."
          value={(fm.form.signatureDishes || []).map((x) => (typeof x === "string" ? x : x?.name || ""))}
          onChange={(next) => fm.setField("signatureDishes", next.map((name) => ({ name })))}
          disabled={loading}
          placeholder="Ví dụ: Cơm gà Hội An"
        />

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