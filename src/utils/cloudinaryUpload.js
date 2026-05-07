async function uploadToCloudinaryWithType(file, resourceType) {
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!preset || !cloudName) {
    throw new Error("Missing Cloudinary env: VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed: missing secure_url");

  return data.secure_url;
}

export const uploadToCloudinary = (file) => uploadToCloudinaryWithType(file, "image");

export const uploadVideoToCloudinary = (file) => uploadToCloudinaryWithType(file, "video");