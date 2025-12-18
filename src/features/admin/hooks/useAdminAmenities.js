import { useDispatch, useSelector } from "react-redux";
import {
  loadAmenities,
  loadGroupedAmenities,
  createAmenityThunk,
  updateAmenityThunk,
  deleteAmenityThunk,
  clearGrouped,
} from "../slices/adminAmenitySlice";

export function useAdminAmenities() {
  const dispatch = useDispatch();
  const { items, grouped, loading, saving, deleting, error } = useSelector((s) => s.adminAmenity);

  return {
    items,
    grouped,
    loading,
    saving,
    deleting,
    error,

    load: (params) => dispatch(loadAmenities(params)).unwrap(),
    loadGrouped: (scope) => dispatch(loadGroupedAmenities(scope)).unwrap(),
    clearGrouped: () => dispatch(clearGrouped()),

    create: (payload) => dispatch(createAmenityThunk(payload)).unwrap(),
    update: (id, payload) => dispatch(updateAmenityThunk({ id, payload })).unwrap(),
    remove: (id) => dispatch(deleteAmenityThunk(id)).unwrap(),
  };
}
