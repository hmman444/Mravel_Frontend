import { useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createHotelPayment, clearDraftPayment } from "../slices/bookingSlice";

const formatVnd = (n) => {
  if (typeof n !== "number" || Number.isNaN(n)) return null;
  return n.toLocaleString("vi-VN") + " VND";
};

export function usePaymentMethodPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const typeParam = (params.get("type") || "").toLowerCase(); // hotel | restaurant
  const draft = useSelector((s) => s.booking.draftPayment);
  const payLoading = useSelector((s) => s.booking.payment.loading);
  const payError = useSelector((s) => s.booking.payment.error);

  const [modal, setModal] = useState({ open: false, title: "Thông báo", message: "" });

  const meta = draft?.meta;
  const amountText = useMemo(() => formatVnd(meta?.amount), [meta?.amount]);

  const showMissing = !draft?.payload;

  const openModal = useCallback((message, title = "Thông báo") => {
    setModal({ open: true, title, message });
  }, []);

  const closeModal = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

  const goBack = useCallback(() => navigate(-1), [navigate]);

  const onPickMethod = useCallback(
    async (method) => {
      if (!method?.supported) {
        openModal(
          `Phương thức “${method?.label}” hiện chưa được hỗ trợ. Vui lòng chọn MoMo / VNPay / ZaloPay.`,
          "Chưa hỗ trợ"
        );
        return;
      }

      // hiện tại implement HOTEL trước
      const canPayHotel = draft?.type === "HOTEL" && !!draft?.payload;

      if (typeParam !== "hotel" || !canPayHotel) {
        openModal("Dữ liệu đơn không hợp lệ hoặc chưa có draft thanh toán.", "Lỗi");
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
          openModal("Không nhận được URL thanh toán từ hệ thống.", "Lỗi");
          return;
        }

        dispatch(clearDraftPayment());
        window.location.href = url;
      } catch (e) {
        openModal(typeof e === "string" ? e : "Tạo thanh toán thất bại.", "Lỗi");
      }
    },
    [dispatch, draft, openModal, typeParam]
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