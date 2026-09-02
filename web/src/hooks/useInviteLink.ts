import { useCallback } from "react";
import { buildInviteUrl } from "../domain/inviteCode";
import { useApi } from "./useApi";
import { useToast } from "./useToast";

const LOCAL_WARNING = "No modo demonstração o link só abre neste navegador.";

/** The address of a colmeia, ready to be pasted into a family group chat. */
export function useInviteLink(inviteCode: string | undefined) {
  const api = useApi();
  const { notify } = useToast();
  const isLocal = api.mode === "local";
  const url = inviteCode === undefined ? "" : buildInviteUrl(window.location.origin, import.meta.env.BASE_URL, inviteCode);
  const canCopy = typeof navigator !== "undefined" && navigator.clipboard !== undefined;

  const copy = useCallback(async (): Promise<boolean> => {
    if (!canCopy || url === "") return false;
    try {
      await navigator.clipboard.writeText(url);
      notify({ tone: "success", message: isLocal ? `Link copiado. ${LOCAL_WARNING}` : "Link copiado" });
      return true;
    } catch {
      return false;
    }
  }, [ canCopy, url, isLocal, notify ]);

  return { url, isLocal, canCopy, copy, localWarning: LOCAL_WARNING };
}
