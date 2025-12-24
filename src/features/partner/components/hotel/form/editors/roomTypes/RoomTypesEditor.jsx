import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";
import AmenityMultiSelect from "../../controls/AmenityMultiSelect";

import { TEXT } from "./roomTypes.text";
import { asArray, asPosInt, asString, genRoomCodeFromName, isObj, normalizeRoom, capLen, sanitizeNumberStr } from "./roomTypes.utils";
import RoomImagesEditor from "./RoomImagesEditor";
import BedsEditor from "./BedsEditor";
import RatePlansEditor from "./RatePlansEditor";

export default function RoomTypesEditor({ roomAmenities = [], value = [], onChange }) {
  const rooms = useMemo(() => asArray(value).map(normalizeRoom), [value]);

  const emit = (next) => {
    try {
      onChange?.(next);
    } catch (e) {
      console.error("RoomTypesEditor onChange error:", e);
    }
  };

  const addRoom = () => {
    emit([
      ...rooms,
      normalizeRoom({
        name: "",
        code: "",
        codeManual: false,
        description: "",
        areaM2: "",
        maxAdults: 2,
        maxChildren: 0,
        beds: [{ type: "DOUBLE", count: 1 }],
        quantity: 1,
        images: [],
        amenities: [],
        ratePlans: [{ name: "Standard", code: "STANDARD", refundable: true, pricePerNight: "" }],
      }),
    ]);
  };

  const removeRoom = (idx) => emit(rooms.filter((_, i) => i !== idx));

  const move = (idx, dir) => {
    const arr = [...rooms];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    emit(arr);
  };

  const setRoom = (idx, patch) => {
    const arr = [...rooms];
    const cur = normalizeRoom(arr[idx]);
    arr[idx] = normalizeRoom({ ...cur, ...(isObj(patch) ? patch : {}) });
    emit(arr);
  };

  const onChangeName = (idx, nextName) => {
    const cur = normalizeRoom(rooms[idx]);
    const name = asString(nextName, "");
    const patch = { name };
    if (!cur.codeManual) patch.code = genRoomCodeFromName(name);
    setRoom(idx, patch);
  };

  const onChangeCode = (idx, nextCode) => setRoom(idx, { code: asString(nextCode, ""), codeManual: true });

  return (
    <div className="rounded-2xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">{TEXT.SECTION_TITLE}</div>
          <div className="text-xs text-gray-500 mt-0.5">{TEXT.SECTION_HINT}</div>
        </div>
        <button
          type="button"
          onClick={addRoom}
          className="px-3 py-2 rounded-xl border hover:bg-gray-50 flex items-center gap-2 text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          {TEXT.ADD_ROOM}
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-sm text-gray-500">Chưa có loại phòng.</div>
      ) : (
        <div className="space-y-3">
          {rooms.map((r, idx) => (
            <div key={idx} className="rounded-2xl border p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">
                    {TEXT.ROOM_PREFIX} #{idx + 1} — {r.name || TEXT.ROOM_UNNAMED}
                  </div>
                  <div className="text-xs text-gray-500">
                    {TEXT.CODE_LABEL}: {r.code || "—"}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title={TEXT.MOVE_UP}
                  >
                    <ChevronUpIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title={TEXT.MOVE_DOWN}
                  >
                    <ChevronDownIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRoom(idx)}
                    className="p-2 rounded-lg hover:bg-red-50"
                    title={TEXT.DELETE_ROOM}
                  >
                    <TrashIcon className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Basic */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm">
                  <div className="font-medium mb-1">{TEXT.BASIC_NAME}</div>
                  <input
                    value={asString(r.name)}
                    onChange={(e) => onChangeName(idx, e.target.value)}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="Deluxe Double"
                  />
                </label>

                <label className="text-sm">
                  <div className="font-medium mb-1">{TEXT.BASIC_CODE}</div>
                  <input
                    value={asString(r.code)}
                    onChange={(e) => onChangeCode(idx, e.target.value)}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="DLX_DOUBLE"
                  />
                  <div className="text-[11px] text-gray-400 mt-1">
                    {r.codeManual ? TEXT.CODE_MANUAL : TEXT.CODE_AUTO}
                  </div>
                </label>

                <label className="text-sm md:col-span-2">
                  <div className="font-medium mb-1">{TEXT.BASIC_DESC}</div>
                  <div className="relative">
                    <textarea
                      value={asString(r.description)}
                      maxLength={200}
                      onChange={(e) => setRoom(idx, { description: capLen(e.target.value, 200) })}
                      className="w-full border rounded-xl px-3 py-2 min-h-[90px] pr-14 pb-7"
                    />
                    <div className="pointer-events-none absolute right-3 bottom-2 text-[11px] text-gray-400">
                      {asString(r.description).length}/200
                    </div>
                  </div>
                </label>

                <label className="text-sm">
                  <div className="font-medium mb-1">{TEXT.BASIC_AREA}</div>
                  <input
                    inputMode="decimal"
                    value={asString(r.areaM2)}
                    onChange={(e) => setRoom(idx, { areaM2: sanitizeNumberStr(e.target.value) })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="28.5"
                  />
                </label>

                <label className="text-sm">
                  <div className="font-medium mb-1">{TEXT.BASIC_QTY}</div>
                  <input
                    type="number"
                    min={0}
                    value={asPosInt(r.quantity, 0)}
                    onChange={(e) => setRoom(idx, { quantity: asPosInt(e.target.value, 0) })}
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </label>

                <label className="text-sm">
                  <div className="font-medium mb-1">{TEXT.BASIC_MAX_ADULTS}</div>
                  <input
                    type="number"
                    min={0}
                    value={asPosInt(r.maxAdults, 0)}
                    onChange={(e) => setRoom(idx, { maxAdults: asPosInt(e.target.value, 0) })}
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </label>

                <label className="text-sm">
                  <div className="font-medium mb-1">{TEXT.BASIC_MAX_CHILDREN}</div>
                  <input
                    type="number"
                    min={0}
                    value={asPosInt(r.maxChildren, 0)}
                    onChange={(e) => setRoom(idx, { maxChildren: asPosInt(e.target.value, 0) })}
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </label>
              </div>

              {/* Images */}
              <RoomImagesEditor
                images={asArray(r.images)}
                onChange={(next) => setRoom(idx, { images: asArray(next) })}
              />

              {/* Beds */}
              <BedsEditor
                beds={asArray(r.beds)}
                onChange={(next) => setRoom(idx, { beds: asArray(next) })}
              />

              {/* Rate plans */}
              <RatePlansEditor
                ratePlans={asArray(r.ratePlans)}
                onChange={(next) => setRoom(idx, { ratePlans: asArray(next) })}
              />

              {/* Amenities */}
              <AmenityMultiSelect
                title={TEXT.AMENITIES_TITLE}
                hint={TEXT.AMENITIES_HINT}
                items={asArray(roomAmenities)}
                value={asArray(r.amenities)}
                onChange={(next) => setRoom(idx, { amenities: asArray(next) })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}