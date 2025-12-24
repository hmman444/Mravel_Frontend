// src/features/partner/hooks/useVnAdminDivisions.js
import { useEffect, useState } from "react";
import { fetchDistricts, fetchProvinces, fetchWards } from "../services/vnAdminApi";

export function useVnAdminDivisions(provinceCode, districtCode) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({ p: false, d: false, w: false });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading((x) => ({ ...x, p: true }));
        const data = await fetchProvinces();
        if (alive) setProvinces(data);
      } finally {
        if (alive) setLoading((x) => ({ ...x, p: false }));
      }
    })();
    return () => (alive = false);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading((x) => ({ ...x, d: true }));
        const data = await fetchDistricts(provinceCode);
        if (alive) setDistricts(data);
      } finally {
        if (alive) setLoading((x) => ({ ...x, d: false }));
      }
    })();
    return () => (alive = false);
  }, [provinceCode]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading((x) => ({ ...x, w: true }));
        const data = await fetchWards(districtCode);
        if (alive) setWards(data);
      } finally {
        if (alive) setLoading((x) => ({ ...x, w: false }));
      }
    })();
    return () => (alive = false);
  }, [districtCode]);

  return { provinces, districts, wards, loading };
}