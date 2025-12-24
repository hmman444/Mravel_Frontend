import { useDispatch, useSelector } from "react-redux";
import { loadAdminServices, actOnService, setMode } from "../slices/adminServiceSlice";

export function useAdminServices() {
  const dispatch = useDispatch();
  const { mode, items, loading, acting, error, actionError, lastQuery } = useSelector((s) => s.adminService);

  return {
    mode,
    items,
    loading,
    acting,
    error,
    actionError,
    lastQuery,

    setMode: (m) => dispatch(setMode(m)),
    load: ({ mode, params }) => dispatch(loadAdminServices({ mode, params })).unwrap(),
    act: ({ mode, action, id, reason }) => dispatch(actOnService({ mode, action, id, reason })).unwrap(),
  };
}
