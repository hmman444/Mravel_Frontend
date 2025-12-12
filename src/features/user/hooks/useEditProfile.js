import { useState } from "react";
import { useDispatch } from "react-redux";
import { uploadAvatarOrCover } from "../services/userProfileService";
import { updateProfileThunk } from "../slices/profileSlice";
import { showError, showSuccess } from "../../../utils/toastUtils";

export function useEditProfile() {
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      const url = await uploadAvatarOrCover(file);
      return url;
    } catch {
      showError("Không thể upload ảnh.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async (payload, onDone) => {
    try {
      await dispatch(updateProfileThunk(payload)).unwrap();
      showSuccess("Đã cập nhật hồ sơ.");
      onDone?.();
    } catch (err) {
      showError(err || "Không thể cập nhật hồ sơ.");
    }
  };

  return { uploadImage, saveProfile, uploading };
}
