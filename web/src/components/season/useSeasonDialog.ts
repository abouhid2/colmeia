import { useCallback, useState } from "react";
import type { Season } from "../../domain/types";

export function useSeasonDialog() {
  const [isOpen, setOpen] = useState(false);
  const [season, setSeason] = useState<Season | null>(null);

  const openCreate = useCallback(() => { setSeason(null); setOpen(true); }, []);
  const openEdit = useCallback((target: Season) => { setSeason(target); setOpen(true); }, []);
  const close = useCallback(() => setOpen(false), []);

  return { isOpen, season, openCreate, openEdit, close };
}

export type SeasonDialogState = ReturnType<typeof useSeasonDialog>;
