// src/features/partner/components/PartnerHeader.jsx
import { useEffect, useRef, useState } from "react";
import { BellIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import DarkModeToggle from "../../../components/DarkModeToggle";
import LanguageDropdown from "../../../components/LanguageDropdown";
import { useLogout } from "../../partnerAuth/hooks/useLogout";
import { fetchCurrentPartner } from "../../partnerAuth/slices/partnerAuthSlice";

const FALLBACK_AVATAR =
  "https://res.cloudinary.com/dqp7k8d4r/image/upload/v1757608869/avatars/y1kuegnpvey9ukpcv5iu.jpg";

export default function PartnerHeader() {
  const dispatch = useDispatch();

  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { accessToken, partner } = useSelector((state) => state.partnerAuth);
  const { handleLogout } = useLogout();

  // ✅ tự fetch me nếu có token nhưng chưa có partner trong store
  useEffect(() => {
    if (accessToken && !partner) dispatch(fetchCurrentPartner());
  }, [accessToken, partner, dispatch]);

  // scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // click outside -> close dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    const onDocMouseDown = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [dropdownOpen]);

  const p = partner || {};
  const partnerName = p.fullname || p.name || p.displayName || p.username || "Đối tác";
  const partnerEmail = p.email || "";
  const partnerAvatar = p.avatar || p.avatarUrl || p.photoUrl || p.imageUrl || FALLBACK_AVATAR;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10 shadow-md"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/partner/dashboard"
          className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"
        >
          <img
            src="/src/assets/Mravel-logo.png"
            alt="Mravel Logo"
            className="h-8 w-8 object-contain"
          />
          Mravel Partner
        </Link>

        {/* Right */}
        <div className="flex items-center gap-4 relative">
          {/* Notification */}
          <button
            type="button"
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Thông báo"
          >
            <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Partner menu */}
          {accessToken ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
              >
                <img
                  src={partnerAvatar}
                  alt="Partner Avatar"
                  className="w-9 h-9 rounded-full border object-cover"
                />
                <span className="font-medium text-gray-900 dark:text-gray-200 hidden md:block">
                  {partnerName}
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen ? (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold line-clamp-1">{partnerName}</p>
                    {partnerEmail ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {partnerEmail}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              to="/partner"
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-gray-800 transition"
            >
              Đăng nhập đối tác
            </Link>
          )}

          <DarkModeToggle />
          <LanguageDropdown />
        </div>
      </div>
    </header>
  );
}