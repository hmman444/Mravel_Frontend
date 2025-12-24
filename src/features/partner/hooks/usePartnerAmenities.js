import { useEffect, useMemo, useState } from "react";
import { fetchGroupedAmenitiesForPartner } from "../services/partnerAmenityService";

export function usePartnerAmenities(scope) {
  const [grouped, setGrouped] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGroupedAmenitiesForPartner(scope);
        if (!alive) return;
        setGrouped(data);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || "Không tải được tiện ích");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [scope]);

  const flat = useMemo(() => {
    if (!grouped) return [];

    // Nếu BE trả thẳng list (không grouped)
    if (Array.isArray(grouped)) return grouped;

    // Đúng format AmenityGroupedResponse
    const list = (grouped.groups || []).flatMap((g) =>
        (g.sections || []).flatMap((s) => s.items || [])
    );

    // unique by code (vì ItemNode không có id)
    const seen = new Set();
    return list.filter((x) => {
        const k = x?.code;
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
    });
    }, [grouped]);

  return { grouped, flat, loading, error };
}