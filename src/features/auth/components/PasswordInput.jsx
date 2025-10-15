import { useState } from "react";
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function PasswordInput({ label = "Mật khẩu", icon: Icon = LockClosedIcon, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="relative mt-1">
        <Icon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />

        <input
          {...props}
          type={show ? "text" : "password"}
          className="block w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>
    </label>
  );
}
