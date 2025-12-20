"use client";

import AdminLayout from "../components/AdminLayout";
import ConfirmModal from "../../../components/ConfirmModal";

import { ui } from "../components/place/place-detail/uiTokens";
import PlaceTopBar from "../components/place/place-detail/PlaceTopBar";
import PlaceBasicCard from "../components/place/place-detail/PlaceBasicCard";
import PlaceLocationCard from "../components/place/place-detail/PlaceLocationCard";
import PlaceImagesCard from "../components/place/place-detail/PlaceImagesCard";
import PlaceContentCard from "../components/place/place-detail/PlaceContentCard";

import { useAdminPlaceDetail } from "../hooks/useAdminPlaceDetail";

export default function AdminPlaceDetailPage() {
  const d = useAdminPlaceDetail();

  return (
    <AdminLayout>
      <div className={ui.pageBg}>
        <div className="mx-auto w-full max-w-8xl px-4 py-6">
          <PlaceTopBar
            headerTitle={d.headerTitle}
            isCreate={d.isCreate}
            isEditing={d.isEditing}
            form={d.form}
            loading={d.loading}
            saving={d.saving}
            deleting={d.deleting}
            dirty={d.dirty}
            onBack={d.goBack}
            onEdit={d.startEdit}
            onCancel={d.startCancelEdit}
            onSave={d.onSave}
            onToggleLock={d.onToggleLock}
            onAskDelete={d.askDelete}
          />

          {d.loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-1">
                <PlaceBasicCard
                  form={d.form}
                  setField={d.setField}
                  isLockedReadOnly={d.isLockedReadOnly}
                />
                <PlaceLocationCard
                  form={d.form}
                  setField={d.setField}
                  isLockedReadOnly={d.isLockedReadOnly}
                />
              </div>

              <div className="space-y-4 lg:col-span-2">
                <PlaceImagesCard
                  images={d.form.images || []}
                  isLockedReadOnly={d.isLockedReadOnly}
                  onAdd={d.addImage}
                  onChangeField={d.updateImageField}
                  onRemoveRow={d.removeImageRow}
                  onUploadRow={d.uploadImageToRow}
                />

                <PlaceContentCard
                  blocks={d.form.content || []}
                  isLockedReadOnly={d.isLockedReadOnly}
                  onAddBlock={d.addBlock}
                  onMoveBlock={d.moveBlock}
                  onRemoveBlock={d.removeBlock}
                  onPatchBlock={d.patchBlock}
                  onUploadBlockImage={d.uploadBlockImage}
                  onGalleryAddItem={d.addGalleryItem}
                  onGalleryUpdateItem={d.updateGalleryItem}
                  onGalleryRemoveItem={d.removeGalleryItem}
                  onUploadGalleryItem={d.uploadGalleryItem}
                />
              </div>
            </div>
          )}

          <ConfirmModal
            open={d.leaveOpen}
            title="Chưa lưu thay đổi"
            message="Bạn có thay đổi chưa được lưu. Rời trang sẽ mất dữ liệu. Bạn chắc chắn muốn thoát?"
            confirmText="Thoát"
            cancelText="Ở lại"
            onClose={() => d.setLeaveOpen(false)}
            onConfirm={d.onConfirmLeave}
          />

          <ConfirmModal
            open={d.deleteOpen}
            title="Xóa địa điểm"
            message={`Xóa sẽ không thể khôi phục. Bạn có chắc muốn xóa "${d.form.name || d.form.slug || ""}" không?`}
            confirmText="Xóa"
            cancelText="Hủy"
            onClose={() => d.setDeleteOpen(false)}
            onConfirm={d.confirmDelete}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
