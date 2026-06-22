import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { socialLoginUser } from "../slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { showError } from "../../../utils/toastUtils";

export default function SocialLogin() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const redirectParam = new URLSearchParams(location.search).get("redirect");

  const goAfterLogin = (role) => {
    if (redirectParam) {
      navigate(decodeURIComponent(redirectParam));
      return;
    }
    navigate(role === "ADMIN" ? "/admin" : "/");
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);

        const googleToken = tokenResponse?.access_token;
        if (!googleToken) {
          showError(t("common.error_occurred"));
          return;
        }

        const action = await dispatch(
          socialLoginUser({
            provider: "google",
            token: googleToken,
            rememberMe: true,
          })
        );

        if (socialLoginUser.fulfilled.match(action)) {
          goAfterLogin(action.payload.role);
        } else {
          showError(action.payload || t("common.error_occurred"));
        }
      } catch (e) {
        const msg = typeof e === "string" ? e : (e?.message || e?.error);
        showError(msg || t("common.error_occurred"));
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error("Google login error:", err);
      showError(t("common.error_occurred"));
    },
    flow: "implicit",
  });

  return (
    <>
      <div className="flex items-center mt-6">
        <hr className="flex-grow border-gray-200 dark:border-gray-700" />
        <span className="mx-4 text-xs text-gray-400">{t('auth.social_login_divider')}</span>
        <hr className="flex-grow border-gray-200 dark:border-gray-700" />
      </div>

      <div className="flex gap-4 mt-4 justify-center">
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          disabled={loading}
          className="flex items-center border rounded-full px-4 py-2 gap-3 hover:bg-gray-50 disabled:opacity-60 transition-colors"
        >
          <FcGoogle className="text-xl" />
          <span className="w-px h-5 bg-gray-200 dark:bg-gray-700"></span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
        </button>
      </div>
    </>
  );
}
