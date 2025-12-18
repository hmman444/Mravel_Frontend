import { useDispatch, useSelector } from "react-redux";
import {
  loadDestinations,
  loadChildren,
  loadPlaceDetailAdmin,
  updatePlaceThunk,
  deletePlaceThunk,
  clearChildren,
  clearPlaceDetail,
  createPlaceThunk,
  lockPlaceThunk,
  unlockPlaceThunk,
} from "../slices/adminPlaceSlice";

export function useAdminPlaces() {
  const dispatch = useDispatch();
  const { destinations, children, detail } = useSelector((s) => s.adminPlace);

  return {
    destinations,
    children,
    detail,

    create: (payload) => dispatch(createPlaceThunk(payload)).unwrap(),
    loadDestinations: (params) => dispatch(loadDestinations(params)).unwrap(),
    loadChildren: (parentSlug, params) =>
      dispatch(loadChildren({ parentSlug, params })).unwrap(),

    loadDetail: (slug) => dispatch(loadPlaceDetailAdmin(slug)).unwrap(),
    update: (id, payload) => dispatch(updatePlaceThunk({ id, payload })).unwrap(),
    lock: (id) => dispatch(lockPlaceThunk(id)).unwrap(),
    unlock: (id) => dispatch(unlockPlaceThunk(id)).unwrap(),

    remove: (id) => dispatch(deletePlaceThunk(id)).unwrap(),

    clearChildren: () => dispatch(clearChildren()),
    clearDetail: () => dispatch(clearPlaceDetail()),
  };
}
