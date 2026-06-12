import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createHotelPayment, clearDraftPayment } from "../slices/bookingSlice";

const formatVnd = (n) => {
  if (typeof n !== "number" || Number.isNaN(n)) return null;
  return n.toLocaleString("vi-VN") + " VND";
};

export function usePaymentMethodPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const typeParam = (params.get("type") || "").toLowerCase(); // hotel | restaurant
  const draft = useSelector((s) => s.booking.draftPayment);
  const payLoading = useSelector((s) => s.booking.payment.loading);
  const payError = useSelector((s) => s.booking.payment.error);

  const [modal, setModal] = useState({ open: false, title: t("booking.notification"), message: "" });

  const meta = draft?.meta;
  const amountText = useMemo(() => formatVnd(meta?.amount), [meta?.amount]);

  const showMissing = !draft?.payload;

  const openModal = useCallback((message, title = t("booking.notification")) => {
    setModal({ open: true, title, message });
  }, [t]);

  const closeModal = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

  const goBack = useCallback(() => navigate(-1), [navigate]);

  const onPickMethod = useCallback(
    async (method) => {
      if (!method?.supported) {
        openModal(
          t("booking.payment_method_not_supported", { method: method?.label }),
          t("booking.not_supported")
        );
        return;
      }

      // hiện tại implement HOTEL trước
      const canPayHotel = draft?.type === "HOTEL" && !!draft?.payload;

      if (typeParam !== "hotel" || !canPayHotel) {
        openModal(t("booking.invalid_order_or_no_draft"), t("booking.error"));
        return;
      }

      try {
        const result = await dispatch(
          createHotelPayment({
            ...draft.payload,
            gateway: method.key, // MOMO | VNPAY | ZALOPAY
          })
        ).unwrap();

        const url = result?.payUrl || result?.paymentUrl;
        if (!url) {
          openModal(t("booking.no_payment_url"), t("booking.error"));
          return;
        }

        dispatch(clearDraftPayment());
        window.location.href = url;
      } catch (e) {
        const msg = typeof e === "string" ? e : (e?.message || e?.error);
        openModal(msg || t("booking.create_payment_failed"), t("booking.error"));
      }
    },
    [dispatch, draft, openModal, typeParam, t]
  );

  return {
    typeParam,
    draft,
    meta,
    amountText,
    showMissing,
    payLoading,
    payError,
    modal,
    closeModal,
    goBack,
    onPickMethod,
    goHome: () => navigate("/"),
  };
}