// src/features/admin/hooks/useAdminUsers.js
import { useDispatch, useSelector } from "react-redux";
import { loadAdminUsers, lockUserThunk, unlockUserThunk } from "../slices/adminUserSlice";

export function useAdminUsers() {
  const dispatch = useDispatch();
  const { items, loading, toggling, error } = useSelector((s) => s.adminUser);

  return {
    items,
    loading,
    toggling,
    error,
    load: (params) => dispatch(loadAdminUsers(params)).unwrap(),
    lock: (id) => dispatch(lockUserThunk(id)).unwrap(),
    unlock: (id) => dispatch(unlockUserThunk(id)).unwrap(),
  };
}
