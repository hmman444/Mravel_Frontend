import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { uploadAvatarOrCover } from "../services/userProfileService";
import { updateProfileThunk } from "../slices/profileSlice";
import { showError, showSuccess } from "../../../utils/toastUtils";

export function useEditProfile() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      const url = await uploadAvatarOrCover(file);
      return url;
    } catch {
      showError(t("user.upload_image_failed"));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async (payload, onDone) => {
    try {
      await dispatch(updateProfileThunk(payload)).unwrap();
      showSuccess(t("user.update_profile_success"));
      onDone?.();
    } catch (err) {
      showError(err || t("user.update_profile_failed"));
    }
  };

  return { uploadImage, saveProfile, uploading };
}
