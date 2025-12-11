import { useDispatch, useSelector } from "react-redux";
import { loadMyPlans, reactPlan, commentPlan } from "../../planFeed/slices/planSlice";

export function useMyPlans() {
  const dispatch = useDispatch();
  const { myItems, myLoading, myHasMore, myPage } = useSelector((s) => s.plan);

  const fetchNext = () => dispatch(loadMyPlans({ page: myPage + 1 }));
  const reload = () => dispatch(loadMyPlans({ page: 1 }));

  const sendReact = (planId, type) => dispatch(reactPlan({ planId, type }));
  const sendComment = (planId, comment) => dispatch(commentPlan({ planId, comment }));

  return {
    items: myItems,
    loading: myLoading,
    hasMore: myHasMore,
    fetchNext,
    reload,
    sendReact,
    sendComment
  };
}
