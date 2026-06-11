import {
  PhotoIcon,
  MapPinIcon,
  DocumentTextIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";

export const BLOCK_TYPES = [
  { type: "HEADING", labelKey: "admin.block_type_heading", icon: DocumentTextIcon },
  { type: "PARAGRAPH", labelKey: "admin.block_type_paragraph", icon: DocumentTextIcon },
  { type: "QUOTE", labelKey: "admin.block_type_quote", icon: DocumentTextIcon },
  { type: "IMAGE", labelKey: "admin.block_type_image", icon: PhotoIcon },
  { type: "GALLERY", labelKey: "admin.block_type_gallery", icon: RectangleGroupIcon },
  { type: "INFO", labelKey: "admin.block_type_info", icon: DocumentTextIcon },
  { type: "DIVIDER", labelKey: "admin.block_type_divider", icon: DocumentTextIcon },
  { type: "MAP", labelKey: "admin.block_type_map", icon: MapPinIcon },
];

export const emptyBlock = (type) => {
  switch (type) {
    case "HEADING":
    case "PARAGRAPH":
    case "QUOTE":
    case "INFO":
      return { type, text: "" };
    case "IMAGE":
      return { type, image: { url: "", caption: "" } };
    case "GALLERY":
      return { type, gallery: [{ url: "", caption: "", sortOrder: 0 }] };
    case "DIVIDER":
      return { type };
    case "MAP":
      return { type, mapLocation: { lon: "", lat: "" } };
    default:
      return { type: "PARAGRAPH", text: "" };
  }
};
