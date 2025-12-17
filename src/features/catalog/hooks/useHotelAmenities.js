// hooks/useHotelAmenities.js
import { useMemo } from "react";
import { AMENITY_SECTION_CONFIG } from "../utils/amenityConfig";

export function useHotelAmenities(
  amenityCodes = [],
  amenityCatalog = []
) {
  return useMemo(() => {
    if (!amenityCodes.length || !amenityCatalog.length) return [];

    const codeSet = new Set(
      amenityCodes
        .filter(Boolean)
        .map((c) => c.trim().toUpperCase())
    );

    // 1. Filter đúng amenity của hotel
    const matched = amenityCatalog
      .filter(
        (a) =>
          a &&
          a.scope === "HOTEL" &&
          a.active &&
          codeSet.has(a.code)
      )
      .sort(
        (a, b) =>
          (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)
      );

    // 2. Group theo section
    const grouped = {};
    for (const a of matched) {
      const section = a.section || "OTHER";
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(a);
    }

    // 3. Map thành list render
    return Object.keys(grouped)
      .map((section) => ({
        section,
        title:
          (AMENITY_SECTION_CONFIG[section] &&
            AMENITY_SECTION_CONFIG[section].title) ||
          section,
        order:
          (AMENITY_SECTION_CONFIG[section] &&
            AMENITY_SECTION_CONFIG[section].order) ||
          999,
        items: grouped[section],
      }))
      .sort((a, b) => a.order - b.order);
  }, [amenityCodes, amenityCatalog]);
}
