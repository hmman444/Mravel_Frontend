import { ChevronUpIcon, ChevronDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ui } from "./uiTokens";

import BlockHeading from "./blocks/BlockHeading";
import BlockParagraph from "./blocks/BlockParagraph";
import BlockQuote from "./blocks/BlockQuote";
import BlockInfo from "./blocks/BlockInfo";
import BlockDivider from "./blocks/BlockDivider";
import BlockMap from "./blocks/BlockMap";
import BlockImage from "./blocks/BlockImage";
import BlockGallery from "./blocks/BlockGallery";

export default function PlaceBlockRow({
  idx,
  block,
  isLockedReadOnly,
  onMove,
  onRemove,
  onPatch,
  onUploadBlockImage,
  onGalleryAddItem,
  onGalleryUpdateItem,
  onGalleryRemoveItem,
  onUploadGalleryItem,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800/80">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            #{idx + 1}
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{block.type}</span>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className={`${ui.btn} ${ui.btnGhost} px-3`} disabled={isLockedReadOnly} onClick={() => onMove(idx, -1)} title="Lên">
            <ChevronUpIcon className="h-5 w-5" />
          </button>
          <button type="button" className={`${ui.btn} ${ui.btnGhost} px-3`} disabled={isLockedReadOnly} onClick={() => onMove(idx, 1)} title="Xuống">
            <ChevronDownIcon className="h-5 w-5" />
          </button>
          <button type="button" className={`${ui.btn} ${ui.btnGhost} px-3`} disabled={isLockedReadOnly} onClick={() => onRemove(idx)} title="Xóa block">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {block.type === "HEADING" && <BlockHeading idx={idx} block={block} isLockedReadOnly={isLockedReadOnly} onPatch={onPatch} />}
      {block.type === "PARAGRAPH" && <BlockParagraph idx={idx} block={block} isLockedReadOnly={isLockedReadOnly} onPatch={onPatch} />}
      {block.type === "QUOTE" && <BlockQuote idx={idx} block={block} isLockedReadOnly={isLockedReadOnly} onPatch={onPatch} />}
      {block.type === "INFO" && <BlockInfo idx={idx} block={block} isLockedReadOnly={isLockedReadOnly} onPatch={onPatch} />}
      {block.type === "DIVIDER" && <BlockDivider />}
      {block.type === "MAP" && <BlockMap idx={idx} block={block} isLockedReadOnly={isLockedReadOnly} onPatch={onPatch} />}
      {block.type === "IMAGE" && (
        <BlockImage
          idx={idx}
          block={block}
          isLockedReadOnly={isLockedReadOnly}
          onPatch={onPatch}
          onUpload={onUploadBlockImage}
        />
      )}
      {block.type === "GALLERY" && (
        <BlockGallery
          idx={idx}
          block={block}
          isLockedReadOnly={isLockedReadOnly}
          onAddItem={onGalleryAddItem}
          onUpdateItem={onGalleryUpdateItem}
          onRemoveItem={onGalleryRemoveItem}
          onUploadItem={onUploadGalleryItem}
        />
      )}
    </div>
  );
}
