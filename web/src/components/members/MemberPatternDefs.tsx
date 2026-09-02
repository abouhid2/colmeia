import type { ReactNode } from "react";
import { MEMBER_COLORS } from "../../domain/memberColors";
import type { Member, MemberPattern } from "../../domain/types";

/** Enough of a person to draw the fill that stands for them. */
export type MarkedMember = Pick<Member, "id" | "color" | "pattern">;

/** Where one member's fill lives inside a single scope of ids. */
export function memberPatternId(scope: string, memberId: number): string {
  return `${scope}-texture-${memberId}`;
}

interface Tile {
  width: number;
  height: number;
  /** Turns the whole lattice, for the textures drawn on the diagonal. */
  rotate?: number;
  content: ReactNode;
}

/** Every texture as one repeating tile, measured in fractions of `unit`, so the
 *  same drawing holds up on a 30px honeycomb cell and on an 18px swatch. */
function tileFor(pattern: MemberPattern, unit: number, fill: string, soft: string): Tile {
  const ground = (width: number, height: number) => <rect width={width} height={height} className={soft} />;
  const half = unit / 2;

  switch (pattern) {
    case "dots":
      return {
        width: unit, height: unit,
        content: <>{ground(unit, unit)}<circle cx={half} cy={half} r={unit * 0.26} className={fill} /></>,
      };
    case "stripes":
      return {
        width: unit, height: unit, rotate: 45,
        content: <>{ground(unit, unit)}<rect width={unit * 0.44} height={unit} className={fill} /></>,
      };
    case "crosses":
      return {
        width: unit, height: unit,
        content: (
          <>
            {ground(unit, unit)}
            <rect x={unit * 0.18} y={unit * 0.4} width={unit * 0.64} height={unit * 0.2} className={fill} />
            <rect x={unit * 0.4} y={unit * 0.18} width={unit * 0.2} height={unit * 0.64} className={fill} />
          </>
        ),
      };
    case "checks":
      return {
        width: unit, height: unit,
        content: (
          <>
            {ground(unit, unit)}
            <rect width={half} height={half} className={fill} />
            <rect x={half} y={half} width={half} height={half} className={fill} />
          </>
        ),
      };
    case "waves":
      return { width: unit * 1.5, height: unit, content: <>{ground(unit * 1.5, unit)}<path d={wavePath(unit)} className={fill} /></> };
    case "rings":
      return {
        width: unit, height: unit,
        content: (
          <>
            {ground(unit, unit)}
            <circle cx={half} cy={half} r={unit * 0.36} className={fill} />
            <circle cx={half} cy={half} r={unit * 0.19} className={soft} />
          </>
        ),
      };
    case "solid":
      return { width: unit, height: unit, content: <rect width={unit} height={unit} className={fill} /> };
  }
}

/** One crest and one trough, thick enough to survive a small cell. The tile
 *  leaves and arrives at the same height, so the wave runs on without a seam. */
function wavePath(unit: number): string {
  const width = unit * 1.5;
  const middle = unit / 2;
  const amplitude = unit * 0.24;
  const thickness = unit * 0.13;
  const top = middle - thickness;
  const bottom = middle + thickness;
  return [
    `M0,${top}`,
    `Q${width / 4},${top - amplitude} ${width / 2},${top}`,
    `T${width},${top}`,
    `L${width},${bottom}`,
    `Q${(width * 3) / 4},${bottom + amplitude} ${width / 2},${bottom}`,
    `T0,${bottom}`,
    "Z",
  ].join(" ");
}

interface MemberPatternDefsProps {
  /** Unique per rendered SVG, so two combs on one page keep their own ids. */
  scope: string;
  members: MarkedMember[];
  /** Side of one repeat, in the units of the SVG that holds these defs. */
  unit: number;
}

/** The `<defs>` a member's fill needs: one SVG pattern each, in their colour
 *  and their texture. Whoever renders it references memberPatternId. */
export function MemberPatternDefs({ scope, members, unit }: MemberPatternDefsProps) {
  return (
    <defs>
      {members.map((member) => {
        const { fill, fillSoft } = MEMBER_COLORS[member.color];
        const tile = tileFor(member.pattern, unit, fill, fillSoft);
        return (
          <pattern
            key={member.id}
            id={memberPatternId(scope, member.id)}
            patternUnits="userSpaceOnUse"
            width={tile.width}
            height={tile.height}
            patternTransform={tile.rotate === undefined ? undefined : `rotate(${tile.rotate})`}
          >
            {tile.content}
          </pattern>
        );
      })}
    </defs>
  );
}
