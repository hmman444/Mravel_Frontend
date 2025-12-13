// src/realtime/useMainSocket.js
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { mainSocket } from "./mainSocket";

export function useMainSocket() {
  // tuỳ em: chỉnh lấy accessToken / isAuthenticated cho đúng
  const accessToken = useSelector((s) => s.auth?.accessToken);
  const isAuthenticated = useSelector((s) => !!s.auth?.accessToken);

  useEffect(() => {
    if (isAuthenticated) {
      mainSocket.connect(accessToken);
    } else {
      mainSocket.disconnect();
    }

    // cleanup khi unmount toàn app (hiếm)
    return () => {
      mainSocket.disconnect();
    };
  }, [isAuthenticated, accessToken]);
}
