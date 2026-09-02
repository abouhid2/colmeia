import type { MemberColor } from "./types";

interface MemberColorMeta {
  label: string;
  chip: string;
  bar: string;
  swatch: string;
  /** SVG fill for the bee stripes, so BeeAvatar stays on the palette. */
  stripe: string;
}

export const MEMBER_COLORS: Record<MemberColor, MemberColorMeta> = {
  honey: { label: "Mel", chip: "bg-honey-100 text-honey-700", bar: "bg-honey-500", swatch: "bg-honey-400", stripe: "fill-honey-600" },
  pollen: { label: "Pólen", chip: "bg-pollen-100 text-pollen-700", bar: "bg-pollen-500", swatch: "bg-pollen-500", stripe: "fill-pollen-500" },
  leaf: { label: "Folha", chip: "bg-leaf-100 text-leaf-700", bar: "bg-leaf-500", swatch: "bg-leaf-500", stripe: "fill-leaf-500" },
  berry: { label: "Amora", chip: "bg-berry-100 text-berry-700", bar: "bg-berry-500", swatch: "bg-berry-500", stripe: "fill-berry-500" },
  sky: { label: "Céu", chip: "bg-lake-100 text-lake-700", bar: "bg-lake-500", swatch: "bg-lake-500", stripe: "fill-lake-500" },
  plum: { label: "Ameixa", chip: "bg-plum-100 text-plum-700", bar: "bg-plum-500", swatch: "bg-plum-500", stripe: "fill-plum-500" },
};

export const MEMBER_COLOR_OPTIONS = Object.keys(MEMBER_COLORS) as MemberColor[];

export const AVATAR_OPTIONS = ["🐝", "🦊", "🐻", "🐼", "🦉", "🐸", "🐙", "🦁", "🐨", "🦄", "🐧", "🐢"];
