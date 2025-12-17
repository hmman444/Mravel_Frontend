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
  const {
    items,
    grouped,
    loading,
    saving,
    deleting,
    error,
  } = useSelector((s) => s.adminAmenity);

  return {
    items,
    grouped,
    loading,
    saving,
    deleting,
    error,

    load: (params) => dispatch(loadAmenities(params)),
    loadGrouped: (scope) => dispatch(loadGroupedAmenities(scope)),
    clearGrouped: () => dispatch(clearGrouped()),

    create: (payload) => dispatch(createAmenityThunk(payload)),
    update: (id, payload) =>
      dispatch(updateAmenityThunk({ id, payload })),
    remove: (id) => dispatch(deleteAmenityThunk(id)),
  };
}
