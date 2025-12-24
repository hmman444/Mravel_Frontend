"use client";

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  loadPartners,
  lockPartnerThunk,
  unlockPartnerThunk,
} from "../slices/adminPartnerSlice";

export function useAdminPartners() {
  const dispatch = useDispatch();

  // Đổi key slice cho đúng với store của bạn:
  // ví dụ: state.adminPartners hoặc state.adminPartner
  const slice = useSelector((s) => s.adminPartners);

  // tránh destructure khi slice chưa mount
  const items = slice?.items ?? [];
  const loading = slice?.loading ?? false;
  const toggling = slice?.toggling ?? false;
  const error = slice?.error ?? null;

  // optional state (nếu slice có)
  const q = slice?.q ?? "";
  const page = slice?.page ?? 0;
  const size = slice?.size ?? 20;

  const load = useCallback(
    async ({ role = "PARTNER", q: q2 = q, page: p2 = page, size: s2 = size } = {}) => {
      return dispatch(loadPartners({ role, q: q2, page: p2, size: s2 })).unwrap();
    },
    [dispatch, q, page, size]
  );

  const lock = useCallback(
    async (id) => dispatch(lockPartnerThunk(id)).unwrap(),
    [dispatch]
  );

  const unlock = useCallback(
    async (id) => dispatch(unlockPartnerThunk(id)).unwrap(),
    [dispatch]
  );

  // nếu bạn muốn auto-load theo q/page/size trong slice:
  // useEffect(() => { load({ role: "PARTNER" }); }, [load]);

  return { items, loading, toggling, error, q, page, size, load, lock, unlock };
}
