import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { partnerSocialLoginUser } from "../slices/partnerAuthSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { showError } from "../../../utils/toastUtils";

export default function SocialLogin() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const redirectParam = new URLSearchParams(location.search).get("redirect");

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const googleToken = tokenResponse?.access_token;
        if (!googleToken) {
          showError(t("partnerAuth.social.login_failed"));
          return;
        }

        const action = await dispatch(
          partnerSocialLoginUser({
            provider: "google",
            token: googleToken,
            rememberMe: true,
          })
        );

        if (partnerSocialLoginUser.fulfilled.match(action)) {
          if (redirectParam) {
            navigate(decodeURIComponent(redirectParam));
          } else {
            // Sau khi đăng nhập partner bằng Google phải vào dashboard, KHÔNG về trang
            // landing "Trở thành đối tác" (bug cũ khiến partner tưởng đăng nhập thất bại).
            navigate("/partner/dashboard");
          }
        } else {
          showError(action.payload || t("partnerAuth.social.login_failed"));
        }
      } catch {
        showError(t("partnerAuth.social.login_failed"));
      } finally {
        setLoading(false);
      }
    },
    onError: () => showError(t("partnerAuth.social.login_failed")),
    flow: "implicit",
  });

  return (
    <>
      <div className="flex items-center mt-6">
        <hr className="flex-grow border-gray-200 dark:border-gray-700" />
        <span className="mx-4 text-xs text-gray-400">{t("partnerAuth.social.divider")}</span>
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
