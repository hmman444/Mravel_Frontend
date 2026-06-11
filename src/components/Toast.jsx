// src/components/Toast.jsx
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Toast = ({ position = "top-right", autoClose = 3000, ...rest }) => (
  <ToastContainer
    position={position}
    autoClose={autoClose}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    {...rest}
  />
);

export default Toast;
