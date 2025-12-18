// src/features/planBoard/services/planGeneralService.js
import api from "../../../utils/axiosInstance";

const BASE = "/plans";

/** UPDATE TITLE */
export const apiUpdateTitle = (planId, title) =>
  api.patch(`${BASE}/${planId}/title`, { title })
     .then(res => res.data.data);

/** UPDATE DESCRIPTION */
export const apiUpdateDescription = (planId, description) =>
  api.patch(`${BASE}/${planId}/description`, { description })
     .then(res => res.data.data);

/** UPDATE DATES */
export const apiUpdateDates = (planId, startDate, endDate) =>
  api.patch(`${BASE}/${planId}/dates`, { startDate, endDate })
     .then(res => res.data.data);

/** UPDATE STATUS */
export const apiUpdateStatus = (planId, status) =>
  api.patch(`${BASE}/${planId}/status`, { status })
     .then(res => res.data.data);

/** UPDATE THUMBNAIL */
export const apiUpdateThumbnail = (planId, url) =>
  api.patch(`${BASE}/${planId}/thumbnail`, { url })
     .then(res => res.data.data);

/** ADD IMAGE */
export const apiAddImage = (planId, url) =>
  api.post(`${BASE}/${planId}/images`, { url })
     .then(res => res.data.data);

/** REMOVE IMAGE BY URL */
export const apiRemoveImage = (planId, url) =>
  api.delete(`${BASE}/${planId}/images`, { data: { url } })
     .then(res => res.data.data);



export const apiUpdateBudget = (planId, payload) =>
  api
    .put(`${BASE}/${planId}/budget`, payload)
    .then((res) => res.data.data); 