"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader2, Users } from "lucide-react";
import { acceptInvite } from "../services/planBoardService";
import { showSuccess, showError } from "../../../utils/toastUtils";

export default function JoinPlanPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error

  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    const join = async () => {
      if (!token) {
        setStatus("error");
        showError(t("plan.join.invalid_token"));
        return;
      }

      // Chưa đăng nhập → redirect login
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        navigate({
          pathname: "/login",
          search: `?redirect=${encodeURIComponent(
            location.pathname + location.search
          )}`,
        });
        return;
      }

      try {
        const res = await acceptInvite(token);
        const planId = res?.planId;
        if (!planId) throw new Error("Missing planId");

        setStatus("success");
        showSuccess(t("plan.join.success"));

        setTimeout(() => navigate(`/plans/${planId}`), 1500);
      } catch (err) {
        console.error("Join failed", err);
        setStatus("error");
        showError(t("plan.join.invalid_invite"));
      }
    };

    join();
  }, [token, navigate, location.pathname, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center">
        {/* ICON */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
          <Users className="h-7 w-7 text-sky-600 dark:text-sky-400" />
        </div>

        {/* CONTENT */}
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-sky-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("plan.join.loading_title")}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("plan.join.loading_desc")}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto mb-4 h-8 w-8 text-emerald-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("plan.join.success_title")}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("plan.join.redirecting")}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-4 h-8 w-8 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("plan.join.error_title")}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("plan.join.error_desc")}
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition"
            >
              {t("plan.join.back_home")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
