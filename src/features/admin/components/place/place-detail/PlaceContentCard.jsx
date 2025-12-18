import { PlusIcon } from "@heroicons/react/24/outline";
import { ui } from "./uiTokens";
import { BLOCK_TYPES } from "./blockTypes";
import PlaceBlockRow from "./PlaceBlockRow";

export default function PlaceContentCard({
  blocks,
  isLockedReadOnly,
  onAddBlock,
  onMoveBlock,
  onRemoveBlock,
  onPatchBlock,
  onUploadBlockImage,
  onGalleryAddItem,
  onGalleryUpdateItem,
  onGalleryRemoveItem,
  onUploadGalleryItem,
}) {
  return (
    <div className={ui.card}>
      <div className={ui.cardHeader}>
        <div>
          <div className={ui.title}>Nội dung (Content blocks)</div>
          <div className={ui.sub}>Heading/Paragraph/Quote/Image/Gallery/Info/Divider/Map</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={`${ui.btn} ${ui.btnGhost}`} onClick={() => onAddBlock("HEADING")} disabled={isLockedReadOnly}>
            + Heading
          </button>
          <button type="button" className={`${ui.btn} ${ui.btnGhost}`} onClick={() => onAddBlock("PARAGRAPH")} disabled={isLockedReadOnly}>
            + Paragraph
          </button>
          <button type="button" className={`${ui.btn} ${ui.btnGhost}`} onClick={() => onAddBlock("IMAGE")} disabled={isLockedReadOnly}>
            + Image
          </button>

          <div className="relative">
            <details className={isLockedReadOnly ? "pointer-events-none opacity-50" : ""}>
              <summary className={`${ui.btn} ${ui.btnPrimary} cursor-pointer list-none`}>
                <span className="inline-flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  Thêm khác
                </span>
              </summary>

              <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                {BLOCK_TYPES.filter((b) => !["HEADING", "PARAGRAPH", "IMAGE"].includes(b.type)).map((b) => (
                  <button
                    key={b.type}
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
                    onClick={() => onAddBlock(b.type)}
                  >
                    <b.icon className="h-5 w-5 text-slate-500" />
                    {b.label}
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>

      <div className={ui.cardBody}>
        {!blocks || blocks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            Chưa có nội dung. Hãy thêm Heading/Paragraph để bắt đầu.
          </div>
        ) : (
          <div className="space-y-3">
            {blocks.map((b, idx) => (
              <PlaceBlockRow
                key={idx}
                idx={idx}
                block={b}
                isLockedReadOnly={isLockedReadOnly}
                onMove={onMoveBlock}
                onRemove={onRemoveBlock}
                onPatch={onPatchBlock}
                onUploadBlockImage={onUploadBlockImage}
                onGalleryAddItem={onGalleryAddItem}
                onGalleryUpdateItem={onGalleryUpdateItem}
                onGalleryRemoveItem={onGalleryRemoveItem}
                onUploadGalleryItem={onUploadGalleryItem}
              />
            ))}
          </div>
        )}

        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <b>Gợi ý seed-style:</b> Heading → Quote → Paragraph → Image → Paragraph → Gallery → Info → Divider → Map.
        </div>
      </div>
    </div>
  );
}
