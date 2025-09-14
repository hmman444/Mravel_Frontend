import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white pt-4 pb-2">
      <div className="w-full px-6">
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-1">
              <a className="block text-gray-600 hover:text-primary">Shop</a>
              <a className="block text-gray-600 hover:text-primary">Categories</a>
              <a className="block text-gray-600 hover:text-primary">Contact</a>
              <a className="block text-gray-600 hover:text-primary">Blog</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Policies</h4>
            <div className="space-y-1">
              <a className="block text-gray-600 hover:text-primary">Privacy Policy</a>
              <a className="block text-gray-600 hover:text-primary">Terms & Conditions</a>
              <a className="block text-gray-600 hover:text-primary">Returns</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contact Us</h4>
            <div className="space-y-1 text-gray-600 text-sm">
              <p>1 Vo Van Ngan Street, Ho Chi Minh City</p>
              <p>Email: quetaste@gmail.com</p>
              <p>Phone: (+84) 0862267674</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Newsletter</h4>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="w-full px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-opacity-90">
                Subscribe
              </button>
              <div className="flex space-x-3">
                <FaFacebookF className="text-gray-600 hover:text-primary cursor-pointer" />
                <FaTwitter className="text-gray-600 hover:text-primary cursor-pointer" />
                <FaInstagram className="text-gray-600 hover:text-primary cursor-pointer" />
                <FaYoutube className="text-gray-600 hover:text-primary cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 pt-4 border-t text-sm">
          <p>&copy; 2025 QueTaste. Gìn giữ hương vị quê hương, kết nối mọi miền.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;