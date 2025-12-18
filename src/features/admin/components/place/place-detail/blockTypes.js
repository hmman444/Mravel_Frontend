import {
  PhotoIcon,
  MapPinIcon,
  DocumentTextIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";

export const BLOCK_TYPES = [
  { type: "HEADING", label: "Heading", icon: DocumentTextIcon },
  { type: "PARAGRAPH", label: "Paragraph", icon: DocumentTextIcon },
  { type: "QUOTE", label: "Quote", icon: DocumentTextIcon },
  { type: "IMAGE", label: "Image", icon: PhotoIcon },
  { type: "GALLERY", label: "Gallery", icon: RectangleGroupIcon },
  { type: "INFO", label: "Info box", icon: DocumentTextIcon },
  { type: "DIVIDER", label: "Divider", icon: DocumentTextIcon },
  { type: "MAP", label: "Map", icon: MapPinIcon },
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
