import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export default function SocialLogin() {
  return (
    <>
      <div className="flex items-center mt-6">
        <hr className="flex-grow border-gray-200" />
        <span className="mx-4 text-xs text-gray-400">Hoặc đăng nhập bằng</span>
        <hr className="flex-grow border-gray-200" />
      </div>

      <div className="flex gap-4 mt-4 justify-center">
        <button className="flex items-center border rounded-full px-4 py-2 gap-3 hover:bg-gray-50">
          <FcGoogle className="text-xl" />
          <span className="w-px h-5 bg-gray-200"></span>
          <span className="text-sm font-medium text-gray-700">Google</span>
        </button>

        <button className="flex items-center border rounded-full px-4 py-2 gap-3 hover:bg-gray-50">
          <FaFacebook className="text-blue-600 text-xl" />
          <span className="w-px h-5 bg-gray-200"></span>
          <span className="text-sm font-medium text-gray-700">Facebook</span>
        </button>
      </div>
    </>
  );
}
