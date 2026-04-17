import { useDispatch, useSelector } from "react-redux";
import {
  loadPlans,
  reactPlan,
  commentPlan,
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
    searchPlans,
    searchUsers,
    searchMeta,

    activeFilters,
    filterSidebarOpen,

    current,
    currentLoading,
    currentError,
  } = useSelector((s) => s.plan);

  const fetchNext = () => dispatch(loadPlans({ page: page + 1 }));
  const reload    = () => dispatch(loadPlans({ page: 1 }));

  const sendReact   = (planId, type)    => dispatch(reactPlan({ planId, type }));
  const sendComment = (planId, comment) => dispatch(commentPlan({ planId, comment }));

  //  Search 
  /** Fresh search — always resets to first page (cursor: null). */
  const doSearch = (q, filters) =>
    dispatch(searchAll({ q, filters: filters ?? activeFilters, cursor: null, size: 10 }));

  /** Load the next page of search results using the stored cursor. */
  const loadMoreSearch = () => {
    if (!searchMeta.hasMore || !searchMeta.nextCursor) return;
    dispatch(searchAll({
      q: searchQuery,
      filters: activeFilters,
      cursor: searchMeta.nextCursor,
      size: 10,
    }));
  };

  const resetSearch = () => dispatch(clearSearch());

  const isSearching = !!searchQuery;

  const loadFeedDetail = (id) => dispatch(loadPlanFeedDetail({ id }));

  //  Filters ─
  const updateFilters = (newFilters) => dispatch(setActiveFilters(newFilters));
  const clearFilters  = () => dispatch(resetFilters());

  const openFilterSidebar  = () => dispatch(setFilterSidebarOpen(true));
  const closeFilterSidebar = () => dispatch(setFilterSidebarOpen(false));

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
