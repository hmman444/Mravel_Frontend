// src/features/booking/hooks/useHotelPricing.js
import { useMemo } from "react";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function computeDisplayPrice(rawPrice, { priceIncludesTax, taxPercent, serviceFeePercent }, mode) {
  if (rawPrice == null) return null;

  const tax = Number(taxPercent || 0);
  const fee = Number(serviceFeePercent || 0);
  const factor = 1 + (tax + fee) / 100;

  const includesTax =
    priceIncludesTax === undefined || priceIncludesTax === null
      ? true
      : !!priceIncludesTax;

  if (mode === "INCL_TAX") {
    return includesTax ? Math.round(rawPrice) : Math.round(rawPrice * factor);
  } else {
    return includesTax ? Math.round(rawPrice / factor) : Math.round(rawPrice);
  }
}

/**
 * Tính giá theo ĐÊM (nights):
 * nights = max(1, diffDays)
 *  - 15 -> 16  => diff=1 => nights=1
 *  - 15 -> 18  => diff=3 => nights=3
 */
export function useHotelPricing(ratePlan, checkIn, checkOut, roomsCount) {
  const pricingPerRoom = useMemo(() => {
    if (!ratePlan?.pricePerNight) return null;

    // ====== TÍNH SỐ ĐÊM ======
    let nights = 1;
    if (checkIn && checkOut) {
      const s = new Date(checkIn);
      const e = new Date(checkOut);
      s.setHours(0, 0, 0, 0);
      e.setHours(0, 0, 0, 0);

      const diffDays = (e.getTime() - s.getTime()) / MS_PER_DAY;
      const n = diffDays >= 0 ? Math.round(diffDays) : 0;
      nights = Math.max(1, n);
    }

    const raw = Number(ratePlan.pricePerNight);
    const rawRef = ratePlan.referencePricePerNight
      ? Number(ratePlan.referencePricePerNight)
      : null;

    const opts = {
      priceIncludesTax: ratePlan.priceIncludesTax,
      taxPercent: ratePlan.taxPercent,
      serviceFeePercent: ratePlan.serviceFeePercent,
    };

    const perNightIncl = computeDisplayPrice(raw, opts, "INCL_TAX");
    const perNightExcl = computeDisplayPrice(raw, opts, "EXCL_TAX");

    if (perNightIncl == null || perNightExcl == null) return null;

    //  NHÂN THEO SỐ ĐÊM (KHÔNG PHẢI SỐ NGÀY)
    const roomPrice = perNightExcl * nights;
    const taxAndFee = (perNightIncl - perNightExcl) * nights;
    const finalTotal = perNightIncl * nights;

    const refIncl = rawRef
      ? computeDisplayPrice(rawRef, opts, "INCL_TAX")
      : null;

    const originalTotal = refIncl ? refIncl * nights : finalTotal;

    return { roomPrice, taxAndFee, finalTotal, originalTotal };
  }, [ratePlan, checkIn, checkOut]);

  const pricingAllRooms = useMemo(() => {
    if (!pricingPerRoom) return null;
    return {
      roomPrice: pricingPerRoom.roomPrice * roomsCount,
      taxAndFee: pricingPerRoom.taxAndFee * roomsCount,
      finalTotal: pricingPerRoom.finalTotal * roomsCount,
      originalTotal: pricingPerRoom.originalTotal * roomsCount,
    };
  }, [pricingPerRoom, roomsCount]);

  return { pricingPerRoom, pricingAllRooms };
}