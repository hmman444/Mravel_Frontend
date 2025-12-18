import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { useDispatch } from "react-redux";
import { partnerSocialLoginUser } from "../slices/partnerAuthSlice";
import { useLocation, useNavigate } from "react-router-dom";

export default function SocialLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const redirectParam = new URLSearchParams(location.search).get("redirect");

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const idToken = tokenResponse.access_token || tokenResponse.credential;

        const action = await dispatch(
          partnerSocialLoginUser({
            provider: "google",
            token: idToken,
            rememberMe: true,
          })
        );

        if (partnerSocialLoginUser.fulfilled.match(action)) {
          if (redirectParam) {
            navigate(decodeURIComponent(redirectParam));
          } else {
            navigate("/partner");
          }
        }
      } catch (err) {
        console.error("Google login error:", err);
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => console.error("Google Login Failed:", err),
    flow: "implicit",
  });

  const handleFacebookSuccess = async (response) => {
    try {
      setLoading(true);
      const fbToken = response.accessToken;
      if (!fbToken) {
        console.error("Facebook login failed: missing accessToken");
        return;
      }

      const action = await dispatch(
        partnerSocialLoginUser({
          provider: "facebook",
          token: fbToken,
          rememberMe: true,
        })
      );

      if (partnerSocialLoginUser.fulfilled.match(action)) {
        if (redirectParam) {
          navigate(decodeURIComponent(redirectParam));
        } else {
          navigate("/partner");
        }
      }
    } catch (err) {
      console.error("Facebook login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center mt-6">
        <hr className="flex-grow border-gray-200" />
        <span className="mx-4 text-xs text-gray-400">Hoặc đăng nhập bằng</span>
        <hr className="flex-grow border-gray-200" />
      </div>

      <div className="flex gap-4 mt-4 justify-center">
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          disabled={loading}
          className="flex items-center border rounded-full px-4 py-2 gap-3 hover:bg-gray-50 disabled:opacity-60 transition-colors"
        >
          <FcGoogle className="text-xl" />
          <span className="w-px h-5 bg-gray-200"></span>
          <span className="text-sm font-medium text-gray-700">Google</span>
        </button>

        <FacebookLogin
          appId={import.meta.env.VITE_FACEBOOK_APP_ID}
          fields="name,email,picture"
          scope="public_profile,email"
          onSuccess={handleFacebookSuccess}
          onFail={(err) => console.error("Facebook Login Failed:", err)}
          render={({ onClick }) => (
            <button
              type="button"
              onClick={onClick}
              disabled={loading}
              className="flex items-center border rounded-full px-4 py-2 gap-3 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              <FaFacebook className="text-blue-600 text-xl" />
              <span className="w-px h-5 bg-gray-200"></span>
              <span className="text-sm font-medium text-gray-700">Facebook</span>
            </button>
          )}
        />
      </div>
    </>
  );
}