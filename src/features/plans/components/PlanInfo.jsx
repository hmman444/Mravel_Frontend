import { useState } from "react";
import { FaLock, FaGlobe, FaUserFriends, FaTimes } from "react-icons/fa";
import DatePicker from "react-datepicker";

export default function PlanInfo({
  plan,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  visibility,
  setVisibility,
  inviteList,
  setInviteList,
  images,
  setImages,
  description,
  setDescription,
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMode, setInviteMode] = useState("view");

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setImages([...images, ...urls]);
  };

  const removeImage = (url) => {
    setImages(images.filter((img) => img !== url));
  };

  const addInvite = () => {
    if (!inviteEmail) return;
    setInviteList([...inviteList, { email: inviteEmail, mode: inviteMode }]);
    setInviteEmail("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 w-full md:w-3/5">
      <input
        defaultValue={plan?.title || "Tên lịch trình"}
        className="text-2xl font-bold text-primary mb-2 w-full bg-transparent outline-none"
      />

      {/* Mô tả */}
      <div className="mb-3 text-gray-600 dark:text-gray-300">
        <textarea
          value={description || ""}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn gọn..."
          className="w-full bg-transparent outline-none text-gray-600 dark:text-gray-300 mb-2 border rounded p-2 resize-y overflow-y-auto"
          rows={4}
        />
      </div>

      {/* Ngày & Quyền truy cập */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
        <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
          Đi từ ngày:
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            dateFormat="dd/MM/yyyy"
            className="ml-2 outline-none bg-transparent text-gray-800 dark:text-gray-200"
          />
        </div>
        <div className="flex items-center border rounded-lg px-3 py-2 dark:border-gray-700">
          Đến ngày:
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            minDate={startDate}
            dateFormat="dd/MM/yyyy"
            className="ml-2 outline-none bg-transparent text-gray-800 dark:text-gray-200"
          />
        </div>
        <span className="flex items-center gap-1">
          {visibility === "private" ? (
            <FaLock />
          ) : visibility === "shared" ? (
            <FaUserFriends />
          ) : (
            <FaGlobe />
          )}
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="bg-transparent outline-none"
          >
            <option value="public">Công khai</option>
            <option value="private">Chỉ mình tôi</option>
            <option value="shared">Chia sẻ</option>
          </select>
        </span>
      </div>

      {/* Invite */}
      {visibility === "shared" && (
        <div className="mb-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Nhập Gmail..."
              className="border rounded px-2 py-1 flex-1"
            />
            <select
              value={inviteMode}
              onChange={(e) => setInviteMode(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="view">Chỉ xem</option>
              <option value="edit">Chỉnh sửa</option>
            </select>
            <button
              onClick={addInvite}
              className="px-3 py-1 bg-primary text-white rounded"
            >
              Mời
            </button>
          </div>
          <ul className="mt-2 text-sm">
            {inviteList.map((i, idx) => (
              <li key={idx}>
                {i.email} - {i.mode}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ảnh / video */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-3">
        {images.map((url, i) => (
          <div key={i} className="relative">
            <img src={url} className="rounded-lg object-cover h-28 w-full" />
            <button
              onClick={() => removeImage(url)}
              className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
      <label className="px-3 py-1 border rounded-lg text-sm cursor-pointer">
        + Thêm ảnh / video
        <input type="file" multiple hidden onChange={handleImageUpload} />
      </label>
    </div>
  );
}
