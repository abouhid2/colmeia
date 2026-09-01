import { PRIORITIES } from "../../domain/priorities";
import type { Priority } from "../../domain/types";
import { cn } from "../../lib/cn";
import { Badge } from "../ui/Badge";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITIES[priority];
  return (
    <Badge tone={meta.tone} icon={<span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />}>
      {meta.label}
    </Badge>
  );
}
