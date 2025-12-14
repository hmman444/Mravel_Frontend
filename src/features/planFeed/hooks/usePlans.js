import { useDispatch, useSelector } from "react-redux";
import { loadPlans, reactPlan, commentPlan, searchAll, clearSearch } from "../slices/planSlice";

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
  } = useSelector((s) => s.plan);

  const fetchNext = () => dispatch(loadPlans({ page: page + 1 }));
  const reload = () => dispatch(loadPlans({ page: 1 }));

  const sendReact = (planId, type) => dispatch(reactPlan({ planId, type }));
  const sendComment = (planId, comment) => dispatch(commentPlan({ planId, comment }));

  const doSearch = (q) => dispatch(searchAll({ q, page: 1, size: 10 }));
  const resetSearch = () => dispatch(clearSearch());
  const isSearching = !!searchQuery;

  return {
    items,
    loading,
    hasMore,
    page,
    fetchNext,
    reload,
    sendReact,
    sendComment,

    isSearching,
    searchQuery,
    searchLoading,
    searchPlans,
    searchUsers,
    searchMeta,
    doSearch,
    resetSearch,
  };
}
