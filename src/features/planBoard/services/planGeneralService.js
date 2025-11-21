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

/** CLOUDINARY UPLOAD */
export const uploadToCloudinary = async (file) => {
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");

  return data.secure_url;
};
