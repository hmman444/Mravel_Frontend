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
import { useTranslation } from "react-i18next";

export function usePaymentMethods() {
  const { t } = useTranslation();
  return [
    {
      title: t("booking.payment_group_ewallet_qr"),
      items: [
        {
          key: "MOMO",
          label: "MoMo",
          supported: true,
          iconSrc: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png",
          icon: FaWallet,
          badge: t("booking.payment_badge_supported"),
        },
        {
          key: "VNPAY",
          label: "VNPay",
          supported: true,
          iconSrc: "https://itviec.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6NDAzODMzMCwicHVyIjoiYmxvYl9pZCJ9fQ==--d01b1b407f49d33d4ea19b9218e10da4dc7f231d/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fbGltaXQiOlszMDAsMzAwXX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--e1d036817a0840c585f202e70291f5cdd058753d/logo%20d%E1%BB%8Dc.png",
          icon: FaQrcode,
          badge: t("booking.payment_badge_supported"),
        },
        {
          key: "ZALOPAY",
          label: "ZaloPay",
          supported: false,
          iconSrc: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png",
          icon: FaWallet,
        },
      ],
    },
    {
      title: t("booking.payment_group_card"),
      items: [
        { key: "VISA", label: "Visa", supported: false, iconSrc: "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png", icon: FaCcVisa },
        { key: "MASTERCARD", label: "Mastercard", supported: false, iconSrc: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg", icon: FaCcMastercard },
        { key: "JCB", label: "JCB", supported: false, iconSrc: "https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg", icon: FaCcJcb },
        { key: "CREDIT_CARD", label: t("booking.payment_credit_card"), supported: false, icon: FaRegCreditCard },
      ],
    },
    {
      title: t("booking.payment_group_bank"),
      items: [
        { key: "ATM_BANK", label: t("booking.payment_atm_bank"), supported: false, icon: FaUniversity },
        { key: "INTERNET_BANKING", label: "Internet Banking", supported: false, icon: FaMoneyCheckAlt },
      ],
    },
    {
      title: t("booking.payment_group_other"),
      items: [
        { key: "APPLE_PAY", label: "Apple Pay", supported: false, icon: FaApplePay },
        { key: "GOOGLE_PAY", label: "Google Pay", supported: false, icon: FaGooglePay },
      ],
    },
  ];
}