import { useId } from "react";
import { creditedContributions, honeycombColumns, honeycombSegments, type CellSegment, type Contribution } from "../../domain/honeycomb";
import { MemberPatternDefs, memberPatternId, type MarkedMember } from "../members/MemberPatternDefs";

const RADIUS = 10;
const CELL_WIDTH = Math.sqrt(3) * RADIUS;
const CELL_HEIGHT = 2 * RADIUS;
const ROW_STEP = 1.5 * RADIUS;
const STAGGER_MS = 28;
/** One repeat of a texture, small enough that three of them cross a cell. */
const PATTERN_UNIT = RADIUS * 0.6;

function hexagonPath(cx: number, cy: number): string {
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 180) * (60 * index - 30);
    return `${(cx + RADIUS * Math.cos(angle)).toFixed(2)},${(cy + RADIUS * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join("L")}Z`;
}

interface HoneycombCellProps {
  scope: string;
  index: number;
  cx: number;
  cy: number;
  segments: CellSegment[];
  /** Ids of the people whose texture this comb knows how to draw. */
  known: Set<number>;
}

/** One cell of the comb: empty wax, then a band per person who filled part of
 *  it, stacked from the bottom. Points nobody is credited with stay honey. */
function HoneycombCell({ scope, index, cx, cy, segments, known }: HoneycombCellProps) {
  const path = hexagonPath(cx, cy);
  return (
    <g className="hex-cell motion-safe:animate-cell-pop" style={{ animationDelay: `${index * STAGGER_MS}ms` }}>
      <path d={path} className="fill-honey-100 stroke-line-strong" strokeWidth={0.6} />
      {segments.map((segment, slot) => {
        const clipId = `${scope}-band-${index}-${slot}`;
        const owner = segment.memberId !== null && known.has(segment.memberId) ? segment.memberId : null;
        return (
          <g key={slot}>
            <clipPath id={clipId}>
              <rect
                x={cx - CELL_WIDTH / 2}
                y={cy + RADIUS - CELL_HEIGHT * segment.to}
                width={CELL_WIDTH}
                height={CELL_HEIGHT * (segment.to - segment.from)}
              />
            </clipPath>
            <path
              d={path}
              clipPath={`url(#${clipId})`}
              className={owner === null ? "fill-honey-500" : undefined}
              fill={owner === null ? undefined : `url(#${memberPatternId(scope, owner)})`}
            />
          </g>
        );
      })}
    </g>
  );
}

interface HoneycombProps {
  earned: number;
  target: number;
  label: string;
  /** Who put the points in, the biggest share first. */
  contributions?: Contribution[];
  /** The people those shares belong to, for their colour and their texture. */
  members?: MarkedMember[];
}

/** The goal as a comb that fills up, one cell per chunk of points, each cell
 *  wearing the texture of whoever filled it. */
export function Honeycomb({ earned, target, label, contributions = [], members = [] }: HoneycombProps) {
  const scope = useId();
  const cells = honeycombSegments(creditedContributions(contributions, earned), target);
  const columns = honeycombColumns(cells.length);
  const rows = Math.ceil(cells.length / columns);
  const width = columns * CELL_WIDTH + (rows > 1 ? CELL_WIDTH / 2 : 0);
  const height = (rows - 1) * ROW_STEP + CELL_HEIGHT;
  const known = new Set(members.map((member) => member.id));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto w-full max-w-xl" role="img" aria-label={label}>
      <MemberPatternDefs scope={scope} members={members} unit={PATTERN_UNIT} />
      {cells.map((segments, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        return (
          <HoneycombCell
            key={index}
            scope={scope}
            index={index}
            cx={column * CELL_WIDTH + CELL_WIDTH / 2 + (row % 2 === 1 ? CELL_WIDTH / 2 : 0)}
            cy={row * ROW_STEP + RADIUS}
            segments={segments}
            known={known}
          />
        );
      })}
    </svg>
  );
}
