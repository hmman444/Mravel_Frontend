// useNotifications.js
import { useCallback, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadNotifications,
  loadMoreNotifications,
  markReadThunk,
  markAllReadThunk,
  setDropdownOpen,
  toggleDropdown,
  receiveNotificationEvent,
  resetNotifications,
} from "../slices/notificationSlice";

export function useNotifications() {
  const dispatch = useDispatch();
  const n = useSelector((s) => s.notifications);
  const userId = useSelector((s) => s.auth.user?.id);

  const recipientParams = useMemo(
    () => (userId ? { recipientId: userId } : {}),
    [userId]
  );

  const loadedOnceRef = useRef(false);

  useEffect(() => {
    if (!userId) return;

    // reset khi user đổi
    loadedOnceRef.current = false;
    dispatch(resetNotifications());

    // load lần đầu
    dispatch(
      loadNotifications({
        page: 1,
        size: n.size,
        recipientId: userId,
      })
    );

    loadedOnceRef.current = true;
  }, [userId, dispatch, n.size]);


  const open = useCallback(() => dispatch(setDropdownOpen(true)), [dispatch]);
  const close = useCallback(() => dispatch(setDropdownOpen(false)), [dispatch]);
  const toggle = useCallback(() => dispatch(toggleDropdown()), [dispatch]);

  const load = useCallback(
    (opts = {}) =>
      dispatch(
        loadNotifications({
          page: 1,
          size: n.size,
          ...recipientParams,
          ...opts,
        })
      ).unwrap(),
    [dispatch, n.size, recipientParams]
  );

  const loadMore = useCallback(
    (opts = {}) =>
      dispatch(
        loadMoreNotifications({
          page: n.page + 1,
          size: n.size,
          ...recipientParams,
          ...opts,
        })
      ).unwrap(),
    [dispatch, n.page, n.size, recipientParams]
  );

  const markRead = useCallback(
    (id) => dispatch(markReadThunk({ id, params: recipientParams })).unwrap(),
    [dispatch, recipientParams]
  );

  const markAllRead = useCallback(
    () => dispatch(markAllReadThunk(recipientParams)).unwrap(),
    [dispatch, recipientParams]
  );

  const receiveRealtime = useCallback(
    (event) => dispatch(receiveNotificationEvent(event)),
    [dispatch]
  );

  return {
    ...n,
    open,
    close,
    toggle,
    load,
    loadMore,
    markRead,
    markAllRead,
    receiveRealtime,
  };
}
