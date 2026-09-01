import { useId } from "react";
import { honeycombCells, honeycombColumns } from "../../domain/honeycomb";

const RADIUS = 10;
const CELL_WIDTH = Math.sqrt(3) * RADIUS;
const CELL_HEIGHT = 2 * RADIUS;
const ROW_STEP = 1.5 * RADIUS;
const STAGGER_MS = 28;

function hexagonPath(cx: number, cy: number): string {
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 180) * (60 * index - 30);
    return `${(cx + RADIUS * Math.cos(angle)).toFixed(2)},${(cy + RADIUS * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join("L")}Z`;
}

interface HoneycombProps {
  earned: number;
  target: number;
  label: string;
}

/** The household goal as a comb that fills with honey, one cell per chunk of points. */
export function Honeycomb({ earned, target, label }: HoneycombProps) {
  const id = useId();
  const cells = honeycombCells(earned, target);
  const columns = honeycombColumns(cells.length);
  const rows = Math.ceil(cells.length / columns);
  const width = columns * CELL_WIDTH + (rows > 1 ? CELL_WIDTH / 2 : 0);
  const height = (rows - 1) * ROW_STEP + CELL_HEIGHT;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto w-full max-w-xl" role="img" aria-label={label}>
      {cells.map((fill, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        const cx = column * CELL_WIDTH + CELL_WIDTH / 2 + (row % 2 === 1 ? CELL_WIDTH / 2 : 0);
        const cy = row * ROW_STEP + RADIUS;
        const path = hexagonPath(cx, cy);
        const clipId = `${id}-${index}`;
        return (
          <g key={index} className="hex-cell motion-safe:animate-cell-pop" style={{ animationDelay: `${index * STAGGER_MS}ms` }}>
            <path d={path} className="fill-honey-100 stroke-line-strong" strokeWidth={0.6} />
            {fill > 0 && (
              <>
                <clipPath id={clipId}>
                  <rect x={cx - CELL_WIDTH / 2} y={cy + RADIUS - CELL_HEIGHT * fill} width={CELL_WIDTH} height={CELL_HEIGHT * fill} />
                </clipPath>
                <path d={path} className="fill-honey-500" clipPath={`url(#${clipId})`} />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
