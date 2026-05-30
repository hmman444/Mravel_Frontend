// src/features/partner/components/restaurant/form/PartnerRestaurantFormPage.jsx
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import CapacitySection from "./sections/CapacitySection";
import ParkingSection from "./sections/ParkingSection";
import PolicySection from "./sections/PolicySection";
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
  const { t } = useTranslation();
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
        title={t("partner.restaurant.form_title")}
        subtitle={t("partner.restaurant.pending_note")}
        submitLabel={t("partner.restaurant.submit_label")}
        submittingLabel={t("common.processing")}
      />

      <div className="bg-white dark:bg-gray-800 rounded-2xl border p-4 space-y-4">
        <BasicInfoSection form={fm.form} setField={fm.setField} disabled={loading} />

        <RestaurantMetaSection form={fm.form} setField={fm.setField} disabled={loading} />

        <DestinationLocationSection form={fm.form} setField={fm.setField} disabled={loading} />

        <ContactLocationSection form={fm.form} setField={fm.setField} disabled={loading} />

        <CapacitySection form={fm.form} setField={fm.setField} disabled={loading} />

        <ParkingSection form={fm.form} setField={fm.setField} disabled={loading} />

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
          title={t("partner.restaurant.suitable_for_title")}
          hint={t("partner.restaurant.code_name_hint")}
          value={fm.form.suitableFor || []}
          onChange={(next) => fm.setField("suitableFor", next)}
          disabled={loading}
        />

        <CodeNameListEditor
          title={t("partner.restaurant.ambience_title")}
          hint={t("partner.restaurant.code_name_hint")}
          value={fm.form.ambience || []}
          onChange={(next) => fm.setField("ambience", next)}
          disabled={loading}
        />

        <SimpleListEditor
          title={t("partner.restaurant.signature_dishes_title")}
          hint={t("partner.restaurant.signature_dishes_hint")}
          value={(fm.form.signatureDishes || []).map((x) => (typeof x === "string" ? x : x?.name || ""))}
          onChange={(next) => fm.setField("signatureDishes", next.map((name) => ({ name })))}
          disabled={loading}
          placeholder={t("partner.restaurant.signature_dishes_placeholder")}
        />

        <BookingConfigSection form={fm.form} setField={fm.setField} disabled={loading} />

        <PolicySection form={fm.form} setField={fm.setField} disabled={loading} />

        <AmenityMultiSelect
          title={t("partner.restaurant.amenity_title")}
          hint={restaurantAmenity.loading ? t("partner.restaurant.amenity_loading") : t("partner.restaurant.amenity_hint")}
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