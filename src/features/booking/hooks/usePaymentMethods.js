import {
  FaCcVisa,
  FaCcMastercard,
  FaCcJcb,
  FaCreditCard,
  FaUniversity,
  FaQrcode,
  FaWallet,
  FaMoneyCheckAlt,
  FaRegCreditCard,
  FaApplePay,
  FaGooglePay,
} from "react-icons/fa";

export function usePaymentMethods() {
  return [
    {
      title: "Ví điện tử & QR",
      items: [
        {
          key: "MOMO",
          label: "MoMo",
          supported: true,
          iconSrc: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
          icon: FaWallet,
          badge: "Hỗ trợ",
        },
        {
          key: "VNPAY",
          label: "VNPay",
          supported: true,
          iconSrc: "https://itviec.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NDAzODMzMCwicHVyIjoiYmxvYl9pZCJ9fQ==--d01b1b407f49d33d4ea19b9218e10da4dc7f231d/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fbGltaXQiOlszMDAsMzAwXX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--e1d036817a0840c585f202e70291f5cdd058753d/logo%20d%E1%BB%8Dc.png",
          icon: FaQrcode,
          badge: "Hỗ trợ",
        },
        {
          key: "ZALOPAY",
          label: "ZaloPay",
          supported: false,
          iconSrc: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png",
          icon: FaWallet,
          badge: "Hỗ trợ",
        },
      ],
    },
    {
      title: "Thẻ",
      items: [
        { key: "VISA", label: "Visa", supported: false, iconSrc: "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png", icon: FaCcVisa },
        { key: "MASTERCARD", label: "Mastercard", supported: false, iconSrc: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg", icon: FaCcMastercard },
        { key: "JCB", label: "JCB", supported: false, iconSrc: "https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg", icon: FaCcJcb },
        { key: "CREDIT_CARD", label: "Thẻ tín dụng", supported: false, icon: FaRegCreditCard },
      ],
    },
    {
      title: "Ngân hàng",
      items: [
        { key: "ATM_BANK", label: "ATM / Ngân hàng", supported: false, icon: FaUniversity },
        { key: "INTERNET_BANKING", label: "Internet Banking", supported: false, icon: FaMoneyCheckAlt },
      ],
    },
    {
      title: "Khác",
      items: [
        { key: "APPLE_PAY", label: "Apple Pay", supported: false, icon: FaApplePay },
        { key: "GOOGLE_PAY", label: "Google Pay", supported: false, icon: FaGooglePay },
      ],
    },
  ];
}