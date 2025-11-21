// src/features/planBoard/hooks/usePlanGeneral.js
import { useDispatch, useSelector } from "react-redux";
import {
  updatePlanTitle,
  updatePlanDescription,
  updatePlanDates,
  updatePlanStatus,
  updatePlanThumbnail,
  addPlanImage,
  removePlanImage,
} from "../slices/planGeneralSlice";

export const usePlanGeneral = () => {
  const dispatch = useDispatch();
  const { saving, error } = useSelector((s) => s.planGeneral);

  return {
    saving,
    error,
    updateTitle: (planId, title) =>
      dispatch(updatePlanTitle({ planId, title })),

    updateDescription: (planId, description) =>
      dispatch(updatePlanDescription({ planId, description })),

    updateDates: (planId, startDate, endDate) =>
      dispatch(updatePlanDates({ planId, startDate, endDate })),

    updateStatus: (planId, status) =>
      dispatch(updatePlanStatus({ planId, status })),

    uploadThumbnail: (planId, file) =>
      dispatch(updatePlanThumbnail({ planId, file })),

    addImage: (planId, file) =>
      dispatch(addPlanImage({ planId, file })),

    removeImage: (planId, url) =>
      dispatch(removePlanImage({ planId, url })),
  };
};
