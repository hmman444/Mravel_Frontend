// src/features/user/hooks/usePersonalProfileForm.js
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "../slices/userProfileSlice";

export const usePersonalProfileForm = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { saving, error, success } = useSelector((state) => state.userProfile);

  const [form, setForm] = useState({
    fullname: "",
    gender: "",
    day: "",
    month: "",
    year: "",
    city: "",
    country: "",
    addressLine: "",
  });

  // Đồng bộ form khi user thay đổi / được load
  useEffect(() => {
    if (user) {
      let day = "";
      let month = "";
      let year = "";

      if (user.dateOfBirth) {
        // dateOfBirth dạng "yyyy-MM-dd"
        const [y, m, d] = user.dateOfBirth.split("-");
        year = y || "";
        month = m || "";
        day = d || "";
      }

      setForm((prev) => ({
        ...prev,
        fullname: user.fullname || "",
        gender: user.gender || "", // MALE / FEMALE / OTHER / UNKNOWN
        city: user.city || "",
        country: user.country || "",
        addressLine: user.addressLine || "",
        day,
        month,
        year,
      }));
    }
  }, [user]);

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const payload = {};

    if (form.fullname.trim()) payload.fullname = form.fullname.trim();
    if (form.gender) payload.gender = form.gender;

    if (form.city.trim()) payload.city = form.city.trim();
    if (form.country.trim()) payload.country = form.country.trim();
    if (form.addressLine.trim()) payload.addressLine = form.addressLine.trim();

    if (form.day && form.month && form.year) {
      const day = String(form.day).padStart(2, "0");
      const month = String(form.month).padStart(2, "0");
      payload.dateOfBirth = `${form.year}-${month}-${day}`; // yyyy-MM-dd
    }

    if (Object.keys(payload).length === 0) {
      // Không có gì để update
      return;
    }

    await dispatch(updateUserProfile(payload));
  };

  return {
    form,
    setField,
    handleSave,
    saving,
    error,
    success,
    user,
  };
};