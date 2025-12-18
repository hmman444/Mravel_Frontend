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
          iconSrc: "https://upload.wikimedia.org/wikipedia/vi/2/2f/VNPAY_logo.png",
          icon: FaQrcode,
          badge: "Hỗ trợ",
        },
        {
          key: "ZALOPAY",
          label: "ZaloPay",
          supported: true,
          iconSrc: "https://upload.wikimedia.org/wikipedia/commons/9/91/ZaloPay_Logo.png",
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