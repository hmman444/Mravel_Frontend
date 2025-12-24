import { useDispatch, useSelector } from "react-redux";
import {
  loadAdminServices,
  actOnService,
  setMode,
  loadAdminHotelDetail,
  loadAdminRestaurantDetail, 
  clearSelected,
} from "../slices/adminServiceSlice";

export function useAdminServices() {
  const dispatch = useDispatch();
  const {
    mode,
    items,
    loading,
    selected,
    detailLoading,
    acting,
    error,
    actionError,
    lastQuery,
  } = useSelector((s) => s.adminService);

  return {
    mode,
    items,
    loading,

    selected,
    detailLoading,

    acting,
    error,
    actionError,
    lastQuery,

    setMode: (m) => dispatch(setMode(m)),
    load: ({ mode, params }) => dispatch(loadAdminServices({ mode, params })).unwrap(),
    act: ({ mode, action, id, reason }) => dispatch(actOnService({ mode, action, id, reason })).unwrap(),

    loadHotelDetail: (id) => dispatch(loadAdminHotelDetail(id)).unwrap(),
    loadRestaurantDetail: (id) => dispatch(loadAdminRestaurantDetail(id)).unwrap(), // ✅ NEW
    clearSelected: () => dispatch(clearSelected()),
  };
}
