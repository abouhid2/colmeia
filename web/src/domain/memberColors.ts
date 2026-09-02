import type { MemberColor } from "./types";

interface MemberColorMeta {
  label: string;
  chip: string;
  bar: string;
  swatch: string;
  /** SVG fill for the bee stripes, so BeeAvatar stays on the palette. */
  stripe: string;
  /** SVG fill for the marks of a pattern. */
  fill: string;
  /** SVG fill for the ground a pattern is drawn on. */
  fillSoft: string;
}

export const MEMBER_COLORS: Record<MemberColor, MemberColorMeta> = {
  honey: { label: "Mel", chip: "bg-honey-100 text-honey-700", bar: "bg-honey-500", swatch: "bg-honey-400", stripe: "fill-honey-600", fill: "fill-honey-500", fillSoft: "fill-honey-100" },
  pollen: { label: "Pólen", chip: "bg-pollen-100 text-pollen-700", bar: "bg-pollen-500", swatch: "bg-pollen-500", stripe: "fill-pollen-500", fill: "fill-pollen-500", fillSoft: "fill-pollen-100" },
  leaf: { label: "Folha", chip: "bg-leaf-100 text-leaf-700", bar: "bg-leaf-500", swatch: "bg-leaf-500", stripe: "fill-leaf-500", fill: "fill-leaf-500", fillSoft: "fill-leaf-100" },
  berry: { label: "Amora", chip: "bg-berry-100 text-berry-700", bar: "bg-berry-500", swatch: "bg-berry-500", stripe: "fill-berry-500", fill: "fill-berry-500", fillSoft: "fill-berry-100" },
  sky: { label: "Céu", chip: "bg-lake-100 text-lake-700", bar: "bg-lake-500", swatch: "bg-lake-500", stripe: "fill-lake-500", fill: "fill-lake-500", fillSoft: "fill-lake-100" },
  plum: { label: "Ameixa", chip: "bg-plum-100 text-plum-700", bar: "bg-plum-500", swatch: "bg-plum-500", stripe: "fill-plum-500", fill: "fill-plum-500", fillSoft: "fill-plum-100" },
};

export const MEMBER_COLOR_OPTIONS = Object.keys(MEMBER_COLORS) as MemberColor[];

/** The colmeia is a hive: everybody in it is a bicho de jardim. */
export const AVATAR_OPTIONS = ["🐝", "🦋", "🐞", "🐜", "🐛", "🦗", "🕷️", "🪲", "🐌", "🦂"];
