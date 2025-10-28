import { useDispatch, useSelector } from "react-redux";
import { loadPlans, reactPlan, commentPlan } from "../slices/planSlice";

export function usePlans() {
  const dispatch = useDispatch();
  const { items, loading, hasMore, page } = useSelector((s) => s.plan);

  const fetchNext = () => dispatch(loadPlans(page + 1));
  const reload = () => dispatch(loadPlans(1));
  const sendReact = (planId, type, user) => dispatch(reactPlan({ planId, type, user }));
  const sendComment = (planId, comment) => dispatch(commentPlan({ planId, comment }));

  return { items, loading, hasMore, fetchNext, reload, sendReact, sendComment };
}
