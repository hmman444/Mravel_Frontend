import { useState } from "react";
import { useDispatch } from "react-redux";
import { uploadAvatarOrCover, updateMyPublicProfile } from "../services/userProfileService";
import { updatePublicProfileThunk } from "../slices/profileSlice";
import { showError, showSuccess } from "../../../utils/toastUtils";

export function useEditPublicProfile() {
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      const url = await uploadAvatarOrCover(file);
      return url;
    } catch (err) {
      showError("Không thể upload ảnh.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async (payload, onDone) => {
    try {
      const res = await dispatch(updatePublicProfileThunk(payload)).unwrap();
      showSuccess("Đã cập nhật hồ sơ công khai.");
      if (onDone) onDone();
    } catch (err) {
      showError(err || "Không thể cập nhật hồ sơ.");
    }
  };

  return { uploadImage, saveProfile, uploading };
}
