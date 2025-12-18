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