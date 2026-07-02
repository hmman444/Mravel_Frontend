import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadPlans,
  reactPlan,
  commentPlan,
  reactComment,
  searchAll,
  clearSearch,
  loadPlanFeedDetail,
  setActiveFilters,
  resetFilters,
  setFilterSidebarOpen,
} from "../slices/planSlice";

export function usePlans() {
  const dispatch = useDispatch();
  const {
    items,
    loading,
    hasMore,
    page,

    searchQuery,
    searchLoading,
    searchActive,
    searchPlans,
    searchUsers,
    searchMeta,

    activeFilters,
    filterSidebarOpen,

    current,
    currentLoading,
    currentError,
  } = useSelector((s) => s.plan);

  // Các callback dưới đây được memo-hoá (useCallback) để tham chiếu ổn định, tránh làm
  // effect ở PlanListPage (URL-sync) chạy lại mỗi lần render gây race khi bắt đầu tìm kiếm.
  const fetchNext = useCallback(() => dispatch(loadPlans({ page: page + 1 })), [dispatch, page]);
  const reload    = useCallback(() => dispatch(loadPlans({ page: 1 })), [dispatch]);

  const sendReact         = useCallback((planId, type)            => dispatch(reactPlan({ planId, type })), [dispatch]);
  const sendComment       = useCallback((planId, comment)         => dispatch(commentPlan({ planId, comment })), [dispatch]);
  const sendCommentReact  = useCallback((planId, commentId, type) => dispatch(reactComment({ planId, commentId, type })), [dispatch]);

  //  Search
  /** Fresh search — always resets to first page (cursor: null). */
  const doSearch = useCallback(
    (q, filters) => dispatch(searchAll({ q, filters: filters ?? activeFilters, cursor: null, size: 10 })),
    [dispatch, activeFilters]
  );

  /** Load the next page of search results using the stored cursor. */
  const loadMoreSearch = useCallback(() => {
    if (!searchMeta.hasMore || !searchMeta.nextCursor) return;
    dispatch(searchAll({
      q: searchQuery,
      filters: activeFilters,
      cursor: searchMeta.nextCursor,
      size: 10,
    }));
  }, [dispatch, searchMeta.hasMore, searchMeta.nextCursor, searchQuery, activeFilters]);

  const resetSearch = useCallback(() => dispatch(clearSearch()), [dispatch]);

  // "Searching" mode is driven by an explicit flag, not the keyword text, so a
  // filter-only search (empty keyword + active filters) still shows results.
  const isSearching = searchActive;

  const loadFeedDetail = useCallback((id) => dispatch(loadPlanFeedDetail({ id })), [dispatch]);

  //  Filters ─
  const updateFilters = useCallback((newFilters) => dispatch(setActiveFilters(newFilters)), [dispatch]);
  const clearFilters  = useCallback(() => dispatch(resetFilters()), [dispatch]);

  const openFilterSidebar  = useCallback(() => dispatch(setFilterSidebarOpen(true)), [dispatch]);
  const closeFilterSidebar = useCallback(() => dispatch(setFilterSidebarOpen(false)), [dispatch]);

  /** Count of active (non-default) filter fields */
  const activeFilterCount = (() => {
    let count = 0;
    if (activeFilters.budgetMin || activeFilters.budgetMax) count++;
    if (activeFilters.daysMin   || activeFilters.daysMax)   count++;
    if (activeFilters.startDateFrom || activeFilters.startDateTo) count++;
    if (activeFilters.destinations?.length > 0) count++;
    if (activeFilters.sortBy && activeFilters.sortBy !== "RELEVANCE") count++;
    return count;
  })();

  return {
    // Feed
    items,
    loading,
    hasMore,
    page,
    fetchNext,
    reload,

    // Reactions / comments
    sendReact,
    sendComment,
    sendCommentReact,

    // Search
    isSearching,
    searchQuery,
    searchLoading,
    searchPlans,
    searchUsers,
    searchMeta,
    doSearch,
    loadMoreSearch,
    resetSearch,

    // Detail
    loadFeedDetail,
    current,
    currentLoading,
    currentError,

    // Filters
    activeFilters,
    activeFilterCount,
    filterSidebarOpen,
    updateFilters,
    clearFilters,
    openFilterSidebar,
    closeFilterSidebar,
  };
}
